import { Grid, Tabs, rem } from '@mantine/core';
import { IconBrandMastercard, IconBuildingEstate, IconChartBar } from '@tabler/icons-react';
import { EquitiesPositionsEntity } from '../../api/external/b3';
import HorizontalBarChart, { DataItem } from '../horizontal-bar-chart';
import PositionPieChart from '../position-pie-chart';
import { Helper, ThemeColor, chartColors, chartColorsSecondary } from '../../helper';
import { getMockStockDetails } from '../../api/external/mockData';
import FilledPieChart from '../filled-pie-chart';

export interface TabPositionProps {
    data: EquitiesPositionsEntity[]
} 

export default function TabPosition(props: TabPositionProps) {
  const iconStyle = { width: rem(12), height: rem(12) };
  IconBrandMastercard

    // Stocks
    const overallValue = props.data.map(el => {
        return {name: el.tickerSymbol, uv: el.closingPrice*el.equitiesQuantity, pv: el.equitiesQuantity} as DataItem
    }) as DataItem[]

    // Overall
    const map = new Map<string, DataItem>()
    props.data.forEach(el => {
        if (map.has(el.productTypeName)) {
            const old = map.get(el.productTypeName)
            const newer = { 
                name: old!.name, 
                uv: old!.uv + (el.closingPrice*el.equitiesQuantity), 
                pv: old!.pv + el.equitiesQuantity
            }
            map.set(el.productTypeName, newer)
        } else {
            const newer = {name: el.productTypeName, uv: el.closingPrice*el.equitiesQuantity, pv: el.equitiesQuantity}
            map.set(el.productTypeName, newer)
        }
    }) 

    console.log("OVERALL", map)

    const stocks = props.data.filter(e => e.productTypeName == "Company").map(el => {
        return {name: el.tickerSymbol, uv: el.closingPrice*el.equitiesQuantity, pv: el.equitiesQuantity} as DataItem
    }) as DataItem[]


    const reits = props.data.filter(e => e.productTypeName == "REIT").map(el => {
        return {name: el.tickerSymbol, uv: el.closingPrice*el.equitiesQuantity, pv: el.equitiesQuantity} as DataItem
    }) as DataItem[]

    const reitsSubtypes = new Map<string, DataItem>()
    props.data.filter(e => e.productTypeName == "REIT").forEach(el => {
        const details = getMockStockDetails(el.tickerSymbol)
        if (details) {
            const subtypeName = Helper.getFriendlySubtype(details.subtype)
            if (reitsSubtypes.has(subtypeName)) {
                const old = reitsSubtypes.get(subtypeName)
                const newer = { 
                    name: old!.name, 
                    uv: old!.uv + (el.closingPrice*el.equitiesQuantity), 
                    pv: old!.pv + el.equitiesQuantity
                }
                reitsSubtypes.set(subtypeName, newer)
            } else {
                const newer = {name: subtypeName, uv: el.closingPrice*el.equitiesQuantity, pv: el.equitiesQuantity}
                reitsSubtypes.set(subtypeName, newer)
            }
        } 
    }) 

    return (
        <Tabs defaultValue="Stocks">
            <Tabs.List style={{marginBottom:"15px"}}>
                <Tabs.Tab color={ThemeColor.PRIMARY} value="Stocks" leftSection={<IconBrandMastercard style={iconStyle} />}>
                    Stocks
                </Tabs.Tab>
                <Tabs.Tab color={ThemeColor.DARK_BLUE} value="REITs" leftSection={<IconBuildingEstate style={iconStyle} />}>
                    REITs
                </Tabs.Tab>
                <Tabs.Tab color={ThemeColor.SECONDARY} value="Overall" leftSection={<IconChartBar style={iconStyle} />}>
                    Overall
                </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="Stocks">
                <Grid style={{width:"1200px", height:"370px"}}>
                    <Grid.Col span={6}>
                        <HorizontalBarChart colors={chartColors} data={stocks}/>
                    </Grid.Col>
                    <Grid.Col span={6} style={{float:"left"}}>
                        <PositionPieChart colors={chartColors} data={stocks} />
                    </Grid.Col>
                </Grid>
            </Tabs.Panel>
            <Tabs.Panel value="REITs">
                <Grid style={{width:"1200px", height:"370px"}}>
                    <Grid.Col span={6}>
                        <HorizontalBarChart colors={chartColors} data={reits}/>
                    </Grid.Col>
                    <Grid.Col span={6} style={{float:"left"}}>
                        <PositionPieChart colors={chartColors} data={reits} />
                    </Grid.Col>
                </Grid>
                <Grid style={{width:"1200px", height:"370px"}}>
                    <Grid.Col span={6}>
                        <FilledPieChart colors={chartColorsSecondary} data={Array.from(reitsSubtypes.values()) as DataItem[]} />
                    </Grid.Col>
                    <Grid.Col span={6} style={{float:"left"}}>
                        {/* <PositionPieChart colors={chartColorsSecondary} data={Array.from(reitsSubtypes.values()) as DataItem[]} /> */}
                    </Grid.Col>
                </Grid>
            </Tabs.Panel>
            <Tabs.Panel value="Overall">
                <Grid style={{width:"1200px", height:"370px"}}>
                        <Grid.Col span={6}>
                            <HorizontalBarChart colors={chartColors} data={overallValue}/>
                        </Grid.Col>
                        <Grid.Col span={6} style={{float:"left"}}>
                            <PositionPieChart colors={chartColors} data={overallValue} />
                        </Grid.Col>
                    </Grid>
                <Grid style={{width:"1200px", height:"370px"}}>
                    <Grid.Col span={6}>
                        <HorizontalBarChart colors={chartColorsSecondary} data={Array.from( map.values() ) as DataItem[]}/>
                    </Grid.Col>
                    <Grid.Col span={6} style={{float:"left"}}>
                        <PositionPieChart colors={chartColorsSecondary} data={Array.from( map.values() ) as DataItem[]} />
                    </Grid.Col>
                </Grid>
            </Tabs.Panel>
        </Tabs>
    );
}