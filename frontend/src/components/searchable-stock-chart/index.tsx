import { useEffect, useReducer, useState } from 'react';
import moment from 'moment'
import { Box, Title, useCombobox } from '@mantine/core';
import { MantineProvider } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { Loader, Text } from '@mantine/core';
import { Alert } from '@mantine/core';
import SearchInput from '../search-input';
import StockChart from '../stock-chart';

const API_URL = "http://localhost:8080"
const NO_DATA_FOUND_MESSAGE = "No data found"
const ERROR_MESSAGE = "Error searching quote data"

console.log("VITE ENV:", import.meta.env) // "123"

const searchQuotesFromStock = (stock: string) => {
  let url = `${API_URL}/api/v1/quotes/${stock}`
  console.log("FETCHING", url)
  console.log("API",import.meta.env.VITE_B3LOADER_URL) // "123"
  console.log("FOLDER",import.meta.env.VITE_DIRECTORY_PATH) // "123"

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

export default function SearchableStockChart() {  
  // Selected Stock Label 
  const [stock, setStock] = useState("TAEE11"); 
  // Input search word
  const [searchTerm, setSearchTerm] = useState('')
  
  // Autocomplete list and dropdown
  const [stockList, setStockList] = useState([]); 
  const combobox = useCombobox();

  // Chart
  const [api, dispatch] = useReducer(dataReducer, {loading: false,error: false,data: null});
  const infoIcon = <IconInfoCircle />;
  console.log("stockList:", stockList)
  
  // Updates the chart with a new Stock by name. 
  // It searches the daily quotes of automatically and updates the visualization
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

  const selectDropdownValue = (val: string) => {
    console.log("SUBMITING", val)
    setStock(val)
    updateChart(val)
    combobox.closeDropdown();
  }

  // Called every time "searchTerm" is updated (delayed).
  // It searches the possible stock names matching and updates the dropdown list
  const updateSearch = (name: string) => {
    if (name.trim() != "") {
      searchStock(name).then(res => {
        if (res && res.data && res.data.length > 0) {
          setStockList(res.data)
          combobox.openDropdown()
        } else {
          console.log("unexpected", res)
        }
      }).catch((err: Error)=>{
        console.log("er", err)
      })
    }
  }

  const RenderLoading = () => {
    return (
      <MantineProvider defaultColorScheme="light">
        {RenderHeader()}
        <Loader color="blue" style={{marginLeft:"20px", marginTop:"5px"}}/>
      </MantineProvider>
    )
  }

  const RenderHeader = () => {
    return (
      <MantineProvider defaultColorScheme="light">
        <Title order={1} style={{marginBottom:"40px", paddingLeft:"30px", float:"left", fontFamily:"tahoma", fontWeight:"100  "}}>
          B3 Stock Price
        </Title>
      </MantineProvider>
    )
  }

  const RenderError = () => {
    return (
      <MantineProvider defaultColorScheme="light">
        <Alert variant="outline" color="red" title="Erro inesperado" icon={infoIcon}>
          {ERROR_MESSAGE}
        </Alert>
      </MantineProvider>
    )
  }

  const RenderChart = () => {
    return (
      <>
      {RenderHeader()}
      <SearchInput 
        combobox={combobox} 
        valuesList={stockList}
        onChangeCallback={setSearchTerm}
        onSelectValueCallback={selectDropdownValue}
      />
      <StockChart data={api.data} stockName={stock}/>
    </>
    )
  }

  const RenderNoData = () => {
    return (
      <MantineProvider defaultColorScheme="light">
        {RenderHeader()}
        <Box>
          <span>{NO_DATA_FOUND_MESSAGE}</span>
        </Box>
      </MantineProvider>
    )
  }
  
  // Initialize search input with 1s debounce when "searchTerm" is updated
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      console.log("searchTerm", searchTerm)
      updateSearch(searchTerm)
    }, 1000)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

    // Initialize Chart
    useEffect(() => {
      updateChart(stock)
    }, []);

  return (
    api.loading ? 
      RenderLoading()
    : api.error ? 
      RenderError()
    : api.data ? 
      RenderChart() 
    : 
      RenderNoData()
  )
}
  