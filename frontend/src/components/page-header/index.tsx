import { DEFAULT_THEME, Grid, MantineProvider, Title, getGradient } from "@mantine/core"
import { ThemeColor } from "../../helper"

export interface HeaderProps {
    title: string
}
const gradient = getGradient({ deg: 90, from: ThemeColor.DARK_BLUE, to: ThemeColor.WHITE }, DEFAULT_THEME)
export default function PageHeader(props: HeaderProps) {
    return (
        <MantineProvider>
            <Grid>
                <Grid.Col span={4} style={{paddingRight:"0px"}}>
                    <Title 
                        order={1} 
                        style={{
                            width:"100%",
                            height:"45px",
                            backgroundColor: ThemeColor.DARK_BLUE, 
                            color: ThemeColor.WHITE,
                            marginBottom:"40px", 
                            paddingLeft:"30px", 
                            float:"left", 
                            fontFamily:"tahoma", 
                            fontWeight:"600", 
                        }}
                    >
                        {props.title}
                    </Title>
                </Grid.Col>
                <Grid.Col span={1} style={{paddingRight:"0px", paddingLeft:"0px"}}>
                    <div 
                        id="spaceDiv" 
                        style={{
                            width:"350px", 
                            height:"45px", 
                            backgroundColor: ThemeColor.DARK_BLUE, 
                            color: ThemeColor.WHITE
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                    <div 
                        id="infoDiv" 
                        style={{
                            width:"350px", 
                            height:"45px", 
                            backgroundImage: gradient, 
                            color: ThemeColor.WHITE
                        }}
                    >
                    </div>
                </Grid.Col>
            </Grid>
        </MantineProvider>
    )
}
