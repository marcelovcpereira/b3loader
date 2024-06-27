package main

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/marcelovcpereira/b3loader/internal/common"
	"log"
	"net/http"
	"os"
	"strings"
)

const QuoteFileLoaderBufferSize = 200

func main() {
	fmt.Printf("--------------------------------------")
	fmt.Printf("   Starting B3 Quotes Loader v1.0.0")
	fmt.Printf("--------------------------------------")
	directoryPath := os.Getenv("DIRECTORY_PATH")
	org := os.Getenv("INFLUXDB_ORG")
	bucket := os.Getenv("INFLUXDB_BUCKET")

	mux := http.NewServeMux()
	mux.HandleFunc("/quotes/load/{name}", func(w http.ResponseWriter, req *http.Request) {
		name := req.PathValue("name")
		filePath := directoryPath + "/" + name
		fmt.Printf("New quote request for file %s\n", filePath)
		handleFile(filePath, org, bucket)
	})
	log.Fatal(http.ListenAndServe(":8080", mux))
}

func handleFile(filePath string, org string, bucket string) {
	readFile, err := os.Open(filePath)

	if err != nil {
		fmt.Println(err)
	}
	fileScanner := bufio.NewScanner(readFile)
	fileScanner.Split(bufio.ScanLines)
	fileScanner.Scan()
	firstLine := fileScanner.Text()
	fmt.Printf("File information: %s\n", firstLine)

	var quotesBuffer []common.DailyQuote
	totalQuotes := 0
	client, err := ConnectToInfluxDB()
	if err != nil {
		panic(err)
	}
	for fileScanner.Scan() {
		line := fileScanner.Text()
		if strings.HasPrefix(line, "99COTAHIST") {
			break
		}
		quote := common.ParseLineToDailyQuote(line)
		fmt.Printf("-")
		quotesBuffer = append(quotesBuffer, quote)

		if len(quotesBuffer) >= QuoteFileLoaderBufferSize {
			fmt.Printf("Persisting batch of %d quotes...\n", QuoteFileLoaderBufferSize)
			persistQuotes(client, quotesBuffer, org, bucket)
			totalQuotes += len(quotesBuffer)
			quotesBuffer = []common.DailyQuote{}
			fmt.Printf("\n")
		}

	}
	client.Close()
	fmt.Printf("Loaded %d quotes\n", totalQuotes)
	readFile.Close()
}

func persistQuotes(client influxdb2.Client, quotes []common.DailyQuote, org string, bucket string) error {
	writeAPI := client.WriteAPI(org, bucket)
	// write line protocol
	for _, quote := range quotes {
		point := common.DailyQuoteToInfluxPoint(quote)
		writeAPI.WritePoint(point)
	}
	// Flush writes
	writeAPI.Flush()
	return nil
}

func ConnectToInfluxDB() (influxdb2.Client, error) {
	dbToken := os.Getenv("INFLUXDB_TOKEN")
	if dbToken == "" {
		return nil, errors.New("INFLUXDB_TOKEN must be set")
	}

	dbURL := os.Getenv("INFLUXDB_URL")
	if dbURL == "" {
		return nil, errors.New("INFLUXDB_URL must be set")
	}
	fmt.Printf("Connecting to influxdb at '%s' with token '%s'...\n", dbURL, dbToken)
	client := influxdb2.NewClientWithOptions(
		dbURL,
		dbToken,
		influxdb2.DefaultOptions().SetBatchSize(QuoteFileLoaderBufferSize),
	)

	// validate client connection health
	check, err := client.Health(context.Background())
	fmt.Printf("Connection health: %s\n", check.Status)
	return client, err
}
