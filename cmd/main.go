package main

import (
	"archive/zip"
	"bufio"
	"fmt"
	"github.com/marcelovcpereira/b3loader/internal/common"
	db2 "github.com/marcelovcpereira/b3loader/internal/db"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const DefaultCutoffDate = "20180101"
const CutoffDate = DefaultCutoffDate
const QuoteFileLoaderBufferSize = 7000
const DefaultSleepSeconds = 4
const SLEEP = DefaultSleepSeconds * time.Second

func main() {
	fmt.Printf("--------------------------------------\n")
	fmt.Printf("   Starting B3 Quotes Loader v1.0.0\n")
	fmt.Printf("--------------------------------------\n")
	config := common.LoadConfig()
	fmt.Printf("Configured to run at %.1f quotes/s\n", float64(QuoteFileLoaderBufferSize/DefaultSleepSeconds))
	config.PrintConfig()
	db := db2.NewInfluxQuoteDB(config, QuoteFileLoaderBufferSize)
	mux := http.NewServeMux()
	mux.HandleFunc("/quotes/load/{name}", func(w http.ResponseWriter, req *http.Request) {
		start := time.Now()
		filePath := config.GetFilePath(req.PathValue("name"))
		fmt.Printf("New quote request for file %s\n", filePath)
		handleFile(db, filePath)
		elapsed := time.Since(start)
		log.Printf("file loaded in %s", elapsed)
	})
	fmt.Println("Waiting connections...")
	log.Fatal(http.ListenAndServe(":8080", mux))
}

func handleFile(db common.QuoteDB, filePath string) {
	filePath, err := checkZip(filePath)
	if err != nil {
		fmt.Printf("ERROR EXTRACTING FILE: %v\n", err)
		return
	}
	readFile, err := os.Open(filePath)
	if err != nil {
		fmt.Printf("ERROR OPENING FILE: %v\n", err)
		return
	}
	fileScanner := bufio.NewScanner(readFile)
	fileScanner.Split(bufio.ScanLines)
	fileScanner.Scan()
	firstLine := fileScanner.Text()
	fmt.Printf("File information: %s\n", firstLine)

	var quotesBuffer []common.DailyQuote
	totalQuotes := 0
	batchCount := 0
	for fileScanner.Scan() {
		line := fileScanner.Text()
		if strings.HasPrefix(line, "99COTAHIST") {
			break
		}
		quote := common.ParseLineToDailyQuote(line)
		date := common.ParseDate(CutoffDate)
		if quote.Date.Before(date) {
			continue
		}
		quotesBuffer = append(quotesBuffer, quote)

		if len(quotesBuffer) >= QuoteFileLoaderBufferSize {
			fmt.Printf("Persisting batch of %d quotes...\n", QuoteFileLoaderBufferSize)
			fmt.Printf("%s\n", quotesBuffer[len(quotesBuffer)-1].Date.Month())
			err = db.PersistQuotes(quotesBuffer)
			if err != nil {
				panic(err)
			}
			batchCount++
			totalQuotes += len(quotesBuffer)
			fmt.Printf("Saved %d quotes. Total %d, sleeping %s...\n", len(quotesBuffer), totalQuotes, SLEEP)
			time.Sleep(SLEEP)
			quotesBuffer = []common.DailyQuote{}
		}

	}
	if len(quotesBuffer) > 0 {
		fmt.Printf("Persisting last batch of %d quotes...\n", len(quotesBuffer))
		err = db.PersistQuotes(quotesBuffer)
		if err != nil {
			panic(err)
		}
		batchCount++
		totalQuotes += len(quotesBuffer)
		fmt.Printf("Saved %d quotes, Total %d, done\n", len(quotesBuffer), totalQuotes)
	}
	db.Close()
	fmt.Printf("Loaded %d quotes\n", totalQuotes)
	readFile.Close()
}

func checkZip(path string) (string, error) {
	if strings.HasSuffix(".zip", path) {
		fmt.Printf("Zip file detected. Unzipping...\n")
		newPath := strings.ReplaceAll(".zip", ".txt", strings.ToLower(path))
		err := Unzip(path, newPath)
		return newPath, err
	}
	return path, nil
}

func Unzip(src, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer func() {
		if err = r.Close(); err != nil {
			panic(err)
		}
	}()

	os.MkdirAll(dest, 0755)

	// Closure to address file descriptors issue with all the deferred .Close() methods
	extractAndWriteFile := func(f *zip.File) error {
		var rc io.ReadCloser
		rc, err = f.Open()
		if err != nil {
			return err
		}
		defer func() {
			if err = rc.Close(); err != nil {
				panic(err)
			}
		}()

		path := filepath.Join(dest, f.Name)

		// Check for ZipSlip (Directory traversal)
		if !strings.HasPrefix(path, filepath.Clean(dest)+string(os.PathSeparator)) {
			return fmt.Errorf("illegal file path: %s", path)
		}

		if f.FileInfo().IsDir() {
			os.MkdirAll(path, f.Mode())
		} else {
			os.MkdirAll(filepath.Dir(path), f.Mode())

			f, er := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
			if er != nil {
				return err
			}
			defer func() {
				if er = f.Close(); er != nil {
					panic(er)
				}
			}()

			_, er = io.Copy(f, rc)
			if er != nil {
				return er
			}
		}
		return nil
	}

	for _, f := range r.File {
		err = extractAndWriteFile(f)
		if err != nil {
			return err
		}
	}

	return nil
}
