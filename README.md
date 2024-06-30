# B3loader

Shows historical data from B3 (Brazilian Stock Exchange) in visual dashboards.

Composed of 3 parts:

- `B3loader`: Golang project that loads backup files, parses and persists the data on a Influx database

- `InfluxDB`: Event database that stores stock information

- `Grafana`: Visualization tool that provides a dashboard for visualizing the data in the database

## Requirements

- Docker compose

## Usage

Clone this repository:
```bash
git clone https://github.com/marcelovcpereira/b3loader.git
```

Review the contents of `example.env` file and copy it to `.env` 

Run:
```bash
docker compose up -d --force-recreate
```

This will run the 3 apps, but with NO DATA.

## Loading data into the database

The b3loader is a REST API that accepts requests for loading data into the database.
The endpoint is:

`http://localhost:8080/quotes/load/{filename}`

Where `filename` should be the name of a valid B3 Backup file located at `{THIS_PROJECT_PATH}/data/b3loader-data`


## Downloading the data directly from B3

B3 website provides a form for downloading historical data [here](https://www.b3.com.br/pt_br/market-data-e-indices/servicos-de-dados/market-data/historico/mercado-a-vista/series-historicas/).
You can download the data yearly and the file name will be in the format:
```bash
COTAHIST_A{YEAR}.ZIP
```
For example, the file with data from all 2023 year is:
```bash
COTAHIST_A2023.ZIP
```

B3 provides files with data from 1986 until now.

Put as many files as you want in the `b3loader-data` folder.
The app automatically unzips them locally for reading in case they are zipped.