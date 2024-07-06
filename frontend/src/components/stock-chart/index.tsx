import { useEffect, useReducer, useState } from 'react';
import moment from 'moment'
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import CustomTooltip from './CustomTooltip';
import { Combobox, useCombobox } from '@mantine/core';
import { MantineProvider } from '@mantine/core';
import { TextInput, rem } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { Loader } from '@mantine/core';

const API_URL = "http://localhost:8080"

const searchQuotesFromStock = (stock: string) => {
  let url = `${API_URL}/api/v1/quotes/${stock}`
  console.log("FETCHING", url)
  return fetch(url)
      .then(response => response.json())
      .catch(error => console.log('error', error))
}
const searchStock = (stock: string) => {
  let url = `${API_URL}/api/v1/stocks/${stock}`
  console.log("FETCHING", url)
  return fetch(url)
      .then(response => {
        return response.json()
      })
      .catch(error => console.log('error', error))
}

const dataReducer = (state:any, action:any) => {
  switch (action.type) {
    case "LOADING":
    return { ...state, loading: true, error: false, data: null };
    case "LOADED":
    return { ...state, loading: false, error: false, data: action.payload };
    case "ERROR":
    return { ...state, loading: false, error: true, data: null };
    case "NOT_FOUND":
    return { ...state, loading: false, error: false, data: null };
    default:
    return state;
  }
};

function getTicksFromInterval(start: string, end: string): number[] {
  let ticks: number[] = []
  let startYear: number = new Date(start).getFullYear()
  let endYear: number = new Date(end).getFullYear()
  while(startYear <= endYear) {
    let yearStr = startYear.toString() + "-01-01T00:00:00"
    let d = Date.parse(yearStr).valueOf()
    ticks.push(d)

    let yearStr6 = startYear.toString() + "-07-01T00:00:00"
    let d6 = Date.parse(yearStr6).valueOf()
    ticks.push(d6)
    startYear++
  }
  // console.log(`Defined ${ticks.length} ticks: ${ticks.join(",")}`)
  return ticks
}

function getDomainFromInterval(start: string, end: string): number[] {
  return [new Date(start).valueOf(), new Date(end).valueOf()]
}

export default function StockChart() {  
  const [stock, setStock] = useState("TAEE11"); 
  const [stockList, setStockList] = useState([]); 
  const icon = <IconSearch style={{ width: rem(16), height: rem(16) }} />;
  const [searchTerm, setSearchTerm] = useState('')
  const [api, dispatch] = useReducer(dataReducer, {loading: false,error: false,data: null});
  const combobox = useCombobox();
  console.log("STOCK LIST:", stockList)
  
  const updateChart = (stockName: string) => {
    dispatch({ type: "LOADING" });
    searchQuotesFromStock(stockName)
      .then((res:any) => {
        if (res && res.data) {
          res.data.forEach((d:any) => {
            d.Date = moment(d.Date).valueOf();
          });
          dispatch({ type: "LOADED", payload: res.data });
        } else {
          dispatch({ type: "NOT_FOUND" });
        }
        
      })
      .catch((err: Error) => {
        console.log(err)
        dispatch({ type: "ERROR" });
      });
  }

  const updateSearch = (name: string) => {
    if (name.trim() != "") {
      searchStock(name).then(res => {
        console.log("RESRES", res)
        console.log("RES>DATA", res.data)
        if (res && res.data && res.data.length > 0) {
          console.log("SETTING RES DATA")
          setStockList(res.data)
          combobox.toggleDropdown()
        } else {
          console.log("bosta", res)
        }
      }).catch((err: Error)=>{
        console.log("er", err)
      })
    }
  }
  
  useEffect(() => {
    updateChart(stock)
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      console.log("searchTerm", searchTerm)
      updateSearch(searchTerm)
    }, 1000)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  return api.loading ? (
    <MantineProvider defaultColorScheme="light">
      <Loader color="blue" />
    </MantineProvider>
  ) : api.error ? (
    "Some error occurred"
  ) : api.data ? (  
    <>
    <div id="searchInput" style={{width:"100%", display:"flex"}}>
      <MantineProvider defaultColorScheme="light">
        <Combobox
          store={combobox}
          width={250}
          position="bottom-start"
          withArrow
          onOptionSubmit={(val) => {
            console.log("SUBMITING", val)
            setStock(val)
            updateChart(val)
            combobox.closeDropdown();
          }}
        >
          <Combobox.Target withAriaAttributes={false}>
              <TextInput
                size="lg"
                leftSectionPointerEvents="none"
                leftSection={icon}
                label=""
                style={{margin:"auto", width:"250px", height:"45px", fontSize: "100px"}}  
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder=""
                onClick={combobox.openDropdown}
              />
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>
              {
                stockList.length > 0 ? 
                  (stockList.map(stock => 
                    <Combobox.Option value={stock}>{stock}</Combobox.Option>
                  )) 
                : 
                  <Combobox.Empty>Nothing found</Combobox.Empty>
              }
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
      </MantineProvider>
    </div>
    <div style={{width: "100%", height:"60px"}}>
      <div style={{float:"left", width:"20%", height:"100%", borderRadius:"50%", borderColor:"black"}}>
        <span style={{fontFamily:"tahoma", fontSize:"27px", fontWeight:"bold", position: "relative", top:"20%"}}>{stock.toUpperCase()}</span>
      </div>
    </div>
    <div style={{borderStyle:"thick", borderWidth:"5px", borderColor:"black", width: "1000px"}}>
    <AreaChart
        width={900}
        height={400}
        data={api.data}
        margin={{
          top: 5,
          right: 30,
          left: 60,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          scale="time"
          type="number"
          dataKey = 'Date'
          tickFormatter = {(timestamp) => moment(timestamp).format('DD/MM/YYYY')}
          tick={{strokeWidth: 1}}
          ticks={getTicksFromInterval(api.data[0].Date, api.data[api.data.length-1].Date)}
          domain={getDomainFromInterval(api.data[0].Date, api.data[api.data.length-1].Date)}
        />
         <Area
            type="monotone"
            dataKey="Value"
            stroke="#a6a68e"
            strokeWidth={2.5}
            fill="#c8c8af"
            fillOpacity={0.7}
            gradientTransform="skewX(20) translate(-35, 0)"
            dot={false}
            yAxisId="0"
          />
        <YAxis 
          dataKey='Value'
          tickFormatter = {(price) => `R$${price.toFixed(2).toString()}`} 
          tickCount={8}
          tickMargin={5}
          tickSize={5}
        />
        <Tooltip content={<CustomTooltip />} />
        
        <Line yAxisId={10} type="linear" dataKey="Value" stroke="#8884d8" />
      </AreaChart>
      </div>
    </>
  ) : (
    <>
      <span>Nenhum dado encontrado</span>
    </>
  );
}
  