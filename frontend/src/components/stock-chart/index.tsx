import moment from 'moment'
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import CustomTooltip from './CustomTooltip';
import { Helper } from '../../helper';
import { Quote } from '../../api/base';
import { MantineProvider } from '@mantine/core';

export interface StockChartProps {
    stockName: string
    period: string
    data: Quote[]
}



export default function StockChart(props: StockChartProps) {
    return (
        <MantineProvider defaultColorScheme="light">
            
            {/* Chart */}
            <AreaChart
                width={900}
                height={400}
                data={props.data}
                margin={{
                top: 5,
                right: 30,
                left: 15,
                bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    scale="time"
                    type="number"
                    dataKey='Date'
                    tickFormatter = {(timestamp) => moment(timestamp).format('DD/MM/YYYY')}
                    tick={{strokeWidth: 1}}
                    ticks={Helper.getTicksFromPeriod(props.period)}
                    domain={[Helper.getStartFromPeriod(props.period).valueOf(), new Date().valueOf()]}
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
                <Tooltip content={<CustomTooltip active={false} payload={[]} />} />
                <Line yAxisId={10} type="linear" dataKey="Value" stroke="#8884d8" />
            </AreaChart>
        </MantineProvider>
    )
}