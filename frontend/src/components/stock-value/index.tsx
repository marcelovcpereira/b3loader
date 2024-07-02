import { useEffect, useReducer, useState } from 'react';
import moment from 'moment'
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import CustomTooltip from './CustomTooltip';

const API_URL = "http://localhost:8080"
console.log("API URL", API_URL)
const fetchData = (stock: string) => {
  let url = `${API_URL}/api/v1/quotes/${stock}`
  console.log("FETCHING", url)
  return fetch(url)
      .then(response => response.json())
      .then(result => {
        console.log(result)
        return result
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
  console.log(`Defined ${ticks.length} ticks: ${ticks.join(",")}`)
  return ticks
}

function getDomainFromInterval(start: string, end: string): number[] {
  return [new Date(start).valueOf(), new Date(end).valueOf()]
}



export default function StockValue() {  
  const [stock, setStock] = useState("TAEE11"); 

  const updateQuotes = (name: string) => {
    dispatch({ type: "LOADING" });
    fetchData(name)
      .then((res:any) => {
        console.log("RESRESRRESRESRSERS", res)
        if (res) {
          res.data.forEach((d:any) => {
            d.Date = moment(d.Date).valueOf();
          });
          dispatch({ type: "LOADED", payload: res.data });
        } else {
          dispatch({ type: "ERROR" });
        }
        
      })
      .catch((err: Error) => {
        console.log(err)
        dispatch({ type: "ERROR" });
      });
  }

  const changeInput = (e:any) => {
    if (e.key === 'Enter') {
      console.log("TRIGGERING: " + e.target.value)
      setStock(e.target.value)
      updateQuotes(e.target.value)
    }
  }

  const [api, dispatch] = useReducer(dataReducer, {loading: false,error: false,data: null});
  
  useEffect(() => {
    updateQuotes(stock)
  }, []);
  
  return api.loading ? (
    "Loading..."
  ) : api.error ? (
    "Some error occurred"
  ) : api.data ? (
    
    <>
    <div style={{width: "100%", height:"60px"}}>
      <div style={{float:"left", width:"20%", height:"100%", borderRadius:"50%", borderColor:"black"}}>
        <span style={{fontFamily:"tahoma", fontSize:"27px", fontWeight:"bold", position: "relative", top:"20%"}}>{stock.toUpperCase()}</span>
      </div>
      <div style={{float:"right", width:"80%", height:"100%", paddingTop:"15px"}}>
        <input type="text" style={{width:"150px", height:"35px", fontFamily:"tahoma", fontSize:"20px"}} onKeyDown={changeInput} defaultValue={""}/> <span style={{fontSize:"15px"}}>(ex: SAPR4, BBAS3, HGLG11, etc)</span>
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
        
        <Line yAxisId={10} type="linear" dataKey="Value" stroke="#8884d8" strokeWidth={"100px"} />
      </AreaChart>
      </div>
    </>
  ) : (<><span>Nenhum dado encontrado</span></>);
}
  