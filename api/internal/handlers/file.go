package handlers

import (
	"archive/zip"
	"bufio"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"io"
	"io/fs"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/marcelovcpereira/b3loader/api/internal/common"
	"github.com/marcelovcpereira/b3loader/api/internal/util"
)

const QuoteFilePrefix = "99COTAHIST"

type Handler struct {
	Config common.Config
	DB     common.QuoteDB
}

type Chunk struct {
	File         string `json:"file"`
	ChunkNumber  int    `json:"chunkNumber"`
	TotalChunks  int    `json:"totalChunks"`
	Originalname string `json:"originalname"`
	UUID         string `json:"uuid,omitempty"`
}

type B3File struct {
	Name      string `json:"name"`
	SizeBytes int64  `json:"sizeBytes"`
	Type      string `json:"type"`
}

func NewHandler(config common.Config, db common.QuoteDB) *Handler {
	return &Handler{
		Config: config,
		DB:     db,
	}
}

func (h *Handler) HandleImport(w http.ResponseWriter, req *http.Request) {
	start := time.Now()
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write([]byte("{\"status\":\"ok\", \"code\":200}"))
	wg := sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		h.processFile(req.PathValue("name"))
	}()
	elapsed := time.Since(start)
	fmt.Printf("Handler: file loaded in %s", elapsed)
}

func (h *Handler) HandleListFiles(w http.ResponseWriter, req *http.Request) {
	start := time.Now()
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	rawData := h.listFiles()
	data, err := json.Marshal(rawData)
	data = []byte(strings.ReplaceAll(string(data), "\"", "\\\""))
	if err != nil {
		panic(err)
	}
	body := fmt.Sprintf("{\"status\":\"ok\",\"data\":\"%s\",\"code\":200}", data)
	fmt.Printf("returning %s", body)
	w.Write([]byte(body))

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

func (h *Handler) listFiles() []B3File {
	var ret []B3File
	files, err := ioutil.ReadDir(h.Config.DirectoryPath)
	if err != nil {
		panic(err)
	}

	for _, file := range files {
		if strings.HasPrefix(file.Name(), ".") {
			continue
		}
		ret = append(ret, B3File{
			Name:      file.Name(),
			SizeBytes: file.Size(),
			Type:      h.getFileType(file),
		})
		fmt.Println(file.Name(), file.IsDir())
	}
	return ret
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
	w.Header().Set("Access-Control-Allow-Origin", "*")
	okResponse := "{\"status\":\"ok\", \"code\":200, \"data\": %s}"
	errorResponse := "{\"status\":\"error\", \"code\":500, \"error\": %s}"
	start := time.Now()
	w.Header().Set("Content-Type", "application/json")

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

func (h *Handler) fileExists(path string) bool {
	_, err := os.Stat(path)
	if err == nil {
		return true
	}
	if os.IsNotExist(err) {
		return false
	}
	return false
}

func (h *Handler) HandleUpload(writer http.ResponseWriter, request *http.Request) {
	writer.Header().Set("Access-Control-Allow-Origin", "*")
	err := request.ParseMultipartForm(6 * 1024 * 1024)
	file, err := request.MultipartForm.File["chunk"][0].Open()
	chunk, err := ioutil.ReadAll(file)
	if err != nil {
		message := fmt.Sprintf("Error parsing chunk: %v\n", err)
		fmt.Println(message)
		writer.Write([]byte(fmt.Sprintf("{\"error\":\"%s\"}", message)))
		return
	}
	chunkNumber, err := strconv.Atoi(request.PostForm.Get("chunkNumber"))
	if err != nil {
		message := fmt.Sprintf("Error parsing chunkNumber: %v\n", err)
		fmt.Println(message)
		writer.Write([]byte(fmt.Sprintf("{\"error\":\"%s\"}", message)))
		return
	}
	totalChunks, err := strconv.Atoi(request.PostForm.Get("totalChunks"))
	if err != nil {
		message := fmt.Sprintf("Error parsing totalChunks: %v\n", err)
		fmt.Println(message)
		writer.Write([]byte(fmt.Sprintf("{\"error\":\"%s\"}", message)))
		return
	}
	fileName := request.PostForm.Get("originalname")
	uid := uuid.New().String()
	if request.PostForm.Get("uuid") != "" {
		uid = request.PostForm.Get("uuid")
	}
	chunkDir := h.Config.DirectoryPath + "/chunks-" + uid
	if !h.fileExists(chunkDir) {
		os.MkdirAll(chunkDir, os.ModePerm)
	}

	chunkFilePath := fmt.Sprintf(`%s/%s.part_%d`, chunkDir, fileName, chunkNumber)

	err = os.WriteFile(chunkFilePath, []byte(chunk), os.ModePerm)
	if err != nil {
		fmt.Printf("Error saving chunk: %v\n", err)
		writer.Write([]byte("{\"error\":\"Error saving chunk\"}"))
		return
	}
	fmt.Printf("Chunk %d/%d saved\n", chunkNumber, totalChunks)

	if chunkNumber == totalChunks {
		// If this is the last chunk, merge all chunks into a single file
		err = h.mergeChunks(chunkDir, fileName, totalChunks)
		if err != nil {
			fmt.Printf("Error merging chunks: %v\n", err)
			writer.Write([]byte("{\"error\":\"Error merging chunks\"}"))
			return
		}
		fmt.Println("File merged successfully")
		os.RemoveAll(chunkDir)

	}
	writer.Write([]byte(fmt.Sprintf("{\"message\": \"Chunk uploaded successfully\", \"uuid\":\"%s\"}", uid)))
}

func (h *Handler) mergeChunks(chunkDir string, fileName string, totalChunks int) error {
	mergedFileDir := h.Config.DirectoryPath + "/"
	mergedFilePath := mergedFileDir + fileName

	if !h.fileExists(mergedFileDir) {
		os.MkdirAll(mergedFileDir, os.ModePerm)
	}

	fo, err := os.Create(mergedFilePath)
	if err != nil {
		return err
	}
	defer func() {
		if err = fo.Close(); err != nil {
			panic(err)
		}
	}()
	w := bufio.NewWriter(fo)
	for i := 1; i <= totalChunks; i++ {
		chunkFilePath := fmt.Sprintf(`%s/%s.part_%d`, chunkDir, fileName, i)
		chunkBuffer, erro := os.ReadFile(chunkFilePath)
		if erro != nil {
			return erro
		}
		_, errr := w.Write(chunkBuffer)
		if errr != nil {
			return errr
		}
	}

	w.Flush()
	fmt.Println("Chunks merged successfully")
	return nil
}

func (h *Handler) getFileType(file fs.FileInfo) string {
	name := strings.ToLower(file.Name())
	if strings.HasSuffix(name, ".txt") {
		return "text/plain"
	}
	if strings.HasSuffix(name, ".zip") {
		return "application/zip"
	}
	return strings.Split(name, ".")[1]
}
