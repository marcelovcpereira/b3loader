import moment from 'moment'
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import CustomTooltip from './CustomTooltip';
import { Helper } from '../../helper';

export interface StockChartProps {
    stockName: string
    data: any[]
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
                    ticks={Helper.getTicksFromDateList(props.data.map(e=>new Date(e.Date)))}
                    domain={Helper.getDomainFromDateList(props.data.map(e=>new Date(e.Date)))}
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
                    tickFormatter={Helper.parseMoney} 
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