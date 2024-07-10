import DrawerMenu from "../components/drawer-menu";
import { Divider, MantineProvider } from '@mantine/core';
import { Container, Box } from '@mantine/core';
import FileUploader from '../components/file-uploader';
import FileScanner from "../components/file-scanner";

export default function UploadPage() {
    return (
        <MantineProvider defaultColorScheme="light">
            <Container id="uploadRoot" style={{padding:"0px"}}>

                <Box id="uploader" style={{marginBottom: "30px"}}>
                    <FileUploader />
                </Box>

                <Divider my="md" />

                <Box id="scanner">
                    <Box>
                        <FileScanner />
                    </Box>
                </Box>

                <DrawerMenu/>
            </Container>
        </MantineProvider>
    );
}