import DrawerMenu from "../components/drawer-menu";
import { Divider, MantineProvider, Title } from '@mantine/core';
import { Container, Box } from '@mantine/core';
import FileUploader from '../components/file-uploader';
import FileScanner from "../components/file-scanner";
import PageHeader from "../components/page-header";
export default function UploadPage() {
    return (
        <MantineProvider defaultColorScheme="light">
            <PageHeader title='Upload & Import' />
            <Container id="uploadRoot" style={{padding:"0px", marginTop:"50px"}}>
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