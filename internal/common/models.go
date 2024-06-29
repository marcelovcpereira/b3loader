package common

import (
	"fmt"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api/write"
	"math"
	"math/big"
	"os"
	"strconv"
	"strings"
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

func ParseMoney(str string) float64 {
	rawCents := str[len(str)-2:]
	cents, err := strconv.ParseInt(rawCents, 10, 32)
	if err != nil {
		panic(err)
	}
	rawBase := strings.TrimLeft(str[:len(str)-2], "0")
	if rawBase == "" {
		rawBase = "0"
	}
	base := new(big.Int)
	base, ok := base.SetString(rawBase, 10)
	if !ok {
		panic("SetString: error")
	}
	if err != nil {
		panic(err)
	}
	strValue := base.String() + "." + strconv.Itoa(int(cents))
	retVal, err := strconv.ParseFloat(strValue, 64)
	if err != nil {
		panic(err)
	}
	return retVal
}

func Trim(val string) string {
	return strings.TrimSpace(val)
}

func DailyQuoteToInfluxPoint(quote DailyQuote) *write.Point {
	return influxdb2.NewPointWithMeasurement("daily_quote").
		AddTag("StockName", Trim(quote.StockName)).
		AddField("Date", quote.Date).
		AddField("BDICode", quote.BDICode).
		AddField("StockName", Trim(quote.StockName)).
		AddField("Market", quote.Market).
		AddField("CompanyName", Trim(quote.CompanyName)).
		AddField("StockType", quote.StockType).
		AddField("PrazoMercadoTermo", quote.PrazoMercadoTermo).
		AddField("Moeda", quote.Moeda).
		AddField("OpeningPrice", quote.OpeningPrice).
		AddField("MaxPrice", quote.MaxPrice).
		AddField("MinPrice", quote.MinPrice).
		AddField("AvgPrice", quote.AvgPrice).
		AddField("LastPrice", quote.LastPrice).
		AddField("BestBuyPrice", quote.BestBuyPrice).
		AddField("BestSellPrice", quote.BestSellPrice).
		AddField("TotalDeals", quote.TotalDeals).
		AddField("TotalTitlesCount", quote.TotalTitlesCount).
		AddField("TotalTitlesValue", quote.TotalTitlesValue).
		AddField("ExercisePrice", quote.ExercisePrice).
		AddField("PriceCorrection", quote.PriceCorrection).
		AddField("DueDate", quote.DueDate).
		AddField("QuoteFactor", quote.QuoteFactor).
		AddField("PrecoPontos", quote.PrecoPontos).
		AddField("ISINCode", quote.ISINCode).
		AddField("Dismes", quote.Dismes).
		SetTime(quote.Date)
}

func ParseLineToDailyQuote(line string) DailyQuote {
	return DailyQuote{
		Date:              ParseDate(line[2:10]),
		BDICode:           line[10:12],
		StockName:         line[12:24],
		Market:            line[24:27],
		CompanyName:       line[27:39],
		StockType:         line[39:49],
		PrazoMercadoTermo: line[49:52],
		Moeda:             line[52:56],
		OpeningPrice:      ParseMoney(line[56:69]),
		MaxPrice:          ParseMoney(line[69:82]),
		MinPrice:          ParseMoney(line[82:95]),
		AvgPrice:          ParseMoney(line[95:108]),
		LastPrice:         ParseMoney(line[108:121]),
		BestBuyPrice:      ParseMoney(line[121:134]),
		BestSellPrice:     ParseMoney(line[134:147]),
		TotalDeals:        ParseInt(line[147:152]),
		TotalTitlesCount:  ParseBigInt(line[152:170]),
		TotalTitlesValue:  ParseMoney(line[170:188]),
		ExercisePrice:     ParseMoney(line[188:201]),
		PriceCorrection:   ParseInt(line[201:202]),
		DueDate:           ParseDate(line[202:210]),
		QuoteFactor:       ParseInt(line[210:217]),
		PrecoPontos:       line[217:230],
		ISINCode:          line[230:242],
		Dismes:            line[242:245],
	}
}

func FIIAnalysis(fii string) {
	//PVP, DY, Vacancia < 10%, Alavancagem , pagamento estavel
}

func StockAnalysis(stock string) {
	//DY, PVP, PL ,Margem Liq, Divida Liq/Ebitda,
}

func ParseDate(s string) time.Time {
	date, err := time.Parse("20060102", s)
	if err != nil {
		panic(err)
	}
	return date
}

func ParseInt(s string) int32 {
	val, err := strconv.ParseInt(s, 10, 32)
	if err != nil {
		panic(err)
	}
	return int32(val)
}

func ParseBigInt(s string) big.Int {
	base := new(big.Int)
	base, ok := base.SetString(s, 10)
	if !ok {
		panic("SetString: error")
	}
	return *base
}

func GrahamPrice(lpa float64, vpa float64) float64 {
	return math.Sqrt(22.5 * lpa * vpa)
}

func BasinPrice(dpa float64) float64 {
	taxaBasicaRemuneracaoRendaFixa := 0.06
	return dpa / taxaBasicaRemuneracaoRendaFixa
}

type Config struct {
	DirectoryPath string
	InfluxURL     string
	InfluxORG     string
	InfluxBucket  string
	InfluxToken   string
}

func LoadConfig() Config {
	return Config{
		DirectoryPath: os.Getenv("DIRECTORY_PATH"),
		InfluxURL:     os.Getenv("INFLUXDB_URL"),
		InfluxORG:     os.Getenv("INFLUXDB_ORG"),
		InfluxBucket:  os.Getenv("INFLUXDB_BUCKET"),
		InfluxToken:   os.Getenv("INFLUXDB_TOKEN"),
	}
}

func (c Config) PrintConfig() {
	fmt.Printf(
		"Upload directory: %s\nInfluxdb:\n\tHost: %s\n\tOrg: %s\n\tBucket: %s\n\tToken: %s\n",
		c.DirectoryPath,
		c.InfluxURL,
		c.InfluxORG,
		c.InfluxBucket,
		c.InfluxToken,
	)
}

func (c Config) GetFilePath(name string) string {
	return c.DirectoryPath + "/" + name
}

type QuoteDB interface {
	Connect()
	PersistQuotes(quotes []DailyQuote) error
	Close()
}
