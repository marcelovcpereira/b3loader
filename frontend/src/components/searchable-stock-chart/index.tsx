import { useEffect, useReducer, useState } from 'react';
import moment from 'moment'
import { Box, useCombobox } from '@mantine/core';
import { MantineProvider } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { Loader } from '@mantine/core';
import { Alert } from '@mantine/core';
import SearchInput from '../search-input';
import StockChart from '../stock-chart';
import { BackendAPI } from '../../api/base';

const NO_DATA_FOUND_MESSAGE = "No data found"
const ERROR_MESSAGE = "Error searching quote data"

export interface SearchableStockChartProps {
  api: BackendAPI
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

export default function SearchableStockChart(props: SearchableStockChartProps) {  
  // Selected Stock Label 
  const [stock, setStock] = useState("TAEE11"); 
  // Input search word
  const [searchTerm, setSearchTerm] = useState('')
  
  // Autocomplete list and dropdown
  const [stockList, setStockList] = useState([] as string[]); 
  const combobox = useCombobox();

  // Chart
  const [api, dispatch] = useReducer(dataReducer, {loading: false,error: false,data: null});
  const infoIcon = <IconInfoCircle />;
  console.log("stockList:", stockList)
  
  // Updates the chart with a new Stock by name. 
  // It searches the daily quotes of automatically and updates the visualization
  const updateChart = async (stockName: string) => {
    dispatch({ type: "LOADING" });
    let response = await props.api.searchQuotesFromStock(stockName)
    if (response.error != undefined) {
      console.log("SearchableStockChart: Error updateChart", response.error)
      dispatch({ type: "ERROR" })
    } else if (response.data != undefined) {
      let data = response.data.data
      if (data.length > 0) {
        data.forEach((d:any) => {
          d.Date = moment(d.Date).valueOf();
        });
        dispatch({ type: "LOADED", payload: data });
      } else {
        dispatch({ type: "NOT_FOUND" });
      }
    }
  }

  const selectDropdownValue = (val: string) => {
    console.log("SUBMITING", val)
    setStock(val)
    updateChart(val)
    combobox.closeDropdown();
  }

  // Called every time "searchTerm" is updated (delayed).
  // It searches the possible stock names matching and updates the dropdown list
  const updateSearch = async (name: string) => {
    if (name.trim() != "") {
      let response = await props.api.searchStock(name)
      if (response.error != undefined) {
        console.log("SearchableStockChart: Error updateSearch", response.error)
      } else if (response.data != undefined) {
        let data = response.data.data as string[]
        if (data.length > 0) {
          setStockList(data)
          combobox.openDropdown()
        } else {
          console.log("unexpected", response)
        }
      }
    }
  }

  const RenderLoading = () => {
    return (
      <MantineProvider defaultColorScheme="light">
        <Loader color="blue" style={{marginLeft:"20px", marginTop:"5px"}}/>
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
  