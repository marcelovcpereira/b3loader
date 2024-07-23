package common

import (
	"fmt"
	external_apis "github.com/marcelovcpereira/b3loader/api/internal/external-apis"
	"math/big"
	"os"
	"time"
)

type DailyQuote struct {
	Date              time.Time // 03 - 10
	BDICode           string    // 11 - 12
	StockName         string    // 13 - 24
	Market            string    // 25 - 27
	CompanyName       string    // 28 - 39
	StockType         string    // 40 - 49
	PrazoMercadoTermo string    //50 - 52
	Moeda             string    // 53 - 56
	OpeningPrice      float64   // 57 - 69
	MaxPrice          float64   // 70 - 82
	MinPrice          float64   // 83 - 95
	AvgPrice          float64   // 96 - 108
	LastPrice         float64   // 109 - 121
	BestBuyPrice      float64   // 122 - 134
	BestSellPrice     float64   // 135 - 147
	TotalDeals        int32     // 148 - 152
	TotalTitlesCount  big.Int   // 153 - 170
	TotalTitlesValue  float64   // 171 - 188
	ExercisePrice     float64   // 189 - 201
	PriceCorrection   int32     // 202 - 202
	DueDate           time.Time // 203 - 210
	QuoteFactor       int32     // 211 - 217
	PrecoPontos       string    // 218 - 230
	ISINCode          string    // 231 - 242
	Dismes            string    // 243 - 245
}

type Config struct {
	DirectoryPath             string
	InfluxURL                 string
	InfluxORG                 string
	InfluxBucket              string
	InfluxToken               string
	Port                      string
	CutoffDate                string
	QuoteFileLoaderBufferSize int
	DefaultSleepSeconds       int
}

func LoadConfig() Config {
	return Config{
		DirectoryPath:             os.Getenv("DIRECTORY_PATH"),
		InfluxURL:                 os.Getenv("INFLUXDB_URL"),
		InfluxORG:                 os.Getenv("INFLUXDB_ORG"),
		InfluxBucket:              os.Getenv("INFLUXDB_BUCKET"),
		InfluxToken:               os.Getenv("INFLUXDB_ADMIN_TOKEN"),
		Port:                      os.Getenv("B3LOADER_PORT"),
		CutoffDate:                "19800101",
		QuoteFileLoaderBufferSize: 7000,
		DefaultSleepSeconds:       2,
	}
}

func (c Config) SetCutoffDate(cutoffDate string) {
	c.CutoffDate = cutoffDate
}

func (c Config) SetQuoteFileLoaderBufferSize(size int) {
	c.QuoteFileLoaderBufferSize = size
}

func (c Config) SetDefaultSleepSeconds(sleep int) {
	c.DefaultSleepSeconds = sleep
}

func (c Config) PrintConfig() {
	fmt.Printf(
		"Config: Upload directory: %s\nInfluxdb:\n\tHost: %s\n\tOrg: %s\n\tBucket: %s\n\tToken: %s\n",
		c.DirectoryPath,
		c.InfluxURL,
		c.InfluxORG,
		c.InfluxBucket,
		c.InfluxToken,
	)
	fmt.Printf("Config: running at %.1f quotes per second (qps)\n", float64(c.QuoteFileLoaderBufferSize/c.DefaultSleepSeconds))
}

func (c Config) GetFilePath(name string) string {
	return c.DirectoryPath + "/" + name
}

type QuoteDB interface {
	Connect()
	PersistQuotes(quotes []DailyQuote) error
	GetStockValues(stockName string, period QuoteQueryPeriod) []StockValue
	SearchStocks(stockName string) []string
	Close()
	PersistEquitiesPositions(positions []external_apis.EquitiesPositionsEntity) error
	PersistJob(job ImportJob) error
	GetLastJobStatus(id string) ImportJob
	ListJobIds() []string
}

type StockValue struct {
	Date  time.Time
	Value float64
}

type ImportJobStatus string
type QuoteQueryPeriod string

const (
	JobCreated  ImportJobStatus = "JOB_CREATED"
	JobRunning  ImportJobStatus = "JOB_RUNNING"
	JobFailed   ImportJobStatus = "JOB_FAILED"
	JobFinished ImportJobStatus = "JOB_FINISHED"

	Last1Year   QuoteQueryPeriod = "-1y"
	Last6Months QuoteQueryPeriod = "-6mo"
	Last2Years  QuoteQueryPeriod = "-2y"
	Last3Years  QuoteQueryPeriod = "-3y"
	Last5Years  QuoteQueryPeriod = "-5y"
)

type ImportJob struct {
	Id              string
	Date            time.Time
	FileName        string
	Status          ImportJobStatus
	Progress        float64
	Message         string
	DurationSeconds int64
	Sort            int
}
