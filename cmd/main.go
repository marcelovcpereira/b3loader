package main

import (
	"fmt"
	"github.com/marcelovcpereira/b3loader/internal/common"
	db2 "github.com/marcelovcpereira/b3loader/internal/db"
	"github.com/marcelovcpereira/b3loader/internal/handlers"
	"log"
	"net/http"
)

const (
	DefaultCutoffDate                = "20180101"
	DefaultQuoteFileLoaderBufferSize = 7000
	DefaultSleepSeconds              = 4
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
	fmt.Printf("Waiting API connections on port: %s...\n", config.Port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", config.Port), mux))
}
