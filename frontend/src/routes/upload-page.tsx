import DrawerMenu from "../components/drawer-menu";
import { MantineProvider } from '@mantine/core';
import { Container, Box } from '@mantine/core';
import FileUploader from '../components/file-uploader';
import FileScanner from "../components/file-scanner";
// import './root.css'

export default function UploadPage() {
    return (
        <MantineProvider defaultColorScheme="light">
            <Container>
                <Box id="upload" style={{
                    width:"96%", 
                    height:"100%", 
                    marginBottom: "30px", 
                    marginTop: "0px",
                    display:"flex"
                }}>
                    <FileUploader />
                </Box>
                <Box id="scanner" style={{
                    width:"96%", 
                    height:"100%", 
                    marginBottom: "30px", 
                    marginTop: "0px",
                    display:"flex"
                }}>
                    <div style={{maxWidth:"2500px", margin: "auto", marginTop: "10px"}}>
                        <h2>Available Files for Import</h2>
                        <FileScanner />
                    </div>
                </Box>
                <DrawerMenu/>
            </Container>
        </MantineProvider>
    );
}