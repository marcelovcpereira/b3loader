import { useState } from "react";
import { Button, FileInput, Progress, Loader } from "@mantine/core";
import { IconFile } from '@tabler/icons-react';
import classes from './button.module.css'
import { BackendAPI } from "../../api/base";
import { ThemeColor } from "../../helper";

const UPLOAD_QUOTES_MESSAGE = "Upload quote files in B3 format"

export interface FileUploaderProps {
  api: BackendAPI
}

const FileUploader = (props: FileUploaderProps) => {
    const icon = <IconFile style={{ width: "15px", height: "15px" }} stroke={1.5} />;
    const chunkSize = 5 * 1024 * 1024; // 5MB
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [status, setStatus] = useState("");
    const [progress, setProgress] = useState(0);
    const [err, setErr] = useState<string | null>(null);

    const handleClean = () => {
        setSelectedFile(null)
        setStatus("")
        setProgress(0)
        setErr("")
    };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setErr("❌ No file selected")
      return;
    }
    
    const totalChunks = Math.ceil((selectedFile as File).size / chunkSize);
    const chunkProgress = 100 / totalChunks;
    let chunkNumber = 1;
    let start = 0;
    let end = chunkSize;
    let uploadID = ""
    
    const uploadNextChunk = async () => {
      if (chunkNumber <= totalChunks) {
        const chunk = (selectedFile as File).slice(start, end, (selectedFile as File).type);
        const response = await props.api.uploadFileChunk(chunk, chunkNumber, totalChunks, (selectedFile as File).name, uploadID)
        if (response.error) {
          console.error("Error uploading chunk:", response.error);
        } else if (response.data) {
          uploadID = response.data.uuid!
          const percent = Math.round(chunkNumber/totalChunks*100)
          const temp = `${percent}%`;
          setStatus(temp);
          setProgress(Number((chunkNumber) * chunkProgress));
          console.log(temp);
          chunkNumber++;
          start = end;
          end = start + chunkSize;
          uploadNextChunk()
        }
      } else {
        setProgress(100);
        setSelectedFile(null);
        setStatus("File upload completed");
      }
    };
    uploadNextChunk();
  };

  const fontSize = progress > 0 && progress < 100 ? "35px" : "20px"

  return (
    <div style={{width:"500px"}}>
      <h2 style={{fontSize:"27px",color:"#6f7380", fontFamily:"tahoma", textAlign:"left"}}>{UPLOAD_QUOTES_MESSAGE}</h2>
      
      <h3 style={{fontSize:fontSize}}>{progress > 0 && progress < 100 && <Loader color="blue" style={{marginRight:"20px"}}/>} {status}</h3>
      {progress > 0 && <Progress value={progress} style={{display:"block", marginBottom:"20px"}}/>}
      <h3
          style={{
            fontSize:"15px",
            color: ThemeColor.DARK_RED, 
            fontFamily:"tahoma", 
            textAlign:"left",
            backgroundColor: ThemeColor.LIGHT_RED
          }}
        >
          { err != null ? err : "" }
        </h3>
      <div style={{width:"100%", display:"flex", marginTop:"0px"}}>
            <FileInput
                clearable
                accept="application/zip,text/plain"
                leftSection={icon}
                placeholder="Select a file..."
                rightSectionPointerEvents="none"
                mt="md"
                onChange={setSelectedFile}
                value={selectedFile}
                style={{marginTop:"0px",minWidth:"200px",maxWidth:"250px", maxHeight:"40px", margin: "auto", marginLeft:"0px", marginRight:"10px"}}
            />
            <Button 
                className={classes.buttons}
                onClick={handleClean}
                style={{marginTop:"0px",maxWidth:"150px", maxHeight:"40px"}}
            >
                Clear
            </Button> 
            <Button 
                className={classes.blueButtons}
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