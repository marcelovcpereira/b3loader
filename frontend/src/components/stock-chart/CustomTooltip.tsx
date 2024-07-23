const style = {
  padding: 6,
  backgroundColor: "rgba(31, 31, 31, 0.5)",
  backgroundOpacity: "50%",
  border: "1px solid #ccc",
  color: "#fff"
};

type CustomTooltipProps = {
  active: boolean
  payload: Payload[]
}

type Payload = {
  name: string
  value: number
  fill: string
  date: Date
}

function parseMoney(money: number): string {
    const curr = "R$"
    return curr + money.toFixed(2).toString()
}

const options : Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
}

export default function CustomTooltip(props:CustomTooltipProps) {
  const { active, payload } = props;
  if (active) {
    const currData = payload && payload.length ? payload[0] as Payload: null;
    console.log("CURRRR DATE", currData)
    return (
      <div className="area-chart-tooltip" style={style}>
        <span>
          <b>{currData ? parseMoney(currData.value) : " -- "}</b>
        </span>
        <br></br>
        <span>
          {currData ? new Date().toLocaleDateString("pt-BR", options) : " -- "}
        </span>
      </div>
    );
  }

  return null;
};
