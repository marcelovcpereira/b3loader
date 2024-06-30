package db

import (
	"context"
	"errors"
	"fmt"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api/write"
	"github.com/marcelovcpereira/b3loader/internal/common"
	"time"
)

type InfluxQuoteDB struct {
	Client     influxdb2.Client
	Config     common.Config
	BufferSize int
}

func NewInfluxQuoteDB(config common.Config, buffer int) *InfluxQuoteDB {
	db := InfluxQuoteDB{
		Client:     nil,
		Config:     config,
		BufferSize: buffer,
	}
	db.Connect()
	return &db
}

func (db *InfluxQuoteDB) PersistQuotes(quotes []common.DailyQuote) error {
	writeAPI := db.Client.WriteAPIBlocking(db.Config.InfluxORG, db.Config.InfluxBucket)
	var points []*write.Point
	for _, quote := range quotes {
		point := common.DailyQuoteToInfluxPoint(quote)
		points = append(points, point)
	}
	fmt.Printf("Persisting %d points ...\n", len(points))
	err := db.retryableWritePoint(4, points)
	if err != nil {
		return err
	}

	// Flush writes
	writeAPI.Flush(context.Background())
	return nil
}

func (db *InfluxQuoteDB) retryableWritePoint(attempts int, points []*write.Point) error {
	currentAttempt := 1
	writeAPI := db.Client.WriteAPIBlocking(db.Config.InfluxORG, db.Config.InfluxBucket)
	backOff := 30
	for currentAttempt <= attempts {
		err := writeAPI.WritePoint(context.Background(), points...)
		if err != nil {
			fmt.Printf("!%d Error writing quotes batch: %+v\nSleeping %d\n", currentAttempt, err, backOff)
			time.Sleep(time.Duration(backOff) * time.Second)
			currentAttempt++
			backOff = int(float64(backOff) * 1.4)
			continue
		}
		return nil
	}

	return errors.New(fmt.Sprintf("!Total attempts exceeded...\nEXITING\n"))
}

func (db *InfluxQuoteDB) Connect() {
	fmt.Printf(
		"Connecting to influxdb at '%s' with token '%s'...\n",
		db.Config.InfluxURL,
		db.Config.InfluxToken,
	)
	client := influxdb2.NewClientWithOptions(
		db.Config.InfluxURL,
		db.Config.InfluxToken,
		influxdb2.DefaultOptions().SetBatchSize(uint(db.BufferSize)),
	)

	// validate client connection health
	check, err := client.Health(context.Background())
	if err != nil {
		fmt.Printf("ERROR CONNECTING TO INFLUXDB!!!!\nRetrying in 10s...\n")
		time.Sleep(10 * time.Second)
		db.Connect()
	}
	fmt.Printf("Connection health: %s\n", check.Status)
	db.Client = client
}

func (db *InfluxQuoteDB) Close() {
	db.Client.Close()
}
