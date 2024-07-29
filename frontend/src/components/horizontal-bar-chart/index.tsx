
import { CartesianGrid, BarChart, XAxis, YAxis, Bar, Tooltip, Cell } from 'recharts';
// import { data } from './data';
import { Box } from '@mantine/core';
import CustomTooltip from './CustomTooltip';
import { Helper, chartColors } from '../../helper';

export type DataItem = {
    name: string;
    uv: number;
    pv: number;
}

export interface HorizontalBarChartProps {
    data: DataItem[]
} 

const COLORS = chartColors

export default function HorizontalBarChart(props: HorizontalBarChartProps) {
    const orderedData = props.data
    if (orderedData.length > 0) {
        orderedData.sort((a, b) => (b.uv < a.uv ? -1 : 1))
    }
  return (  
    <Box>
    <BarChart reverseStackOrder={true} width={600} height={350} data={orderedData} layout='horizontal'>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fill: '#6f7380', fontFamily:"monospace", fontWeight:"bold" }}/>
        <YAxis 
            yAxisId="0" 
            dataKey='uv' 
            width={100} 
            tickMargin={5} 
            ticks={ Helper.getTicksFromNumberList(orderedData.map((e:DataItem)=>{return e.uv})) }
            tickFormatter={(value: unknown) => { return Helper.parseMoney(value as number)}} 
            style={{fontFamily:"sans-serif"}}
        />
        <Tooltip formatter={Helper.parseMoney} content={<CustomTooltip active={false} payload={[]}/>}/>
        <Bar name="Value" dataKey="uv" fill="#84846c">
        {orderedData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
        </Bar>
        
    </BarChart>
    </Box>            
  );
}
