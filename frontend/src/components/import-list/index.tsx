import { Reducer, useEffect, useReducer, useState } from "react";
import { List, Grid, Pill, MantineProvider, Loader, Alert, Box, Switch, Tooltip } from "@mantine/core";
import { BackendAPI, ImportJob } from "../../api/base";
import { ThemeColor } from "../../helper";
import moment from "moment";
import classes from './import-list.module.css'
import { IconInfoCircle, IconRefresh } from "@tabler/icons-react";

const MESSAGE = "Import Jobs"

export interface ImportListProps {
  api: BackendAPI
}

enum ActionType {
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = "ERROR",
  NOT_FOUND = "NOT_FOUND"
}
export type State = {
  loading: boolean;
  error: boolean;
  data: ImportJob[] | []
}

export type Action = {
  type: ActionType,
  payload: ImportJob[]
}

const dataReducer: Reducer<State, Action> = (state:State, action:Action) => {
    switch (action.type) {
      case "LOADING":
      return { ...state, loading: true, error: false, data: [] };
      case "LOADED":
      return { ...state, loading: false, error: false, data: action.payload };
      case "ERROR":
      return { ...state, loading: false, error: true, data: [] };
      case "NOT_FOUND":
      return { ...state, loading: false, error: false, data: [] };
      default:
      return state;
    }
  };

  const getStatus = (status: string) => {
    const stat = status.replace("JOB_", "")
    let color = "#339933" 
    if (stat == "CREATED") {
        color = "#b7b79e"
    } else if (stat == "RUNNING") {
        color = "#9ea4b7"
    } else if (stat == "FAILED") {
        color = ThemeColor.DARK_RED
    } else if (stat == "FINISHED") {
        color = ThemeColor.LIGHT_GREEN
    }
    return (
        <Pill style={{backgroundColor:color}}>{stat}</Pill>
    )
  }

  const parseDuration = (seconds: number): string => {                  
    seconds = parseInt(seconds.toString(), 10)                      
    const hours   = Math.floor(seconds / 3600)                 
    const minutes = Math.floor((seconds - (hours * 3600)) / 60)
    seconds = seconds - (hours * 3600) - (minutes * 60)  
    if ( hours ) {                                         
      if ( minutes ) {                                     
        return `${hours}h ${minutes}m ${seconds}s`           
      } else {                                               
        return `${hours}h ${seconds}s`                       
      }                                                      
    }                                                        
    if ( minutes ) {                                       
      return `${minutes}m ${seconds}s`                       
    }                                                        
    return `${seconds}s`                                     
  }     
  

