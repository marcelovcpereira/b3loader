export class Helper {
  static humanFileSize = (bytes:number, dp=1): string => {
    const thresh = 1000;
  
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
  
    const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']    
    let u = -1;
    const r = 10**dp;
  
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
    return bytes.toFixed(dp) + ' ' + units[u];
  }

  static parseMoney = (money: number): string => {
    let curr = "R$"
    return curr + Helper.addDots(money.toFixed(2).replace(".", ","))
  }

  static addDots = (val: string): string => {
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

  static getTicksFromNumberList(values: number[]): number[] {
    let ticks: number[] = []
    let totalTicks = 6
    let ordered = values.sort((a, b) => (a < b ? -1 : 1));
    let start = ordered[0]
    let end = ordered[ordered.length-1]
    let tickInterval = Math.floor((end - start)/totalTicks)
    let currTick = 0
    while(currTick <= end) {
        ticks.push(currTick)
        currTick += tickInterval
    }
    console.log(`Defined UV ${ticks.length} ticks: ${ticks.join(",")}`)
    return ticks
  }

  static getTicksFromDateList(values: Date[]): number[] {
    console.log("DATELIST", values)
    let ticks: number[] = []
    let startYear: number = values[0].getFullYear()
    let endYear: number = values[values.length-1].getFullYear()
    while(startYear <= endYear) {
        let yearStr = startYear.toString() + "-01-01T00:00:00"
        let d = Date.parse(yearStr).valueOf()
        ticks.push(d)

        let yearStr6 = startYear.toString() + "-07-01T00:00:00"
        let d6 = Date.parse(yearStr6).valueOf()
        ticks.push(d6)
        startYear++
    }
    console.log(`Defined ${ticks.length} ticks: ${ticks.join(",")}`)
    return ticks
  }
  static getDomainFromDateList(values: Date[]): number[] {
    values.sort((a, b) => (a < b ? -1 : 1))
    let start = values[0]
    let end = values[values.length-1]
    return [start.valueOf(), end.valueOf()]
  }
}