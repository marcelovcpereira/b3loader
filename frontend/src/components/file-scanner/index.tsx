import { useEffect, useReducer, useState } from 'react';
import { Radio, Group, Grid, Button, Box, Text } from '@mantine/core';
import classes from './file-scanner.module.css';
import {IconFileText, IconFileTypeZip} from '@tabler/icons-react';
import { BackendAPI } from '../../api/base';
import { Helper, ThemeColor } from '../../helper';
import { File } from '../../api/base'

const AVAILABLE_FILES_MESSAGE = "Available Files for Import"

enum ActionType {
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = "ERROR",
  NOT_FOUND = "NOT_FOUND"
}

export interface FileScannerProps {
  api: BackendAPI
}

const dataReducer = (state:State, action:Action) => {
  switch (action.type) {
    case ActionType.LOADING:
    return { ...state, loading: true, error: false, data: null };
    case ActionType.LOADED:
    return { ...state, loading: false, error: false, data: JSON.parse(action.payload!) };
    case ActionType.ERROR:
    return { ...state, loading: false, error: true, data: null };
    case ActionType.NOT_FOUND:
    return { ...state, loading: false, error: false, data: null };
    default:
    return state;
  }
};

export type State = {
  loading: boolean;
  error: boolean;
  data: File[] | []
}

export type Action = {
  type: ActionType,
  payload?: string
}

export default function FileScanner(props: FileScannerProps) {
  const zipIcon = <IconFileTypeZip />
  const txtIcon = <IconFileText />
  const [value, setValue] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [api, dispatch] = useReducer(dataReducer, {loading: false,error: false, data: null});

  const handleImport = () => {
    const val = value as string
    if (val && val != "") {
      props.api.importFile(value as string)
      handleClear()
      setSuccess("✅ Import created")
    } else {
      handleClear()
      setErr("❌ No file selected")
    }
  }
  const handleClear = () => {
    setErr("")
    setSuccess("")
    setValue(null)
    updateList()
  }
  const updateList = async () => {
    dispatch({ type: ActionType.LOADING });
    const response = await props.api.listFiles()
    if (response.error) {
      console.log(response.error)
      dispatch({ type: ActionType.ERROR });
    } else if (response.data) {
      const data = response.data.data
      if (data.length > 0) {
        dispatch({ type: ActionType.LOADED, payload: data as string });
      } else {
        dispatch({ type: ActionType.NOT_FOUND });
      } 
    }
}

  const cards = api.data? api.data.map((item:File) => {return (
    
    <Grid.Col key={item.name} span={2} style={{width:"150px",overflow:"scroll"}}>  
        <Radio.Card className={classes.root} radius="md" value={item.name}>
        <Group id="carGroup" >
            <Radio.Indicator  />{item.type == "application/zip" ? zipIcon : txtIcon }
            <Text className={classes.description}>{Helper.humanFileSize(item.sizeBytes)}</Text>
            <div>
                <Text className={classes.label}>{item.name}</Text>
                <Text className={classes.description}>{item.type}</Text>
            </div>
        </Group>
        </Radio.Card>
    </Grid.Col>
  )}): <></>;
   
  useEffect(() => {
    updateList()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = api.data && api.data.length > 0 ? "select a file to import" : "no files found"
  return (
    <Box>
        <h2 
          style={{
            fontSize:"27px",
            color: ThemeColor.DARK_BLUE, 
            fontFamily:"tahoma", 
            textAlign:"left"
          }}
        >
          {AVAILABLE_FILES_MESSAGE}
        </h2>
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
        <h3
          style={{
            fontSize:"15px",
            color: ThemeColor.LIGHT_GREEN, 
            fontFamily:"tahoma", 
            textAlign:"left",
            backgroundColor: ThemeColor.LIGHT_RED
          }}
        >
          { success != null ? success : "" }
        </h3>
        <Radio.Group
            id="radioGroupTAG"
            value={value}
            onChange={setValue}
            label={label}
            description=""
            labelProps={{style:{marginBottom:"10px", color: ThemeColor.DARK_BLUE}}}
            style={{margin:"auto", marginBottom:"15px", textAlign:"left"}}
        >
            <Grid>
                {cards}
            </Grid>
        </Radio.Group>
      
        <div style={{float:"left"}}>
        <Button className={classes.buttons} onClick={handleClear}>
            Refresh
        </Button>
        <Button className={classes.blueButtons} onClick={handleImport} style={{marginLeft:"15px"}}>
            Import
        </Button>
        </div>
    </Box>
  );
}