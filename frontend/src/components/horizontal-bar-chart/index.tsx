
import { CartesianGrid, BarChart, XAxis, YAxis, Legend, Bar, Tooltip } from 'recharts';
import { data } from './data';
import { Box } from '@mantine/core';
import CustomTooltip from './CustomTooltip';

export type DataItem = {
    name: string;
    uv: number;
    pv: number;
}

function addDots(val: string): string {
    let ret = ""
    let parts = val.split(",")
    let intPart = parts[0]
    let decimalPart = parts[1]
    let pos = 1
    for (let i = intPart.length - 1; i >= 0; i--) {
        if ((pos%4) == 0) {
            ret = "." + ret
            pos++
        }
        
        ret = intPart[i] + ret
        pos++
    }
    return (ret + "," + decimalPart)
}

function parseMoney(money: number): string {
    let curr = "R$"
    return curr + addDots(money.toFixed(2).replace(".", ","))
}

function getTicksFromValues(values: DataItem[]): number[] {
    let ticks: number[] = []
    let totalTicks = 6
    let ordered = values.sort((a, b) => (a.uv < b.uv ? -1 : 1));
    let start: DataItem = ordered[0]
    let end: DataItem = ordered[ordered.length-1]
    let tickInterval = Math.floor((end.uv - start.uv)/totalTicks)
    let currTick = 0
    while(currTick <= end.uv) {
        ticks.push(currTick)
        currTick += tickInterval
    }
    console.log(`Defined UV ${ticks.length} ticks: ${ticks.join(",")}`)
    return ticks
}

export default function HorizontalBarChart() {
    let orderedData = Array.from(data)
    if (data && data.length > 0) {
        orderedData.sort((a, b) => (b.uv < a.uv ? -1 : 1))
    }
  return (  
    <Box>
    <BarChart reverseStackOrder={true} width={600} height={350} data={orderedData} layout='horizontal'>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name"/>
        <YAxis yAxisId="0" dataKey='uv' width={100} tickMargin={5} ticks={getTicksFromValues(data)}tickFormatter={(value: any) => { return parseMoney(value)}} style={{fontFamily:"sans-serif"}}/>
        <Tooltip formatter={parseMoney} content={<CustomTooltip />}/>
        <Legend />
        <Bar name="Quantity" dataKey="pv" fill="#b7b79e"/>
        <Bar name="Value" dataKey="uv" fill="#84846c"/>
        
    </BarChart>
    </Box>            
  );
}
