import DrawerMenu from "../components/drawer-menu";
import { MantineProvider } from '@mantine/core';
import { Container, Box } from '@mantine/core';
import HorizontalBarChart from "../components/horizontal-bar-chart";
import PageHeader from "../components/page-header";

export default function PositionPage() {
    return (
        <MantineProvider defaultColorScheme="light">
            <PageHeader title="B3 Wallet" />
            <Container id="positionRoot" style={{padding:"0px"}}>
                <Box id="scanner">
                    <Box>
                        <HorizontalBarChart />
                    </Box>
                </Box>
                <DrawerMenu/>
            </Container>
        </MantineProvider>
    );
}