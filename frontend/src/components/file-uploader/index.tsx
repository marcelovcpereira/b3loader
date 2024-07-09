import { useState } from "react";
import { Button, FileInput, Progress, MantineProvider, Loader } from "@mantine/core";
import { IconFile } from '@tabler/icons-react';

const FileUploader = () => {
    const uploadURL = "http://localhost:8080/api/v1/quotes/upload"
    const icon = <IconFile style={{ width: "15px", height: "15px" }} stroke={1.5} />;
    const chunkSize = 5 * 1024 * 1024; // 5MB 
    const [selectedFile, setSelectedFile] = useState(null);
    const [status, setStatus] = useState("");
    const [progress, setProgress] = useState(0);
    console.log("SELECTED",selectedFile)
    const handleFileChange = (e: File) => {
        setSelectedFile(e)
    };

    const handleClean = () => {
        setSelectedFile(null)
        setStatus("")
        setProgress(0)
    };

  const handleFileUpload = () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
    
    let totalChunks = Math.ceil(selectedFile.size / chunkSize);
    const chunkProgress = 100 / totalChunks;
    let chunkNumber = 1;
    let start = 0;
    let end = chunkSize;
    let uploadID = ""
    
    const uploadNextChunk = async () => {
      if (chunkNumber <= totalChunks) {
        const chunk = selectedFile.slice(start, end, selectedFile.type);
        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("chunkNumber", chunkNumber);
        formData.append("totalChunks", totalChunks);
        formData.append("originalname", selectedFile.name);
        if (uploadID != "") {
            formData.append("uuid", uploadID)
        }
        fetch(uploadURL, {
            method: "POST",
            body: formData,
        }).then(
            (response) => response.json()
        ).then((data) => {
            console.log({ data });
            uploadID = data.uuid
            const temp = `Chunk ${chunkNumber}/${totalChunks} uploaded successfully`;
            setStatus(temp);
            setProgress(Number((chunkNumber) * chunkProgress));
            console.log(temp);
            chunkNumber++;
            start = end;
            end = start + chunkSize;
            uploadNextChunk();
        })
        .catch((error) => {
            console.error("Error uploading chunk:", error);
        });

      } else {
        setProgress(100);
        setSelectedFile(null);
        setStatus("File upload completed");
      }
    };
    uploadNextChunk();
  };

  return (
    <div style={{width:"500px"}}>
      <h2>Upload de arquivos no formato B3</h2>
      {progress > 0 && progress < 100 && <Loader color="blue" />}
      <h3>{status}</h3>
      {progress > 0 && <Progress value={progress} style={{display:"block", marginBottom:"20px"}}/>}
      <div style={{width:"100%", display:"flex", marginTop:"0px"}}>
            <FileInput
                clearable
                accept="application/zip,text/plain"
                leftSection={icon}
                placeholder="Selecione um arquivo..."
                rightSectionPointerEvents="none"
                mt="md"
                onChange={handleFileChange}
                value={selectedFile}
                style={{marginTop:"0px",maxWidth:"250px", maxHeight:"40px", margin: "auto"}}
            />
            <Button 
                onClick={handleClean}
                style={{marginTop:"0px",maxWidth:"150px", maxHeight:"40px"}}
            >
                Limpar
            </Button> 
            <Button 
                onClick={handleFileUpload}
                style={{marginTop:"0px",maxWidth:"150px", maxHeight:"40px",marginLeft:"5px"}}
            >
                Upload
            </Button>
        </div>
    </div>
  );
};

export default FileUploader;