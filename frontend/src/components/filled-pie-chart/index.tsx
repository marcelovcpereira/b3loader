/// <reference path="path/types.d.ts" />

import { PieChart, Pie, Sector, Cell } from "recharts";
import { Helper, ThemeColor } from "../../helper";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

export type DataItem = {
  name: string;
  uv: number;
  pv: number;
}

type Payload = {
  cx: number
  cy: number
  fill: string
  name: string
  payload: unknown[]
  pv: number
  stroke: string
  uv: number
}

export interface PositionPieChartProps {
  data: DataItem[]
  colors: string[]
} 

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (props:{ cx:number, cy:number, midAngle:number, innerRadius:number, outerRadius:number, percent:number, index:number }) => {
  const radius = props.innerRadius + (props.outerRadius - props.innerRadius) * 0.5;
  const x = props.cx + radius * Math.cos(-props.midAngle * RADIAN);
  const y = props.cy + radius * Math.sin(-props.midAngle * RADIAN);

  return (
    <text x={x} y={y} fontSize={14} fill="white" textAnchor={x > props.cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(props.percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function FilledPieChart(props: PositionPieChartProps) {
  const data = props.data
  const renderShape = (props: PieSectorDataItem) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value
    } = props;
    const sin = Math.sin(-RADIAN * midAngle!);
    const cos = Math.cos(-RADIAN * midAngle!);
    const sx = cx! + (outerRadius! + 10) * cos;
    const sy = cy! + (outerRadius! + 10) * sin;
    const mx = cx! + (outerRadius! + 30) * cos;
    const my = cy! + (outerRadius! + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";
    const { name } = payload! as unknown as Payload
    console.log("DATAAAAAAAAA", data)
    console.log("DATAAAAAAAAA", innerRadius)
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          // innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="white"
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill={ThemeColor.DARK_BLUE}
          fontWeight={800}
        >{name}</text>
       
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill={ThemeColor.DARK_BLUE}
          fontSize={13}
        >
         {Helper.parseMoney(value!)}{`  (${(percent! * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };
  return (
    <PieChart width={550} height={400}>
      <Pie
        activeIndex={[...Array(data.length).keys()]}
        activeShape={renderShape}
        data={data}
        cx={240}
        cy={150}
        innerRadius={60}
        outerRadius={80}
        fill="#84846c"
        dataKey="uv"
        paddingAngle={0}   
        label={renderCustomizedLabel}     
      >
        {
          data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={props.colors[index % props.colors.length]} />
          ))
        }  
      </Pie>
    </PieChart>
  );
}
