import DrawerMenu from "../components/drawer-menu";
import { Grid, MantineProvider } from '@mantine/core';
import { Container } from '@mantine/core';
import HorizontalBarChart, { DataItem } from "../components/horizontal-bar-chart";
import PageHeader from "../components/page-header";
import PositionPieChart from "../components/position-pie-chart";
import { response } from '../api/external/mockData'

export default function PositionPage() {
    const valuePerStock = response.data.equitiesPositions!.map(el => {
        console.log("ELLLL", el)
        return {name: el.tickerSymbol, uv: el.closingPrice*el.equitiesQuantity, pv: el.equitiesQuantity} as DataItem
    }) as DataItem[]
    
    const map = new Map<string, DataItem>() //MapPerType = {}
    response.data.equitiesPositions!.forEach(el => {
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
    console.log("MAPP", map)
    console.log("MAPP VALUES", Array.from( map ))

    return (
        <div id="positionRoot" style={{width:"100%", height:"100%", marginBottom: "30px"}}>
        <MantineProvider defaultColorScheme="light">
            <PageHeader title="B3 Wallet (mock)" />
            <Container id="positionContainer" style={{padding:"0px", width:"1300px", height:"500px"}}>
            <div style={{width: "100%", height:"40px"}}>
                <div style={{float:"left", height:"100%"}}>
                    <span style={{fontFamily:"tahoma", fontSize:"27px", fontWeight:"bold", position: "relative", top:"0%", color:"#6f7380"}}>
                        Position per stock
                    </span>
                </div>
            </div>
                <Grid style={{width:"1200px", height:"370px"}}>
                    <Grid.Col span={6}>
                        <HorizontalBarChart data={valuePerStock}/>
                    </Grid.Col>
                    <Grid.Col span={6} style={{float:"left"}}>
                        <PositionPieChart data={valuePerStock} />
                    </Grid.Col>
                </Grid>
                <div style={{width: "100%", height:"60px"}}>
                <div style={{float:"left", height:"100%"}}>
                        <span style={{fontFamily:"tahoma", fontSize:"27px", fontWeight:"bold", position: "relative", top:"20%", color:"#6f7380"}}>
                            Position per type
                        </span>
                    </div>
                </div>
                <Grid style={{width:"1200px", height:"370px"}}>
                    <Grid.Col span={6}>
                        <HorizontalBarChart data={Array.from( map.values() ) as DataItem[]}/>
                    </Grid.Col>
                    <Grid.Col span={6} style={{float:"left"}}>
                        <PositionPieChart data={Array.from( map.values() ) as DataItem[]} />
                    </Grid.Col>
                </Grid>
                <DrawerMenu/>
            </Container>
        </MantineProvider>
        </div>
    );
}