import { FileInput, rem } from '@mantine/core';
import { IconFile } from '@tabler/icons-react';
import DrawerMenu from "../components/drawer-menu";
import { MantineProvider } from '@mantine/core';
import { Container } from '@mantine/core';
// import './root.css'

export default function UploadPage() {
    const icon = <IconFile style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;
    return (
        <MantineProvider defaultColorScheme="light">
            <Container>Default Container
                <div id="upload" style={{
                    borderColor:"black", 
                    borderWidth:"2px",
                    borderStyle:"dashed",
                    width:"96%", 
                    height:"100%", 
                    marginBottom: "30px", 
                    marginTop: "0px",
                    display:"flex"
                }}>
                    <div style={{maxWidth:"800px", margin: "auto", marginTop: "10px"}}>
                    
                        <h2>Upload de arquivos históricos de cotações no formato B3</h2>
                        <FileInput
                            multiple
                            clearable
                            accept="zip,txt"
                            leftSection={icon}
                            placeholder="Selecione os arquivos..."
                            rightSectionPointerEvents="none"
                            mt="md"
                        />
                    
                    </div>
                </div>
                <div id="scanner" style={{
                    borderColor:"black", 
                    borderWidth:"2px",
                    borderStyle:"dashed",
                    width:"96%", 
                    height:"100%", 
                    marginBottom: "30px", 
                    marginTop: "0px",
                    display:"flex"
                }}>
                    <div style={{maxWidth:"800px", margin: "auto", marginTop: "10px"}}>
                    
                        <h2>Arquivos encontrados no servidor:</h2>
                    
                    </div>
                </div>
                <DrawerMenu/>
            </Container>
        </MantineProvider>
    );
}