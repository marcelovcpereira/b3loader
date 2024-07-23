import DrawerMenu from "../components/drawer-menu";
import { Divider, MantineProvider } from '@mantine/core';
import { Container, Box } from '@mantine/core';
import FileUploader from '../components/file-uploader';
import FileScanner from "../components/file-scanner";
import PageHeader from "../components/page-header";
import { BackendAPI } from "../api/base";
import ImportList from "../components/import-list";
export interface UploadPageProps {
    api: BackendAPI
  }
export default function UploadPage(props: UploadPageProps) {
    return (
        <MantineProvider defaultColorScheme="light">
            <PageHeader title='Upload & Import' />
            <Container id="uploadRoot" style={{padding:"0px", width:"1300px", height:"1000px"}}>
                <Box id="uploader" style={{marginBottom: "30px"}}>
                    <FileUploader api={props.api}/>
                </Box>

                <Divider my="md" />

                <Box id="scanner" style={{overflow:"hidden"}}>
                    <Box>
                        <FileScanner api={props.api}/>
                    </Box>
                </Box>

                <Divider my="md" />

                <Box id="importList">
                    <Box>
                        <ImportList api={props.api}/>
                    </Box>
                </Box>

                <DrawerMenu/>
            </Container>
        </MantineProvider>
    );
}