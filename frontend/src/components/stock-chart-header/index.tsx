import { Grid, MantineProvider, Radio, Text } from "@mantine/core"
import { Quote } from "../../api/base"
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react"
import { Helper, ThemeColor } from "../../helper"
import { useState } from "react"
import classes from './stock-chart.module.css'
// import { IconTallymark1 } from '@tabler/icons-react';

type StockChartHeaderProps = {
    stockName: string
    data: Quote[]
    period: string
    setPeriod: (e:string)=>void
}

const periodOptions = ["6y","5y", "3y", "2y", "1y"]


const getCurrentStockStatus = (data: Quote[]) => {
    const first = data[0].Value
    const last = data[data.length-1].Value
    const diff = (last - first).toFixed(2)
    const percent = ((last/first)*100)-100
    const width = 15
    const color = percent > 1 ? ThemeColor.LIGHT_GREEN : percent < 1 ? "red" : ThemeColor.LIGHT_BLUE
    const sign = percent > 1 ? 
            <IconArrowUp width={width} color={ThemeColor.LIGHT_GREEN} style={{verticalAlign:"middle"}}/> 
        :percent < 1 ? 
            <IconArrowDown width={width} color={"red"} style={{verticalAlign:"middle"}}/> 
        : <></>
    return (
        <span style={{color:color, height:"100%", display:"block", paddingTop:"15px"}}>{diff}({sign}{percent.toFixed(2)}%)</span>
    )
}

const getCurrentStockValue = (data: Quote[]) => {
    return (
        <span style={{color:"#6f7380", fontFamily:"system-ui", fontSize:"30px"}}>
            {Helper.parseMoney(data[data.length-1].Value)}
        </span>
    )
}

export default function StockChartHeader(props: StockChartHeaderProps) {
    const [value, setValue] = useState<string | null>(null);
    // const tally = <IconTallymark1 strokeWidth={1} style={{color: ThemeColor.LIGHT_BLUE, position:"relative", top:"25%"}}/>
    // Selected Stock Label 
    return (
        <MantineProvider defaultColorScheme="light">
        <div id="stockHeader" style={{maxWidth: "900px", maxHeight: "60px", height:"60px", textAlign:"left"}}>
            <Grid>
                <Grid.Col span={3} key={"stockName"} style={{
                    float:"left", 
                    paddingTop: "10px",
                }}>
                    <span style={{
                        color:"#6f7380", 
                        fontFamily:"tahoma", 
                        fontSize:"27px", 
                        fontWeight:"bold", 
                    }}>
                        {props.stockName.toUpperCase()}
                    </span>
                </Grid.Col>
                <Grid.Col id="periodGridCol" key={"periods"} span={4} style={{
                    display: "flex",
                    alignItems:"center"
                }}>
                    <Radio.Group
                        id="radioGroupTAG"
                        value={value}
                        onChange={setValue}
                        style={{width:"100%", height:"100%",display:"inline"}}
                    >
                        <Grid style={{marginTop:"8px"}}>
                            {periodOptions.map((item:string) => {
                                return (
                                    <>
                                    <Grid.Col key={item} span={2}>
                                        <Radio.Card 
                                            className={props.period == item ? classes.periodButtonSelected : classes.periodButton} 
                                            radius="md" 
                                            value={item}
                                            key={item}
                                            onClick={() => props.setPeriod(item)}
                                            checked={props.period==item}
                                        >
                                            <Text style={{margin:"auto", padding:"auto"}}>{item}</Text>
                                        </Radio.Card>
                                            
                                    </Grid.Col>
                                    
                                    </>
                                )
                            })
                            }
                        </Grid>
                    </Radio.Group>
                </Grid.Col>
                <Grid.Col id="statusGridCol" key={"status"} span={3} style={{
                    textAlign:"right",
                }}>
                    {getCurrentStockStatus(props.data)}
                </Grid.Col>
                <Grid.Col id="valueGridCol" key={"value"} span={2} style={{
                    textAlign:"left",
                }}>
                    <div style={{float:"left", width:"20%", height:"100%"}}>
                        {getCurrentStockValue(props.data)}
                    </div>
                </Grid.Col>
            
            </Grid>
        </div>
        </MantineProvider>
    )
}