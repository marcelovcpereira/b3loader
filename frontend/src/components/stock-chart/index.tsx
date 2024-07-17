import moment from 'moment'
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import CustomTooltip from './CustomTooltip';

export interface StockChartProps {
    stockName: string
    data: any[]
}

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

  
export default function StockChart(props: StockChartProps) {
    return (
        <>
            {/* Selected Stock Name Label  */}
            <div style={{width: "100%", height:"60px"}}>
                <div style={{float:"left", width:"20%", height:"100%"}}>
                    <span style={{color:"#6f7380", fontFamily:"tahoma", fontSize:"27px", fontWeight:"bold", position: "relative", top:"20%"}}>{props.stockName.toUpperCase()}</span>
                </div>
            </div>
            {/* Chart */}
            <AreaChart
                width={900}
                height={400}
                data={props.data}
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
                    ticks={getTicksFromInterval(props.data[0].Date, props.data[props.data.length-1].Date)}
                    domain={getDomainFromInterval(props.data[0].Date, props.data[props.data.length-1].Date)}
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
        </>
    )
}