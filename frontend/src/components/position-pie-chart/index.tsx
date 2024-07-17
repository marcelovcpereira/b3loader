import { useCallback, useState } from "react";
import { PieChart, Pie, Sector } from "recharts";
import { data } from './data'

export type DataItem = {
  name: string;
  uv: number;
  pv: number;
}

function parseMoney(money: number): string {
  let curr = "R$"
  return curr + addDots(money.toFixed(2).replace(".", ","))
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

const renderActiveShape = (props: any) => {
  console.log("PIE PROPS:", props)
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
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";
  
  return (
    <g>
      {/* <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text> */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="white"
      />
      {/* <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      /> */}
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
        fill="#6f7380"
        fontWeight={600}
      >{payload.name}</text>
     
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
       {parseMoney(value)}{`  (${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export default function PositionPieChart() {
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = useCallback(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  return (
    <PieChart width={550} height={400}>
      <Pie
        activeIndex={[...Array(data.length).keys()]}
        activeShape={renderActiveShape}
        data={data}
        cx={240}
        cy={150}
        innerRadius={60}
        outerRadius={80}
        fill="#84846c"
        dataKey="uv"
        paddingAngle={5}
        //onMouseEnter={onPieEnter}
        
      />
    </PieChart>
  );
}