const ImportList = (props: ImportListProps) => {
  const infoIcon = <IconInfoCircle />;
    const [intervalo, setIntervalo] = useState<NodeJS.Timeout|null>(null)
    const [api, dispatch] = useReducer(dataReducer, {loading: false,error: false, data: []});
    const RenderLoading = () => {
      return (
        <MantineProvider defaultColorScheme="light">
          <Loader color="blue" style={{marginLeft:"20px", marginTop:"5px"}}/>
        </MantineProvider>
      )
    }

    const toggle = (checked: boolean) => {
      if (checked) {
        console.log("ENABLING INTERVAL", intervalo)
        if (intervalo == null) {
          startInterval()
        }
      } else {
        clearIntervals()
      }
    }

    const startInterval = () => {
      console.log("B4! INTERVAL", intervalo)
      setIntervalo(setInterval(() => updateList(), 3000))
      console.log("AF! INTERVAL", intervalo)
    }

    const clearIntervals = () => {
      console.log("CLEARING INTERVAL", intervalo)
      clearInterval(intervalo as NodeJS.Timeout);
      setIntervalo(null);
      console.log("INTERVAL", intervalo)
    }
  
    const RenderError = () => {
      return (
        <MantineProvider defaultColorScheme="light">
          <Alert variant="outline" color="red" title="Unexpected Error" icon={infoIcon}>
            No response from backend. Please make sure b3loader is running
          </Alert>
        </MantineProvider>
      )
    }

    const RenderNoData = () => {
      return (
        <MantineProvider defaultColorScheme="light">
          <Box>
            <span style={{fontFamily:"tahoma", color:ThemeColor.DARK_BLUE}}>No jobs found</span>
          </Box>
        </MantineProvider>
      )
    }

    const updateList = async () => {
        dispatch({ type: ActionType.LOADING, payload: [] });
        const response = await props.api.listImports()
        if (response.error) {
          dispatch({ type: ActionType.ERROR, payload: [] });
        } else if (response.data) {
          const data = response.data.data as ImportJob[]
          if (data.length > 0) {
            dispatch({ type: ActionType.LOADED, payload: data });
          } else {
            dispatch({ type: ActionType.NOT_FOUND, payload: [] });
          } 
        }
    }
    
    const refresh = <IconRefresh className={classes.refresh} onClick={updateList}/>
    
    useEffect(() => {
      updateList()
      return () => {
        clearIntervals()
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

      const itemStyle = {
        marginTop:"10px",
        display:"inline", 
        margin:"5px", 
        minWidth:"fit-content",
        fontFamily: "tahoma",
        fontSize:"13px",
        marginLeft:"auto",
        marginRight:"auto"
    }

      const items = api.data? api.data.map((item:ImportJob) => (
        <li key={item.Id} style={{marginBottom:"15px",borderStyle:"solid", borderColor:"#DFE2E6", borderRadius:"5px", overflow: "scroll", width:"100%"}}>
            <Grid id={"listGrid" + item.Id} style={{maxWidth:"100%", maxHeight:"100%", overflow:"scroll"}}>
                <Grid.Col span={1} style={itemStyle}>{item.Id.split("-")[0]}</Grid.Col>
                <Grid.Col span={2} style={itemStyle}>{item.FileName}</Grid.Col>
                <Grid.Col span={1} style={itemStyle}>{getStatus(item.Status)}</Grid.Col>
                <Grid.Col span={1} style={itemStyle}>{item.Progress.toFixed(2)}%</Grid.Col>
                <Grid.Col span={2} style={itemStyle}>{item.Message}</Grid.Col>
                <Grid.Col span={1} style={itemStyle}>{parseDuration(item.DurationSeconds)}</Grid.Col>
                <Grid.Col span={2} style={itemStyle}>{moment(item.Date).format('DD/MM/YYYY HH:mm')}</Grid.Col>
            </Grid>
        </li>
      )): <Pill>No jobs found</Pill>;
      return (
          <div style={{width:"800px", marginTop:"30px"}}>
            <Grid>
              <Grid.Col span={3}>
              <h2 style={{margin:"0px",fontSize:"27px",color:"#6f7380", fontFamily:"tahoma", textAlign:"left"}}>
                {MESSAGE}
              </h2>
              </Grid.Col>
              <Grid.Col span={1} style={{padding: "0px",display: "inline-flex"}}>
              {refresh}
              </Grid.Col>
              <Grid.Col span={1} style={{padding: "0px",display: "inline-flex", marginBlock: "auto"}}>
                <Tooltip label="Auto refresh every 3s" refProp="rootRef">
                  <Switch  size="md" onChange={(event) => {
                    console.log("EVENT", event)
                    console.log("checked", event.currentTarget.checked)
                    toggle(event.currentTarget.checked)
                    }} color={ThemeColor.LIGHT_GREEN} onLabel="On" offLabel="Off" style={{display:"inline"}}/>
                </Tooltip>
              </Grid.Col>
            </Grid>
          
          
            
            <Grid  style={{maxWidth:"100%", maxHeight:"100%", marginBottom:"10px"}}>
              <Grid.Col span={1} style={itemStyle}>Id</Grid.Col>
              <Grid.Col span={2} style={itemStyle}>File</Grid.Col>
              <Grid.Col span={1} style={itemStyle}>Status</Grid.Col>
              <Grid.Col span={1} style={itemStyle}>Progress</Grid.Col>
              <Grid.Col span={2} style={itemStyle}>Message</Grid.Col>
              <Grid.Col span={1} style={itemStyle}>Duration</Grid.Col>
              <Grid.Col span={2} style={itemStyle}>Created</Grid.Col>
            </Grid>
            <List
              spacing="xs"
              size="sm"
              center
              listStyleType="none"
            >
              { 
                api.loading ? 
                  RenderLoading()
                :api.error ?
                  RenderError()
                :api.data && api.data.length > 0 ?
                  <>{items}</>
                :RenderNoData()
              }
            </List>
          </div>
      );
};

export default ImportList;