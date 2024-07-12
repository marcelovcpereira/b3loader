import DrawerMenu from "../components/drawer-menu";
import { MantineProvider, Text, Title } from '@mantine/core';
import { Container, Box } from '@mantine/core';
import HorizontalBarChart from "../components/horizontal-bar-chart";
const RenderHeader = () => {
    return (
      <MantineProvider defaultColorScheme="light">
        <Title order={1} style={{paddingLeft:"30px", float:"left", fontFamily:"tahoma", fontWeight:"100  "}}>
          B3 Wallet
        </Title>
      </MantineProvider>
    )
  }
export default function PositionPage() {
    return (
        <MantineProvider defaultColorScheme="light">
            {RenderHeader()}
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