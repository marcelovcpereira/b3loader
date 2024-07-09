import './root.css'
import DrawerMenu from "../components/drawer-menu";
import SearchableStockChart from "../components/searchable-stock-chart";
import '@mantine/core/styles.css';

export default function Root() {
    return (
        <div id="home" style={{width:"100%", height:"100%", marginBottom: "30px"}}>
        <SearchableStockChart />
        <DrawerMenu />
      </div> 
    );
  }