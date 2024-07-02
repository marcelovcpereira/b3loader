package db

import (
	"context"
	"errors"
	"fmt"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api/write"
	"github.com/marcelovcpereira/b3loader/api/internal/common"
	"github.com/marcelovcpereira/b3loader/api/internal/util"
	"time"
)

const DefaultRetryAttempts = 5
const DefaultBackoffIntervalSeconds = 30
const DefaultBackoffFactor = 1.4

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
	fmt.Printf("DB: Converting batch of %d quotes to Influx points...\n", db.Config.QuoteFileLoaderBufferSize)
	fmt.Printf("DB: %s\n", quotes[len(quotes)-1].Date.Month())
	points := util.DailyQuotesToInfluxPoints(quotes)
	fmt.Printf("DB: Persisting %d points ...\n", len(points))
	err := db.RetryableWritePoints(DefaultRetryAttempts, points)
	if err != nil {
		return err
	}
	return nil
}

func (db *InfluxQuoteDB) RetryableWritePoints(attempts int, points []*write.Point) error {
	currentAttempt := 1
	writeAPI := db.Client.WriteAPIBlocking(db.Config.InfluxORG, db.Config.InfluxBucket)
	defer writeAPI.Flush(context.Background())
	backOff := DefaultBackoffIntervalSeconds
	for currentAttempt <= attempts {
		err := writeAPI.WritePoint(context.Background(), points...)
		if err != nil {
			fmt.Printf("DB: !%d Error writing quotes batch: %+v\nSleeping %d\n", currentAttempt, err, backOff)
			time.Sleep(time.Duration(backOff) * time.Second)
			currentAttempt++
			backOff = int(float64(backOff) * DefaultBackoffFactor)
			continue
		}
		return nil
	}
	return errors.New(fmt.Sprintf("DB: !Total attempts exceeded...\nEXITING\n"))
}

func (db *InfluxQuoteDB) Connect() {
	connected := false
	var client influxdb2.Client
	attempts := 0
	for !connected && attempts < DefaultRetryAttempts {
		fmt.Printf(
			"DB: Trying to connect to influxdb at '%s' with token '%s'...\n",
			db.Config.InfluxURL,
			db.Config.InfluxToken,
		)
		client = influxdb2.NewClientWithOptions(
			db.Config.InfluxURL,
			db.Config.InfluxToken,
			influxdb2.DefaultOptions().SetBatchSize(uint(db.BufferSize)),
		)
		check, err := client.Health(context.Background())
		if err != nil {
			fmt.Printf("DB: ERROR CONNECTING TO INFLUXDB: %v!!!!\nRetrying in %ds...\n", err, DefaultBackoffIntervalSeconds)
			attempts++
			time.Sleep(DefaultBackoffIntervalSeconds * time.Second)
		} else {
			fmt.Printf("DB: Connection health: %s\n", check.Status)
			connected = true
		}

	}

	db.Client = client
}

func (db *InfluxQuoteDB) Close() {
	db.Client.Close()
}

func (db *InfluxQuoteDB) GetStockValues(stockName string) []common.StockValue {
	measurement := "daily_quote"
	var stocks []common.StockValue
	query := fmt.Sprintf(
		`from(bucket: "%s")|> range(start: -3y)|> filter(fn: (r) => r["_measurement"] == "%s")|> filter(fn: (r) => r["StockName"] == "%s")|> filter(fn: (r) => r["_field"] == "LastPrice")`,
		db.Config.InfluxBucket,
		measurement,
		stockName,
	)
	fmt.Printf("DB: Executing query: '%s'", query)
	queryApi := db.Client.QueryAPI(db.Config.InfluxORG)
	result, err := queryApi.Query(context.Background(), query)
	if err == nil {
		for result.Next() {
			if result.TableChanged() {
				fmt.Printf("table: %s\n", result.TableMetadata().String())
			}
			fmt.Printf("stock: %v\n", result.Record().ValueByKey("StockName"))
			fmt.Printf("value: %v\n", result.Record().Value())
			value := (result.Record().Value()).(float64)
			stocks = append(stocks, common.StockValue{
				Date:  result.Record().Time(),
				Value: value,
			})
		}
		if result.Err() != nil {
			fmt.Printf("query parsing error: %s\n", result.Err().Error())
		}
	} else {
		fmt.Printf("DB: Error executing query: '%v'", err)
	}
	return stocks
}
