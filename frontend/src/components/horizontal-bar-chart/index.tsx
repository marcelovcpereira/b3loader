
import { BarChart, XAxis, YAxis, Bar, Tooltip, Cell } from 'recharts';
// import { data } from './data';
import { Box } from '@mantine/core';
import CustomTooltip from './CustomTooltip';
import { Helper } from '../../helper';

export type DataItem = {
    name: string;
    uv: number;
    pv: number;
}

export interface HorizontalBarChartProps {
    data: DataItem[]
    colors: string[]
} 

export default function HorizontalBarChart(props: HorizontalBarChartProps) {
    const orderedData = props.data
    if (orderedData.length > 0) {
        orderedData.sort((a, b) => (b.uv < a.uv ? -1 : 1))
    }
    console.log("TICKSSSS", Array.from(new Set(orderedData.map((e:DataItem)=>{return e.name}))))
  return (  
    <Box>
    <BarChart reverseStackOrder={true} width={600} height={350} data={orderedData} layout='vertical'>
        <XAxis 
            dataKey="uv" 
            type={'number'}
            axisLine={false}
            tickLine={false}
            ticks={[]}
        />
        <YAxis 
            yAxisId="0" 
            dataKey='name' 
            width={100} 
            type="category"
            ticks={ Array.from(new Set(orderedData.map((e:DataItem)=>{return e.name}))) }
            style={{fontFamily:"sans-serif"}}
            tick={{
                fontSize: "14px",
                fontWeight: "bold"
              }}
        />
        <YAxis 
            orientation="right"
            yAxisId="1" 
            dataKey='uv' 
            type="category"
            axisLine={false}
            tickLine={false}
            tickFormatter={Helper.parseMoney}
            tick={{
                transform: `translate(-55, 0)`,
                fontSize: "14px"
              }}
        />
        <Tooltip formatter={Helper.parseMoney} content={<CustomTooltip active={false} payload={[]}/>}/>
        <Bar name="Value" dataKey="uv" fill="#84846c">
        {orderedData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={props.colors[index % props.colors.length]} />
            ))}
        </Bar>
    </BarChart>
    </Box>            
  );
}
