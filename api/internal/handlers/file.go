package handlers

import (
	"archive/zip"
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/marcelovcpereira/b3loader/api/internal/common"
	"github.com/marcelovcpereira/b3loader/api/internal/util"
)

const QuoteFilePrefix = "99COTAHIST"

type Handler struct {
	Config common.Config
	DB     common.QuoteDB
}

func NewHandler(config common.Config, db common.QuoteDB) *Handler {
	return &Handler{
		Config: config,
		DB:     db,
	}
}

func (h *Handler) HandleFile(w http.ResponseWriter, req *http.Request) {
	start := time.Now()
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte("{\"status\":\"ok\", \"code\":202}"))

	h.processFile(req.PathValue("name"))

	elapsed := time.Since(start)
	fmt.Printf("Handler: file loaded in %s", elapsed)
}

func (h *Handler) HandleGetQuotes(w http.ResponseWriter, req *http.Request) {
	okResponse := "{\"status\":\"ok\", \"code\":200, \"data\": %s}"
	errorResponse := "{\"status\":\"error\", \"code\":500, \"error\": %s}"
	start := time.Now()
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	stock := strings.ToUpper(req.PathValue("stockName"))

	stocks := h.DB.GetStockValues(stock)
	fmt.Printf("Handler: Found %d stocks for %s. Converting...\n", len(stocks), stock)
	fmt.Printf("Handler: Marshalling to json %d stocks...\n", len(stocks))
	ret, err := json.Marshal(stocks)
	if err != nil {
		fmt.Printf("Handler: error marshalling stocks:%v\n", err)
		w.Write([]byte(fmt.Sprintf(errorResponse, err.Error())))
		return
	}
	response := fmt.Sprintf(okResponse, ret)
	fmt.Printf("Handler: Returning %v\n", response)
	w.Write([]byte(response))
	elapsed := time.Since(start)
	fmt.Printf("Handler: quotes returned in %s", elapsed)
}

func (h *Handler) processFile(fileName string) {
	filePath := h.Config.GetFilePath(fileName)
	newPath, err := h.checkZip(filePath)
	if err != nil {
		fmt.Printf("Handler: ERROR EXTRACTING FILE: %v\n", err)
		return
	}
	readFile, err := os.Open(newPath)
	if err != nil {
		fmt.Printf("Handler: ERROR OPENING FILE: %v\n", err)
		return
	}
	fileScanner := bufio.NewScanner(readFile)
	fileScanner.Split(bufio.ScanLines)

	if !fileScanner.Scan() {
		fmt.Printf("Handler: ERROR SCANNING FILE: %v\n", fileScanner.Err())
		return
	}
	firstLine := fileScanner.Text()
	fmt.Printf("Handler: File information: %s\n", firstLine)

	var quotesBuffer []common.DailyQuote
	totalQuotes := 0
	batchCount := 0
	cutoffDate := util.ParseDate(h.Config.CutoffDate)
	for fileScanner.Scan() {
		line := fileScanner.Text()
		if strings.HasPrefix(line, QuoteFilePrefix) {
			break
		}
		quote := util.ParseLineToDailyQuote(line)
		// Do not persist quotes before the Cutoff date
		if quote.Date.Before(cutoffDate) {
			continue
		}
		quotesBuffer = append(quotesBuffer, quote)

		if len(quotesBuffer) >= h.Config.QuoteFileLoaderBufferSize {
			err = h.DB.PersistQuotes(quotesBuffer)
			if err != nil {
				panic(err)
			}
			batchCount++
			totalQuotes += len(quotesBuffer)
			fmt.Printf("Handler: Batch #%d: Saved %d quotes. Total %d, sleeping %ds...\n", batchCount, len(quotesBuffer), totalQuotes, h.Config.DefaultSleepSeconds)
			time.Sleep(time.Duration(h.Config.DefaultSleepSeconds) * time.Second)
			quotesBuffer = []common.DailyQuote{}
		}

	}
	if len(quotesBuffer) > 0 {
		err = h.DB.PersistQuotes(quotesBuffer)
		if err != nil {
			panic(err)
		}
		batchCount++
		totalQuotes += len(quotesBuffer)
		fmt.Printf("Handler: Batch #%d: Saved %d quotes. Total %d, sleeping %ds...\n", batchCount, len(quotesBuffer), totalQuotes, h.Config.DefaultSleepSeconds)
		quotesBuffer = []common.DailyQuote{}
	}
	h.DB.Close()
	fmt.Printf("Loaded %d quotes\n", totalQuotes)
	readFile.Close()
	if newPath != filePath {
		os.Remove(newPath)
	}
}

func (h *Handler) checkZip(path string) (string, error) {
	if strings.HasSuffix(strings.ToLower(path), ".zip") {
		fmt.Printf("Handler: Zip file detected. Unzipping...\n")
		newPath := strings.ReplaceAll(strings.ToLower(path), ".zip", ".txt")
		err := h.unzip(path, h.Config.DirectoryPath)
		return newPath, err
	}
	return path, nil
}

func (h *Handler) unzip(src, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer func() {
		if err = r.Close(); err != nil {
			panic(err)
		}
	}()

	for _, f := range r.File {
		err = h.extractAndWriteFile(f, dest)
		if err != nil {
			return err
		}
	}

	return nil
}

func (h *Handler) extractAndWriteFile(zipFile *zip.File, dest string) error {
	rc, err := zipFile.Open()
	if err != nil {
		return err
	}
	defer func() {
		if err = rc.Close(); err != nil {
			panic(err)
		}
	}()

	outputFilePath := filepath.Join(dest, zipFile.Name)
	if !strings.HasPrefix(outputFilePath, filepath.Clean(dest)+string(os.PathSeparator)) {
		return fmt.Errorf("handler: illegal file path: %s", outputFilePath)
	}

	os.MkdirAll(filepath.Dir(outputFilePath), zipFile.Mode())

	outputFile, er := os.OpenFile(outputFilePath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, zipFile.Mode())
	if er != nil {
		return err
	}
	defer func() {
		if er = outputFile.Close(); er != nil {
			panic(er)
		}
	}()

	_, er = io.Copy(outputFile, rc)
	outputFile.Sync()
	if er != nil {
		return er
	}

	return nil
}

func (h *Handler) HandleGetStocks(w http.ResponseWriter, req *http.Request) {
	okResponse := "{\"status\":\"ok\", \"code\":200, \"data\": %s}"
	errorResponse := "{\"status\":\"error\", \"code\":500, \"error\": %s}"
	start := time.Now()
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	stock := strings.ToUpper(req.PathValue("stockName"))

	stocks := h.DB.SearchStocks(stock)
	fmt.Printf("Handler: Found %d stocks for %s. Converting...\n", len(stocks), stock)
	fmt.Printf("Handler: Marshalling to json %d stocks...\n", len(stocks))
	ret, err := json.Marshal(stocks)
	if err != nil {
		fmt.Printf("Handler: error marshalling stocks:%v\n", err)
		w.Write([]byte(fmt.Sprintf(errorResponse, err.Error())))
		return
	}
	response := fmt.Sprintf(okResponse, ret)
	fmt.Printf("Handler: Returning %v\n", response)
	w.Write([]byte(response))
	elapsed := time.Since(start)
	fmt.Printf("Handler: quotes returned in %s", elapsed)
}
