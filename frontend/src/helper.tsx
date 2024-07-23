export enum ThemeColor {
  PRIMARY = '#b7b79e',
  DARK_RED = '#b79e9e',
  LIGHT_BLUE = '#9ea4b7',
  SECONDARY = '#84846c',
  LIGHT_RED = '#e9e2e2',
  DARK_BLUE = '#6f7380',
  DARK_GREEN = '#5c8d68',
  LIGHT_GREEN = '#82be90',
  WHITE = '#ffffff'
}

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
    const curr = "R$"
    return curr + Helper.addDots(money.toFixed(2).replace(".", ","))
  }

  static addDots = (val: string): string => {
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

  static getTicksFromNumberList(values: number[]): number[] {
    const ticks: number[] = []
    const totalTicks = 6
    const ordered = values.sort((a, b) => (a < b ? -1 : 1));
    const start = ordered[0]
    const end = ordered[ordered.length-1]
    const tickInterval = Math.floor((end - start)/totalTicks)
    let currTick = 0
    const sum = values.reduce((a,b) => {return a+b})
    while(currTick <= end) {
        ticks.push(currTick)
        currTick += tickInterval
    }
    ticks.push(sum)
    console.log(`Defined UV ${ticks.length} ticks: ${ticks.join(",")}`)
    return ticks
  }

  static getTicksFromDateList(values: Date[]): number[] {
    const ticks: number[] = []
    let startYear: number = values[0].getFullYear()
    const endYear: number = values[values.length-1].getFullYear()
    while(startYear <= endYear) {
        const yearStr = startYear.toString() + "-01-01T00:00:00"
        const d = Date.parse(yearStr).valueOf()
        ticks.push(d)

        const yearStr6 = startYear.toString() + "-07-01T00:00:00"
        const d6 = Date.parse(yearStr6).valueOf()
        ticks.push(d6)
        startYear++
    }
    console.log(`Defined ${ticks.length} ticks: ${ticks.join(",")}`)
    return ticks
  }
  static getDomainFromDateList(values: Date[]): number[] {
    values.sort((a, b) => (a < b ? -1 : 1))
    const start = values[0]
    const end = values[values.length-1]
    return [start.valueOf(), end.valueOf()]
  }

  static getThemeColors(): string[] {
    return Object.values(ThemeColor)
  }
}