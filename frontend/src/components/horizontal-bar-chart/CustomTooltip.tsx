const style = {
  padding: 6,
  backgroundColor: "#ffffff",
  backgroundOpacity: "50%",
  border: "1px solid #ccc",
  color: "#000000"
};


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
  if (money === undefined) return ""
  return curr + addDots(money.toFixed(2).replace(".", ","))
}

export default function CustomTooltip(props:any) {
  const { active, payload } = props;
  let qtyIndex = 0
  let valIndex = 1
  if (active) {
    return (
      <div className="area-chart-tooltip" style={style}>
        <h3>{payload && payload.length > 0 ? payload[0].payload.name : " -- "}</h3>
        <span>
          {payload && payload.length > 0 ? <b style={{color:payload[valIndex].fill}}>{payload[valIndex].name + ": " + parseMoney(payload[valIndex].value)}</b> : <></>}
        </span>
        <br></br>
        <span>
        {payload && payload.length > 0 ? <b style={{color:payload[qtyIndex].fill}}>{payload[qtyIndex].name + ": " + payload[qtyIndex].value}</b> : <></>}
        </span>
      </div>
    );
  }

  return null;
};
