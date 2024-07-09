import DrawerMenu from "../components/drawer-menu";
import { MantineProvider } from '@mantine/core';
import { Container } from '@mantine/core';
import FileUploader from '../components/file-uploader';
// import './root.css'

export default function UploadPage() {
    return (
        <MantineProvider defaultColorScheme="light">
            <Container>
                <div id="upload" style={{
                    width:"96%", 
                    height:"100%", 
                    marginBottom: "30px", 
                    marginTop: "0px",
                    display:"flex"
                }}>
                    <FileUploader />
                </div>
                <div id="scanner" style={{
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