import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { NotificationProvider } from './shared/context/NotificationContext' // ← NUEVO
import { DashboardPage } from './pages/DashboardPage'
import { ClientesPage } from './pages/ClientesPage'
import { MedidasPage } from './pages/MedidasPage'
import { PedidosPage } from './pages/PedidosPage'
import { PagosPage } from './pages/PagosPage'
import { ConfiguracionPage } from './pages/ConfiguracionPage'

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="medidas" element={<MedidasPage />} />
            <Route path="pedidos" element={<PedidosPage />} />
            <Route path="pagos" element={<PagosPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  )
}

export default App
