import { useEffect, useReducer, useState } from 'react';
import { Radio, Group, Grid, Text, Button, Box } from '@mantine/core';
import classes from './file-scanner.module.css';
import {IconFileText, IconFileTypeZip} from '@tabler/icons-react';
import { BackendAPI } from '../../api/base';
import { Helper } from '../../helper';

const AVAILABLE_FILES_MESSAGE = "Available Files for Import"

export interface FileScannerProps {
  api: BackendAPI
}

const dataReducer = (state:any, action:any) => {
  switch (action.type) {
    case "LOADING":
    return { ...state, loading: true, error: false, data: null };
    case "LOADED":
      console.log("LOADED", action)
    return { ...state, loading: false, error: false, data: JSON.parse(action.payload) };
    case "ERROR":
    return { ...state, loading: false, error: true, data: null };
    case "NOT_FOUND":
    return { ...state, loading: false, error: false, data: null };
    default:
    return state;
  }
};

enum FileScannerActionType {
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = "ERROR",
  NOT_FOUND = "NOT_FOUND"
}
export type FileScannerState = {
  loading: boolean;
  error: boolean;
  data: File[] | []
}

export type FileScannerAction = {
  type: FileScannerActionType,
  payload: File[] | []
}

export default function FileScanner(props: FileScannerProps) {
  const zipIcon = <IconFileTypeZip />
  const txtIcon = <IconFileText />
  const [value, setValue] = useState<string | null>(null);
  const [api, dispatch] = useReducer(dataReducer, {loading: false,error: false, data: null});

  const handleImport = () => {
    props.api.importFile(value as string)
  }
  const handleUpdate = () => {
    updateList()
  }
  const updateList = async () => {
    dispatch({ type: FileScannerActionType.LOADING });
    let response = await props.api.listFiles()
    if (response.error) {
      console.log(response.error)
      dispatch({ type: FileScannerActionType.ERROR });
    } else if (response.data) {
      let data = response.data.data
      if (data.length > 0) {
        dispatch({ type: FileScannerActionType.LOADED, payload: data });
      } else {
        dispatch({ type: FileScannerActionType.NOT_FOUND });
      } 
    }
}

  const cards = api.data? api.data.map((item:any) => (
    <Grid.Col span={4} style={{width:"265px",overflow:"scroll"}}>  
        <Radio.Card className={classes.root} radius="md" value={item.name} key={item.name} >
        <Group id="carGroup" >
            <Radio.Indicator key={item.name} />{item.type == "application/zip" ? zipIcon : txtIcon }
            <div>
                <Text className={classes.label}>{item.name}</Text>
                <Text className={classes.description}>{Helper.humanFileSize(item.sizeBytes)}</Text>
                
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