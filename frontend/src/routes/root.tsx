import './root.css'
import DrawerMenu from "../components/drawer-menu";
import SearchableStockChart from "../components/searchable-stock-chart";
import '@mantine/core/styles.css';
import PageHeader from '../components/page-header';

export default function Root() {
    return (
        <div id="home" style={{width:"100%", height:"100%", marginBottom: "30px"}}>
        <PageHeader title='B3 Stock Price' />
        <SearchableStockChart />
        <DrawerMenu />
      </div> 
    );
  }