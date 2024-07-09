# B3loader

Shows historical data from B3 (Brazilian Stock Exchange) in visual dashboards.

Composed of 4 parts:

- `B3loader`: Golang project that loads backup files, parses and persists the data on a Influx database

- `InfluxDB`: Event database that stores stock information

- `B3loader-front`: Frontend application for visualizing customized charts

- `Grafana`: (optional) Visualization tool that provides a dummy dashboard for visualizing the data in the database

## Requirements

- Docker compose

## Usage

Clone this repository:
```shell
git clone https://github.com/marcelovcpereira/b3loader.git
```

Review the contents of `example.env` file and copy it to `.env` 

Run:
```shell
make compose-up
```
to automatically open the frontend afterwards. 
Or
```shell
docker compose up -d
```
in case you don't have python3 installed or even Make

This will run the 4 apps, but with NO DATA.

## Loading data into the database

The `b3loader` is a REST API that accepts requests for loading data into the database.
The endpoint is:

`http://localhost:8080/api/v1/quotes/file/{filename}/import`

Where `filename` should be the name of a valid B3 Backup file located at `{THIS_PROJECT_PATH}/data/b3loader-data`. Example:

```shell
curl http://localhost:8080/api/v1/quotes/file/COTAHIST_A2024.ZIP/import
```


## Downloading the data directly from B3

B3 website provides a form for downloading historical data [here](https://www.b3.com.br/pt_br/market-data-e-indices/servicos-de-dados/market-data/historico/mercado-a-vista/series-historicas/).
You can download the data yearly and the file name will be in the format:
```shell
COTAHIST_A{YEAR}.ZIP
```
For example, the file with data from all 2023 year is:
```shell
COTAHIST_A2023.ZIP
```

B3 provides files with data from 1986 until now.

Put as many files as you want in the `b3loader-data` folder.
The app automatically unzips them locally for reading in case they are zipped.

## Frontend

Visit [http://localhost:9000](http://localhost:9000) after running  `make compose-up`

![B3 Loader Frontend](https://github.com/marcelovcpereira/b3loader/blob/master/b3loader-front.png?raw=true)
![B3 Loader Frontend2](https://github.com/marcelovcpereira/b3loader/blob/master/b3loader-front2.png?raw=true)

## InfluxDB Database

The influxdb data can be visualized directly if you visit:
```shell
http://localhost:8086
```
And login with the user/pass that you defined in the `.env` file.

## Grafana dashboard

You can see an example dashboard if you visit grafana at:
```shell
http://localhost:3000
```

![Dummy Grafana Dashboard](https://github.com/marcelovcpereira/b3loader/blob/master/grafana.png?raw=true)