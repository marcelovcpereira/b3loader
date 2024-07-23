package db

import (
	"context"
	"errors"
	"fmt"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api/write"
	"github.com/marcelovcpereira/b3loader/api/internal/common"
	external_apis "github.com/marcelovcpereira/b3loader/api/internal/external-apis"
	"github.com/marcelovcpereira/b3loader/api/internal/util"
	"strconv"
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

func NewInfluxQuoteDB(config common.Config) *InfluxQuoteDB {
	db := InfluxQuoteDB{
		Client:     nil,
		Config:     config,
		BufferSize: config.QuoteFileLoaderBufferSize,
	}
	db.Connect()
	return &db
}

func (db *InfluxQuoteDB) PersistQuotes(quotes []common.DailyQuote) error {
	fmt.Printf("DB: Converting batch of %d quotes to Influx points...\n", db.Config.QuoteFileLoaderBufferSize)
	fmt.Printf("DB: %s\n", quotes[len(quotes)-1].Date.Month())
	points := util.DailyQuotesToInfluxPoints(quotes)
	fmt.Printf("DB: Persisting %d points ...\n", len(points))
	err := db.RetryableWritePoints(DefaultRetryAttempts, points, db.Config.InfluxBucket)
	if err != nil {
		return err
	}
	return nil
}

func (db *InfluxQuoteDB) CreateBucketIfNotExists(bucket string) {
	_, err := db.Client.BucketsAPI().FindBucketByName(context.Background(), bucket)
	if err != nil {
		org, err := db.Client.OrganizationsAPI().GetOrganizations(context.Background())
		if err != nil {
			panic(err)
		}
		db.Client.BucketsAPI().CreateBucketWithName(context.Background(), &(*org)[0], bucket)
	}
}

func (db *InfluxQuoteDB) RetryableWritePoints(attempts int, points []*write.Point, bucket string) error {
	currentAttempt := 1
	writeAPI := db.Client.WriteAPIBlocking(db.Config.InfluxORG, bucket)
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

func (db *InfluxQuoteDB) GetStockValues(stockName string, period common.QuoteQueryPeriod) []common.StockValue {
	measurement := "daily_quote"
	var stocks []common.StockValue
	query := fmt.Sprintf(
		`from(bucket: "%s")|> range(start: %s)|> filter(fn: (r) => r["_measurement"] == "%s")|> filter(fn: (r) => r["StockName"] == "%s")|> filter(fn: (r) => r["_field"] == "LastPrice")|> yield(name: "last")`,
		db.Config.InfluxBucket,
		period,
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

func (db *InfluxQuoteDB) SearchStocks(stockName string) []string {
	var stocks []string
	tag := "StockName"
	limit := 10
	query := fmt.Sprintf(`import "influxdata/influxdb/schema" 
 schema.tagValues(bucket: "%s", tag: "%s")
|> filter(fn: (r) => r._value =~ /%s/) 
|> limit(n:%d)`,
		db.Config.InfluxBucket,
		tag,
		stockName,
		limit,
	)
	fmt.Printf("DB: Executing query: '%s'", query)
	queryApi := db.Client.QueryAPI(db.Config.InfluxORG)
	result, err := queryApi.Query(context.Background(), query)

	if err == nil {
		for result.Next() {
			value := (result.Record().Value()).(string)
			stocks = append(stocks, value)
		}
		if result.Err() != nil {
			fmt.Printf("query parsing error: %s\n", result.Err().Error())
		}
	} else {
		fmt.Printf("DB: Error executing query: '%v'", err)
	}
	return stocks
}

func (db *InfluxQuoteDB) PersistEquitiesPositions(positions []external_apis.EquitiesPositionsEntity) error {
	points := util.EquitiesPositionsToInfluxPoint(positions)
	if len(points) > 0 {
		fmt.Printf("DB: Persisting %d 'equities-positions' points ...\n", len(points))
		err := db.RetryableWritePoints(DefaultRetryAttempts, points, db.Config.InfluxBucket)
		if err != nil {
			return err
		}
	} else {
		fmt.Printf("DB: No point to Persist ...\n")
	}
	return nil
}

func (db *InfluxQuoteDB) PersistJob(job common.ImportJob) error {
	point := util.ImportJobToInfluxPoint(job)
	err := db.RetryableWritePoints(DefaultRetryAttempts, []*write.Point{point}, "import_jobs")
	if err != nil {
		return err
	}

	return nil
}

func (db *InfluxQuoteDB) GetLastJobStatus(id string) common.ImportJob {
	var resultPoints map[string]common.ImportJob
	resultPoints = make(map[string]common.ImportJob)

	measurement := "import_job"
	query := fmt.Sprintf(
		`from(bucket: "%s")|> range(start: -3y)|> filter(fn: (r) => r["_measurement"] == "%s")|> filter(fn: (r) => r["Id"] == "%s")|>last()`,
		"import_jobs",
		measurement,
		id,
	)
	queryApi := db.Client.QueryAPI(db.Config.InfluxORG)
	result, err := queryApi.Query(context.Background(), query)

	if err == nil {
		for result.Next() {
			sortVal := result.Record().ValueByKey("Sort").(string)
			val, ok := resultPoints[sortVal]
			if !ok {
				val = common.ImportJob{}
			}

			val.Date = result.Record().ValueByKey("_time").(time.Time)
			val.Status = util.ParseImportJobStatus(result.Record().ValueByKey("Status").(string))
			val.Id = result.Record().ValueByKey("Id").(string)
			val.Sort, _ = strconv.Atoi(sortVal)
			switch field := result.Record().Field(); field {
			case "Progress":
				val.Progress = result.Record().Value().(float64)
			case "Message":
				val.Message = result.Record().Value().(string)
			case "FileName":
				val.FileName = result.Record().Value().(string)
			case "DurationSeconds":
				val.DurationSeconds = result.Record().Value().(int64)
			default:
				fmt.Printf("unrecognized field %s.\n", field)
			}
			resultPoints[sortVal] = val
		}
		if result.Err() != nil {
			fmt.Printf("query parsing error: %s\n", result.Err().Error())
		}
	} else {
		fmt.Printf("DB: Error executing query: '%v'", err)
	}

	lastIndex := 0
	for i, _ := range resultPoints {
		if resultPoints[i].Sort > lastIndex {
			lastIndex, _ = strconv.Atoi(i)
		}
	}

	return resultPoints[strconv.Itoa(lastIndex)]
}

func (db *InfluxQuoteDB) ListJobIds() []string {
	var jobs []string
	tag := "Id"
	limit := 10
	query := fmt.Sprintf(` import "influxdata/influxdb/schema" 
 schema.measurementTagValues(bucket: "%s", tag: "%s", measurement: "%s")
|> limit(n:%d)`,
		"import_jobs",
		tag,
		"import_job",
		limit,
	)
	queryApi := db.Client.QueryAPI(db.Config.InfluxORG)
	result, err := queryApi.Query(context.Background(), query)

	if err == nil {
		for result.Next() {
			fmt.Printf("value: %v\n", result.Record().Value())
			value := (result.Record().Value()).(string)
			fmt.Printf("value: %s", value)
			jobs = append(jobs, value)
		}
		if result.Err() != nil {
			fmt.Printf("query parsing error: %s\n", result.Err().Error())
		}
	} else {
		fmt.Printf("DB: Error executing query: '%v'", err)
	}
	return jobs
}
