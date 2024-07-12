import DrawerMenu from "../components/drawer-menu";
import { MantineProvider, Text } from '@mantine/core';
import { Container, Box } from '@mantine/core';
import HorizontalBarChart from "../components/horizontal-bar-chart";

export default function PositionPage() {
    return (
        <MantineProvider defaultColorScheme="light">
            <Container id="positionRoot" style={{padding:"0px"}}>

                <Box id="uploader" style={{marginBottom: "30px"}}>
                    <Text>Position</Text>
                </Box>

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