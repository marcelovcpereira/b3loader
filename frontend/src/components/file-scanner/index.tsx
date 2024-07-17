import { useEffect, useReducer, useState } from 'react';
import { Radio, Group, Grid, Text, Button, Box } from '@mantine/core';
import classes from './file-scanner.module.css';
import {IconFileText, IconFileTypeZip} from '@tabler/icons-react';

const AVAILABLE_FILES_MESSAGE = "Available Files for Import"

const listFiles = () => {
  let url = `http://localhost:8080/api/v1/quotes/file/list`
  console.log("FETCHING", url)
  return fetch(url)
      .then(response => {
        return response.json()
      })
      .catch(error => console.log('error', error))
}

const importFile = (name:string) => {
  let url = `http://localhost:8080/api/v1/quotes/file/${name}/import`
  console.log("FETCHING", url)
  return fetch(url, {method:"POST"})
      .then(response => {
        return response.json()
      })
      .catch(error => console.log('error', error))
}

function humanFileSize(bytes:any, dp=1) {
    const thresh = 1000;
  
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
  
    const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']    
    let u = -1;
    const r = 10**dp;
  
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
    return bytes.toFixed(dp) + ' ' + units[u];
  }

const dataReducer = (state:any, action:any) => {
    switch (action.type) {
      case "LOADING":
      return { ...state, loading: true, error: false, data: null };
      case "LOADED":
      return { ...state, loading: false, error: false, data: action.payload };
      case "ERROR":
      return { ...state, loading: false, error: true, data: null };
      case "NOT_FOUND":
      return { ...state, loading: false, error: false, data: null };
      default:
      return state;
    }
  };

export default function FileScanner() {
  const zipIcon = <IconFileTypeZip />
  const txtIcon = <IconFileText />
  const [value, setValue] = useState<string | null>(null);
  const [api, dispatch] = useReducer(dataReducer, {loading: false,error: false,data: null});

  const handleImport = () => {
    console.log("importing",value)
    importFile(value as string)
}
const handleUpdate = () => {
    updateList()
}
  const updateList = () => {
    dispatch({ type: "LOADING" });
    listFiles()
      .then((res:any) => {
        if (res && res.data) {
          let files = JSON.parse(res.data)
          dispatch({ type: "LOADED", payload: files });
        } else {
          dispatch({ type: "NOT_FOUND" });
        }
        
      })
      .catch((err: Error) => {
        console.log(err)
        dispatch({ type: "ERROR" });
      });
}

  const cards = api.data? api.data.map((item:any) => (
    <Grid.Col span={4} style={{width:"265px",overflow:"scroll"}}>  
        <Radio.Card className={classes.root} radius="md" value={item.name} key={item.name} >
        <Group id="carGroup" >
            <Radio.Indicator key={item.name} />{item.type == "application/zip" ? zipIcon : txtIcon }
            <div>
                <Text className={classes.label}>{item.name}</Text>
                <Text className={classes.description}>{humanFileSize(item.sizeBytes)}</Text>
                
                <Text className={classes.description}>{item.type}</Text>
            </div>
        </Group>
        </Radio.Card>
    </Grid.Col>
  )): <></>;

   
   useEffect(() => {
    updateList()
  }, []);

  let label = api.data && api.data.length > 0 ? "select a file to import" : "no files found"
  return (
    <Box>
        <h2 style={{fontSize:"27px",color:"#6f7380", fontFamily:"tahoma", textAlign:"left"}}>{AVAILABLE_FILES_MESSAGE}</h2>
        <Radio.Group
            id="radioGroupTAG"
            value={value}
            onChange={setValue}
            label={label}
            description=""
            labelProps={{style:{marginBottom:"10px"}}}
            style={{margin:"auto", marginBottom:"15px", textAlign:"left"}}
        >
            <Grid>
                {cards}
            </Grid>
        </Radio.Group>
      
        <div style={{float:"left"}}>
        <Button className="buttons" onClick={handleUpdate}>
            Refresh
        </Button>
        <Button className="buttons" onClick={handleImport} style={{marginLeft:"15px"}}>
            Import
        </Button>
        </div>
    </Box>
  );
}