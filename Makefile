# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOGENERATE=$(GOCMD) generate
GOGET=$(GOCMD) get
GOINSTALL=$(GOCMD) install
GOLIST=$(GOCMD) list
GOMOD=$(GOCMD) mod
GOTEST=$(GOCMD) test
GOVET=$(GOCMD) vet
GOTOOL=$(GOCMD) tool

.EXPORT_ALL_VARIABLES:

GO111MODULE=on
CGO_ENABLED=0

SHELL      := bash
.DEFAULT: help

.PHONY: build run vet test

run: build-loader
	build/b3loader

build-loader:
	cd ./api && \
	$(GOBUILD) -o build/b3loader -v github.com/marcelovcpereira/b3loader/api/cmd

build-docker:
	cd ./api && \
	docker build -t b3loader:latest -f build/Dockerfile .

govet:
	cd ./api && \
	$(GOVET) ./...

test:
	cd ./api && \
	$(GOTEST) -cover ./...

refresh:
	git pull origin master && \
	make build-docker && \
	compose-up

compose-up:
	docker compose up -d --force-recreate b3loader influxdb grafana --build b3loader
	python3 -m webbrowser http://localhost:3000