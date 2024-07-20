import './root.css'
import DrawerMenu from "../components/drawer-menu";
import SearchableStockChart from "../components/searchable-stock-chart";
import '@mantine/core/styles.css';
import PageHeader from '../components/page-header';
import { BackendAPI } from '../api/base';
export interface RootProps {
  api: BackendAPI
}
export default function Root(props: RootProps) {
    return (
        <div id="home" style={{width:"100%", height:"100%", marginBottom: "30px"}}>
        <PageHeader title='B3 Stock Price' />
        <SearchableStockChart api={props.api}/>
        <DrawerMenu />
      </div> 
    );
  }