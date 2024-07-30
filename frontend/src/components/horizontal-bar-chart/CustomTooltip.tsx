const style = {
  padding: 6,
  backgroundColor: "#ffffff",
  backgroundOpacity: "50%",
  border: "1px solid #ccc",
  color: "#000000"
};

type CustomTooltipProps = {
  active: boolean
  payload: Payload[]
}

type Payload = {
  name: string
  value: number
  fill: string
  payload: DataItem
}

export type DataItem = {
  name: string;
  uv: number;
  pv: number;
}
function addDots(val: string): string {
  let ret = ""
  const parts = val.split(",")
  const intPart = parts[0]
  const decimalPart = parts[1]

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
  const curr = "R$"
  if (money === undefined) return ""
  return curr + addDots(money.toFixed(2).replace(".", ","))
}

export default function CustomTooltip(props:CustomTooltipProps) {
  const { active, payload } = props;
  // const qtyIndex = 1
  const valIndex = 0
  if (active) {
    return (
      <div className="area-chart-tooltip" style={style}>
        <h3>{payload && payload.length > 0 ? payload[0].payload.name : " -- "}</h3>
        <span>
          {payload && payload.length > 0 ? <b style={{color:payload[valIndex].fill}}>{payload[valIndex].name + ": " + parseMoney(payload[valIndex].value)}</b> : <></>}
        </span>
        <br></br>
        <span>
        {/* {payload && payload.length > 0 ? <b style={{color:payload[qtyIndex].fill}}>{payload[qtyIndex].name + ": " + payload[qtyIndex].value}</b> : <></>} */}
        </span>
      </div>
    );
  }

  return null;
}
