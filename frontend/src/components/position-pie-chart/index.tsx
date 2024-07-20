import { PieChart, Pie, Sector, Cell } from "recharts";
import { data } from './data'
import { Helper } from "../../helper";

export type DataItem = {
  name: string;
  uv: number;
  pv: number;
}

const COLORS = Helper.getThemeColors()

const renderShape = (props: any) => {
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
  
  const totalSum = data.map(e => e.uv).reduce((accumulator, currentValue) => accumulator + currentValue, 0);  
  return (
    <g>
      <text x={cx} y={cy-20} dy={8} textAnchor="middle" fill={fill} style={{fontWeight:"bold"}}>
        Total:
      </text>
      <text x={cx} y={cy+5} dy={8} textAnchor="middle" fill={fill}>
        
        {Helper.parseMoney(totalSum)}
      </text>
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
       {Helper.parseMoney(value)}{`  (${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export default function PositionPieChart() {
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
        paddingAngle={5}        
      >
        {
          data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))
        }  
      </Pie>
    </PieChart>
  );
}
