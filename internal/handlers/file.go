package handlers

import (
	"archive/zip"
	"bufio"
	"fmt"
	"github.com/marcelovcpereira/b3loader/internal/common"
	"github.com/marcelovcpereira/b3loader/internal/util"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

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
	filePath := h.Config.GetFilePath(req.PathValue("name"))
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte("{\"status\":\"ok\", \"code\":202}"))
	h.handleFile(h.DB, filePath)
	elapsed := time.Since(start)
	fmt.Printf("Handler: file loaded in %s", elapsed)
}

func (h *Handler) handleFile(db common.QuoteDB, filePath string) {
	newPath, err := h.checkZip(filePath)
	if err != nil {
		fmt.Printf("ERROR EXTRACTING FILE: %v\n", err)
		return
	}
	readFile, err := os.Open(newPath)
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
		quote := util.ParseLineToDailyQuote(line)
		date := util.ParseDate(h.Config.CutoffDate)
		if quote.Date.Before(date) {
			continue
		}
		quotesBuffer = append(quotesBuffer, quote)

		if len(quotesBuffer) >= h.Config.QuoteFileLoaderBufferSize {
			fmt.Printf("Persisting batch of %d quotes...\n", h.Config.QuoteFileLoaderBufferSize)
			fmt.Printf("%s\n", quotesBuffer[len(quotesBuffer)-1].Date.Month())
			err = db.PersistQuotes(quotesBuffer)
			if err != nil {
				panic(err)
			}
			batchCount++
			totalQuotes += len(quotesBuffer)
			fmt.Printf("Saved %d quotes. Total %d, sleeping %ds...\n", len(quotesBuffer), totalQuotes, h.Config.DefaultSleepSeconds)
			time.Sleep(time.Duration(h.Config.DefaultSleepSeconds) * time.Second)
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
	if newPath != filePath {
		os.Remove(newPath)
	}
}

func (h *Handler) checkZip(path string) (string, error) {
	if strings.HasSuffix(strings.ToLower(path), ".zip") {
		fmt.Printf("Zip file detected. Unzipping...\n")
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

// Closure to address file descriptors issue with all the deferred .Close() methods
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
		return fmt.Errorf("illegal file path: %s", outputFilePath)
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
