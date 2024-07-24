import moment from 'moment'
import { useCombobox } from '@mantine/core';
import { MantineProvider } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { Loader } from '@mantine/core';
import { Alert } from '@mantine/core';
import SearchInput from '../search-input';
import StockChart from '../stock-chart';
import { BackendAPI, Quote } from '../../api/base';
import { Reducer, useEffect, useReducer, useState } from 'react';
import StockChartHeader from '../stock-chart-header';

const NO_DATA_FOUND_MESSAGE = "No data found"
const ERROR_MESSAGE = "Error searching quote data"

export interface SearchableStockChartProps {
  api: BackendAPI
}

enum ActionType {
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = "ERROR",
  NOT_FOUND = "NOT_FOUND"
}
export type State = {
  loading: boolean;
  error: boolean;
  data: Quote[] | []
}

export type Action = {
  type: ActionType,
  payload?: Quote[]
}


const dataReducer: Reducer<State, Action> = (state:State, action:Action) => {
  switch (action.type) {
    case "LOADING":
    return { ...state, loading: true, error: false, data: [] };
    case "LOADED":
    return { ...state, loading: false, error: false, data: action.payload! as Quote[] };
    case "ERROR":
    return { ...state, loading: false, error: true, data: [] };
    case "NOT_FOUND":
    return { ...state, loading: false, error: false, data: [] };
    default:
    return state;
  }
};

export default function SearchableStockChart(props: SearchableStockChartProps) {  
  // Selected Stock Label 
  const [stock, setStock] = useState("BBAS3"); 

  // Selected Period
  const [period, setPeriod] = useState("1y"); 

  const updatePeriod = (periodo: string) => {
    console.log("UPDATING PERIOD...", periodo)
    setPeriod(periodo)
    updateChart(stock, periodo)
  }
  // Input search word
  const [searchTerm, setSearchTerm] = useState('')
  
  // Autocomplete list and dropdown
  const [stockList, setStockList] = useState([] as string[]); 
  const combobox = useCombobox();

  // Chart
  const [api, dispatch] = useReducer(dataReducer, {loading: false,error: false, data: []});
  const infoIcon = <IconInfoCircle />;
  console.log("stockList:", stockList)
  
  // Updates the chart with a new Stock by name. 
  // It searches the daily quotes of automatically and updates the visualization
  const updateChart = async (stockName: string, periodo?: string) => {
    dispatch({ type: ActionType.LOADING, payload: undefined });
    console.log("PERIOD FOR QUERY", periodo)
    const response = await props.api.searchQuotesFromStock(stockName, periodo? periodo : period)
    if (response.error != undefined) {
      console.log("SearchableStockChart: Error updateChart", response.error)
      dispatch({ type: ActionType.ERROR })
    } else if (response.data != undefined) {
      const data = response.data.data as Quote[]
      if (data && data.length > 0) {
        data.forEach((d:Quote) => {
          d.Date = moment(d.Date).valueOf();
        });
        dispatch({ type: ActionType.LOADED, payload: data });
      } else {
        dispatch({ type: ActionType.NOT_FOUND });
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
      const response = await props.api.searchStock(name)
      if (response.error != undefined) {
        console.log("SearchableStockChart: Error updateSearch", response.error)
      } else if (response.data != undefined) {
        const data = response.data.data as string[]
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
      <div  style={{marginLeft:"40px"}}>
      <MantineProvider defaultColorScheme="light">
        {RenderInput()}
        <StockChartHeader data={api.data} stockName={stock} period={period} setPeriod={updatePeriod}/>
        <Loader color="blue" style={{marginLeft:"20px", marginTop:"5px"}}/>
      </MantineProvider>
      </div>
    )
  }

  const RenderError = () => {
    return (
      <div  style={{marginLeft:"40px"}}>
      <MantineProvider defaultColorScheme="light">
        {RenderInput()}
        <Alert variant="outline" color="red" title="Erro inesperado" icon={infoIcon}>
          {ERROR_MESSAGE}
        </Alert>
      </MantineProvider>
      </div>
    )
  }

  const RenderChart = () => {
    return (
      <div  style={{marginLeft:"40px"}}>
        {RenderInput()}
        <StockChartHeader data={api.data} stockName={stock} period={period} setPeriod={updatePeriod}/>
        <StockChart data={api.data} stockName={stock} period={period}/>
    </div>
    )
  }

  const RenderInput = () => {
    return (
        <SearchInput 
          combobox={combobox} 
          valuesList={stockList}
          onChangeCallback={setSearchTerm}
          onSelectValueCallback={selectDropdownValue}
        />
    )
  }

  const RenderNoData = () => {
    return (
      <div  style={{marginLeft:"40px"}}>
      <MantineProvider defaultColorScheme="light">
        
        {RenderInput()}
        <StockChartHeader data={api.data} stockName={stock} period={period} setPeriod={updatePeriod}/>
        <span>{NO_DATA_FOUND_MESSAGE}</span>
        
      </MantineProvider>
      </div>
    )
  }
  
  // Initialize search input with 1s debounce when "searchTerm" is updated
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      console.log("searchTerm", searchTerm)
      updateSearch(searchTerm)
    }, 1000)
    return () => clearTimeout(delayDebounceFn)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

    // Initialize Chart
    useEffect(() => {
      updateChart(stock)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  return (
    api.loading ? 
      RenderLoading()
    :api.error ? 
      RenderError()
    :api.data && api.data.length > 0 ? 
      RenderChart() 
    : RenderNoData()
  )
}
  