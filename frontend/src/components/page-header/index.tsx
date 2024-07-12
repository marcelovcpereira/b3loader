import { DEFAULT_THEME, Grid, MantineProvider, Title, getGradient, useMantineTheme } from "@mantine/core"

export interface HeaderProps {
    title: string
}
const gradient = getGradient({ deg: 90, from: "#84846c", to: "#ffffff" }, DEFAULT_THEME)
export default function PageHeader(props: HeaderProps) {
    return (
        <MantineProvider defaultColorScheme="light">
            <Grid style={{margin:"0px",padding:"0px"}}>
                <Grid.Col span={4} style={{paddingRight:"0px"}}>
                    <div id="headerDiv" style={{width:"350px", height:"45px", backgroundColor:"#84846c", color:"#ffffff"}}>
                        <Title order={1} style={{marginBottom:"40px", paddingLeft:"30px", float:"left", fontFamily:"tahoma", fontWeight:"600", }}>
                            {props.title}
                        </Title>
                    </div>
                </Grid.Col>
                <Grid.Col span={1} style={{paddingRight:"0px", paddingLeft:"0px"}}>
                    <div id="spaceDiv" style={{width:"350px", height:"45px", backgroundColor:"#84846c", color:"#ffffff"}}>
                    </div>
                </Grid.Col>
                <Grid.Col span={6}>
                    <div id="infoDiv" style={{width:"350px", height:"45px", backgroundImage:gradient, color:"#ffffff"}}>

                    </div>
                </Grid.Col>
            </Grid>
        </MantineProvider>
    )
}
