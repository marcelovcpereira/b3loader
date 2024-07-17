import DrawerMenu from "../components/drawer-menu";
import { Grid, MantineProvider } from '@mantine/core';
import { Container } from '@mantine/core';
import HorizontalBarChart from "../components/horizontal-bar-chart";
import PageHeader from "../components/page-header";
import PositionPieChart from "../components/position-pie-chart";

export default function PositionPage() {
    return (
        <MantineProvider defaultColorScheme="light">
            <PageHeader title="B3 Wallet (mock)" />
            <Container id="positionRoot" style={{padding:"0px", width:"1300px", height:"500px"}}>
            <div style={{width: "100%", height:"60px"}}>
                <div style={{float:"left", height:"100%"}}>
                    <span style={{fontFamily:"tahoma", fontSize:"27px", fontWeight:"bold", position: "relative", top:"20%", color:"#6f7380"}}>Stocks Position</span>
                </div>
            </div>
                <Grid style={{width:"1200px"}}>
                    <Grid.Col span={6}>
                        <HorizontalBarChart />
                    </Grid.Col>
                    <Grid.Col span={6} style={{float:"left"}}>
                        <PositionPieChart />
                    </Grid.Col>
                </Grid>
                <DrawerMenu/>
            </Container>
        </MantineProvider>
    );
}