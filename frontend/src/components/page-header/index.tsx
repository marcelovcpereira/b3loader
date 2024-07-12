import { MantineProvider, Title } from "@mantine/core"

export interface HeaderProps {
    title: string
}

export default function PageHeader(props: HeaderProps) {
    return (
        <MantineProvider defaultColorScheme="light">
        <Title order={1} style={{marginBottom:"40px", paddingLeft:"30px", float:"left", fontFamily:"tahoma", fontWeight:"500"}}>
          {props.title}
        </Title>
      </MantineProvider>
    )
}
