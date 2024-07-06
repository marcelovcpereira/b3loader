package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/marcelovcpereira/b3loader/api/internal/common"
	db2 "github.com/marcelovcpereira/b3loader/api/internal/db"
	"github.com/marcelovcpereira/b3loader/api/internal/handlers"
)

const (
	DefaultCutoffDate                = "20180101"
	DefaultQuoteFileLoaderBufferSize = 7000
	DefaultSleepSeconds              = 2
)

func main() {
	fmt.Printf("--------------------------------------\n")
	fmt.Printf("   Starting B3 Quotes Loader v1.0.0\n")
	fmt.Printf("--------------------------------------\n")
	config := common.LoadConfig()
	config.SetCutoffDate(DefaultCutoffDate)
	config.SetQuoteFileLoaderBufferSize(DefaultQuoteFileLoaderBufferSize)
	config.SetDefaultSleepSeconds(DefaultSleepSeconds)
	config.PrintConfig()

	db := db2.NewInfluxQuoteDB(config, DefaultQuoteFileLoaderBufferSize)
	handler := handlers.NewHandler(config, db)

	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/quotes/file/{name}/load", handler.HandleFile)
	mux.HandleFunc("/api/v1/quotes/{stockName}", handler.HandleGetQuotes)
	mux.HandleFunc("/api/v1/stocks/{stockName}", handler.HandleGetStocks)
	fmt.Printf("Waiting API connections on port: %s...\n", config.Port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", config.Port), mux))
}
