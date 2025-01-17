package util

import (
	"encoding/json"
	"fmt"
	"math"
	"math/big"
	"strconv"
	"strings"
	"time"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api/write"
	"github.com/marcelovcpereira/b3loader/api/internal/common"
	external_apis "github.com/marcelovcpereira/b3loader/api/internal/external-apis"
)

func Trim(val string) string {
	return strings.TrimSpace(val)
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

func ParseLineToDailyQuote(line string) common.DailyQuote {
	return common.DailyQuote{
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

func DailyQuotesToInfluxPoints(quotes []common.DailyQuote) []*write.Point {
	var points []*write.Point
	for _, quote := range quotes {
		point := DailyQuoteToInfluxPoint(quote)
		points = append(points, point)
	}
	return points
}

func DailyQuotesToStockValues(quotes []common.DailyQuote) []common.StockValue {
	var stocks []common.StockValue
	for _, quote := range quotes {
		point := DailyQuoteToStockValue(quote)
		stocks = append(stocks, point)
	}
	return stocks
}

func DailyQuoteToStockValue(quote common.DailyQuote) common.StockValue {
	return common.StockValue{
		Date:  quote.Date,
		Value: quote.LastPrice,
	}
}

func DailyQuoteToInfluxPoint(quote common.DailyQuote) *write.Point {
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

func EquitiesPositionToInfluxPoint(position external_apis.EquitiesPositionsEntity) *write.Point {
	return influxdb2.NewPointWithMeasurement("equity_position").
		AddTag("DocumentNumber", Trim(position.DocumentNumber)).
		AddTag("StockName", Trim(position.TickerSymbol)).
		AddField("ProductCategoryName", position.ProductCategoryName).
		AddField("ProductTypeName", position.ProductTypeName).
		AddField("MarkingIndicator", position.MarkingIndicator).
		AddField("TickerSymbol", Trim(position.TickerSymbol)).
		AddField("CorporationName", position.CorporationName).
		AddField("SpecificationCode", position.SpecificationCode).
		AddField("ParticipantName", position.ParticipantName).
		AddField("ParticipantDocumentNumber", position.ParticipantDocumentNumber).
		AddField("EquitiesQuantity", position.EquitiesQuantity).
		AddField("ClosingPrice", position.ClosingPrice).
		AddField("UpdateValue", position.UpdateValue).
		AddField("Isin", position.Isin).
		AddField("DistributionIdentification", position.DistributionIdentification).
		AddField("BookkeeperName", position.BookkeeperName).
		AddField("AvailableQuantity", position.AvailableQuantity).
		AddField("UnavailableQuantity", position.UnavailableQuantity).
		AddField("AdministratorName", position.AdministratorName).
		AddField("ParticipantCode", position.ParticipantCode).
		AddField("AccountNumber", position.AccountNumber).
		AddField("Reasons", stringifyReasons(position.Reasons)).
		SetTime(ParseDate(position.ReferenceDate))
}

func EquitiesPositionsToInfluxPoint(positions []external_apis.EquitiesPositionsEntity) []*write.Point {
	var points []*write.Point
	for _, position := range positions {
		point := EquitiesPositionToInfluxPoint(position)
		points = append(points, point)
	}
	return points
}

func stringifyReasons(reasons []external_apis.ReasonsEntity) string {
	ret, err := json.Marshal(reasons)
	if err != nil {
		panic(err)
	}
	return string(ret)
}

func FIIAnalysis(fii string) {
	//PVP, DY, Vacancia < 10%, Alavancagem , pagamento estavel
}

func StockAnalysis(stock string) {
	//DY, PVP, PL ,Margem Liq, Divida Liq/Ebitda,
}

func VPA(vp float64, totalShares float64) float64 {
	return vp / totalShares
}

func LPA(ll float64, totalShares float64) float64 {
	return ll / totalShares
}

func DPA(ll float64, totalShares float64, payoutPercent float64) float64 {
	return LPA(ll, totalShares) * payoutPercent
}

func GrahamPrice(ll float64, totalShares float64, vp float64) float64 {
	return math.Sqrt(22.5 * LPA(ll, totalShares) * VPA(vp, totalShares))
}

func BasinPrice(ll float64, totalShares float64, payoutPercent float64) float64 {
	taxaBasicaRemuneracaoRendaFixa := 0.06
	return DPA(ll, totalShares, payoutPercent) / taxaBasicaRemuneracaoRendaFixa
}

func ImportJobToInfluxPoint(job common.ImportJob) *write.Point {
	point := influxdb2.NewPointWithMeasurement("import_job").
		AddTag("Status", string(job.Status)).
		AddTag("Id", job.Id).
		AddTag("Sort", strconv.Itoa(job.Sort)).
		AddField("Message", job.Message).
		AddField("DurationSeconds", job.DurationSeconds).
		AddField("FileName", job.FileName).
		AddField("Progress", job.Progress).
		SetTime(job.Date)
	fmt.Printf("%v", point)
	return point
}

func ParseQuoteQueryPeriod(str string) common.QuoteQueryPeriod {
	switch strings.ToLower(str) {
	case "1y":
		return common.Last1Year
	case "6mo":
		return common.Last6Months
	case "2y":
		return common.Last2Years
	case "3y":
		return common.Last3Years
	case "5y":
		return common.Last5Years
	case "6y":
		return common.Last6Years
	default:
		return common.Last1Year
	}
}

func ParseImportJobStatus(str string) common.ImportJobStatus {
	switch strings.ToLower(str) {
	case "running", "job_running":
		return common.JobRunning
	case "created", "job_created":
		return common.JobCreated
	case "finished", "job_finished":
		return common.JobFinished
	case "failed", "job_failed":
		return common.JobFailed
	default:
		return common.JobFailed
	}
}
