package external_apis

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"
)

const BaseHost = "https://developers.b3.com.br:8065"
const PositionPath = "/api/position/v3"
const EquitiesPath = "/equities/investors/%s" //documentNumber

type B3API struct {
}

func NewB3API() *B3API {
	api := B3API{}
	return &api
}

type EquitiesResponse struct {
	Data  EquitiesData `json:"data"`
	Links Links        `json:"Links"`
}
type EquitiesData struct {
	EquitiesPositions []EquitiesPositionsEntity `json:"equitiesPositions"`
}
type EquitiesPositionsEntity struct {
	DocumentNumber             string          `json:"documentNumber"`
	ReferenceDate              string          `json:"referenceDate"`
	ProductCategoryName        string          `json:"productCategoryName"`
	ProductTypeName            string          `json:"productTypeName"`
	MarkingIndicator           string          `json:"markingIndicator"`
	TickerSymbol               string          `json:"tickerSymbol"`
	CorporationName            string          `json:"corporationName"`
	SpecificationCode          string          `json:"specificationCode"`
	ParticipantName            string          `json:"participantName"`
	ParticipantDocumentNumber  string          `json:"participantDocumentNumber"`
	EquitiesQuantity           float64         `json:"equitiesQuantity"`
	ClosingPrice               float64         `json:"closingPrice"`
	UpdateValue                float64         `json:"updateValue"`
	Isin                       string          `json:"isin"`
	DistributionIdentification int             `json:"distributionIdentification"`
	BookkeeperName             string          `json:"bookkeeperName"`
	AvailableQuantity          float64         `json:"availableQuantity"`
	UnavailableQuantity        float64         `json:"unavailableQuantity"`
	AdministratorName          string          `json:"administratorName"`
	ParticipantCode            string          `json:"participantCode"`
	AccountNumber              string          `json:"accountNumber"`
	Reasons                    []ReasonsEntity `json:"reasons"`
}
type ReasonsEntity struct {
	ReasonName         string `json:"reasonName"`
	CollateralQuantity int    `json:"collateralQuantity"`
	CounterpartName    string `json:"counterpartName"`
}
type Links struct {
	Self  string `json:"self"`
	First string `json:"first"`
	Prev  string `json:"prev"`
	Next  string `json:"next"`
	Last  string `json:"last"`
}

func getEquitiesQuery(document string, start time.Time, end time.Time, page int) string {
	equitiesPath := fmt.Sprintf(EquitiesPath, document)
	query := fmt.Sprintf(
		"?referenceStartDate=%s&referenceEndDate=%s&page=%d",
		start.Format("YYYY-MM-DD"),
		end.Format("YYYY-MM-DD"),
		page,
	)
	return BaseHost + PositionPath + equitiesPath + query
}

func (a *B3API) GetEquitiesPositionByDate(document string, start time.Time, end time.Time) (EquitiesResponse, error) {
	var ret EquitiesResponse
	url := getEquitiesQuery(document, start, end, 1)
	req, err := http.Get(url)
	fmt.Printf("REQQQQQQQQ %v\n", req)
	fmt.Printf("REQQQQQQQQ STATUS CODE %d\n", req.StatusCode)
	fmt.Printf("REQQQQQQQQ STATUS %s\n", req.Status)
	if req.StatusCode != 200 {
		return EquitiesResponse{}, handleHttpError(req, err)
	}

	if err != nil {
		return EquitiesResponse{}, err
	}
	defer req.Body.Close()

	err = json.NewDecoder(req.Body).Decode(&ret)
	if err != nil {
		return EquitiesResponse{}, err
	}
	return ret, nil
}

func processErrorHeader(msg string) string {
	msg = strings.ReplaceAll(msg, "Bearer", "")
	msg = strings.TrimSpace(msg)
	pairs := ParseKeyValues(msg)

	return pairs["error_description"]
}

func ParseKeyValues(kvStr string) map[string]string {
	var kvPairRe = regexp.MustCompile(`(.*?)=([^=]*)(?:,|$)`)
	res := map[string]string{}
	for _, kv := range kvPairRe.FindAllStringSubmatch(kvStr, -1) {
		res[kv[1]] = kv[2]
	}
	return res
}

func handleHttpError(req *http.Response, err error) error {
	errMsg := ""
	if err != nil {
		errMsg = err.Error()
	} else {
		authError := req.Header.Get("Www-Authenticate")
		if authError != "" {
			errMsg = processErrorHeader(authError)
		}
	}
	message := fmt.Sprintf("B3APIError: '%s'", errMsg)
	detail := "- Detail: '%s'"
	switch req.StatusCode {
	case 400:
		if strings.Contains(req.Status, "400.01") {
			return errors.New(message + fmt.Sprintf(detail, "invalid format for value (valor)"))
		} else if strings.Contains(req.Status, "400.02") {
			return errors.New(message + fmt.Sprintf(detail, "invalid length for (campo)(valor)"))
		} else if strings.Contains(req.Status, "400.03") {
			return errors.New(message + fmt.Sprintf(detail, "invalid value for (campo)(valor)"))
		} else {

			return errors.New(message + fmt.Sprintf(detail, "unknown error"))
		}
	case 401:
		return errors.New(message + fmt.Sprintf(detail, "unauthorized"))
	case 403:
		return errors.New(message + fmt.Sprintf(detail, "forbidden"))
	case 404:
		return errors.New(message + fmt.Sprintf(detail, "not found"))
	case 422:
		if strings.Contains(req.Status, "422.01") {
			return errors.New(message + fmt.Sprintf(detail, "invalid format for cpf/cnpj"))
		} else if strings.Contains(req.Status, "422.02") {
			return errors.New(message + fmt.Sprintf(detail, "participant not authorized to access CPF/CNPJ"))
		} else if strings.Contains(req.Status, "422.03") {
			return errors.New(message + fmt.Sprintf(detail, "CPF/CNPJ not found"))
		} else if strings.Contains(req.Status, "422.04") {
			return errors.New(message + fmt.Sprintf(detail, "invalid format for referenceDate"))
		} else if strings.Contains(req.Status, "422.05") {
			return errors.New(message + fmt.Sprintf(detail, "referenceDate must be before now"))
		} else if strings.Contains(req.Status, "422.06") {
			return errors.New(message + fmt.Sprintf(detail, "endDate must be before referenceDate"))
		} else if strings.Contains(req.Status, "422.07") {
			return errors.New(message + fmt.Sprintf(detail, "referenceDate must not be before 2018"))
		} else {
			return errors.New(message + fmt.Sprintf(detail, "unknown error"))
		}
	case 429:
		return errors.New(message + fmt.Sprintf(detail, "too many requests"))
	case 500:
		return errors.New(message + fmt.Sprintf(detail, "internal server error"))
	case 503:
		return errors.New(message + fmt.Sprintf(detail, "service unavailable"))
	default:
		return errors.New(message + fmt.Sprintf(detail, "unknown"))
	}
}
