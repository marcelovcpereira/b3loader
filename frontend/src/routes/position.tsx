import DrawerMenu from "../components/drawer-menu";
import { MantineProvider } from '@mantine/core';
import { Container } from '@mantine/core';
import PageHeader from "../components/page-header";
import { response } from '../api/external/mockData'
import TabPosition from "../components/tab-position";

export default function PositionPage() {
    // TODO: Fetch real response, currently mocked...
    const data = response.data
    return (
        <div id="positionRoot" style={{width:"100%", height:"100%", marginBottom: "30px"}}>
        <MantineProvider defaultColorScheme="light">
            <PageHeader title="B3 Wallet (mock)" />
            <Container id="positionContainer" style={{padding:"0px", width:"1300px", height:"500px"}}>
                <TabPosition data={data.equitiesPositions!} />
                <DrawerMenu />
            </Container>
        </MantineProvider>
        </div>
    );
}