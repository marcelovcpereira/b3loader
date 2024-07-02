import './App.css'
import StockValue from './components/stock-value'

function App() {
  return (
    <>
      <div style={{marginBottom:"50px"}}>
        <h1>B3Loader</h1>
        <h3> dados da bolsa brasileira na sua mão em minutos</h3>
        <p>Busque abaixo a cotação histórica de qualquer ação brasileira</p>
      </div>
      <StockValue />
    </>
  )
}

export default App
