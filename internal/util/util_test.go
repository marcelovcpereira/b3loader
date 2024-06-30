package util_test

import (
	"fmt"
	"github.com/marcelovcpereira/b3loader/internal/util"
	"github.com/stretchr/testify/assert"
	"testing"
	"time"
)

func TestTrimShouldRemoveWhiteSpaces(t *testing.T) {
	expected := "BBAS3"
	input := fmt.Sprintf("BBAS3%s", "       ")

	result := util.Trim(input)

	assert.Equal(t, expected, result)
}

func TestParseDateShouldReturnCorrectTime(t *testing.T) {
	expected := time.Date(2024, time.September, 9, 0, 0, 0, 0, time.UTC)
	input := "20240909"

	result := util.ParseDate(input)

	assert.Equal(t, result, expected)
}

func TestParseMoneyShouldReturnCorrectFloat(t *testing.T) {
	expected := 23.99
	input := "0000000002399"

	result := util.ParseMoney(input)

	assert.Equal(t, result, expected)
}
