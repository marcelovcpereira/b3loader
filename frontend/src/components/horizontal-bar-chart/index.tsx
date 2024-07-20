
import { CartesianGrid, BarChart, XAxis, YAxis, Legend, Bar, Tooltip } from 'recharts';
import { data } from './data';
import { Box } from '@mantine/core';
import CustomTooltip from './CustomTooltip';
import { Helper } from '../../helper';

export type DataItem = {
    name: string;
    uv: number;
    pv: number;
}

export default function HorizontalBarChart() {
    let orderedData = Array.from(data) as DataItem[]
    if (data && data.length > 0) {
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
            tickFormatter={(value: any) => { return Helper.parseMoney(value)}} 
            style={{fontFamily:"sans-serif"}}
        />
        <Tooltip formatter={Helper.parseMoney} content={<CustomTooltip />}/>
        <Legend />
        <Bar name="Quantity" dataKey="pv" fill="#b7b79e"/>
        <Bar name="Value" dataKey="uv" fill="#84846c"/>
        
    </BarChart>
    </Box>            
  );
}
