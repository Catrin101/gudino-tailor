import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { NotificationProvider } from './shared/context/NotificationContext'
import { AuthProvider } from './features/auth/context/AuthContext' // ← NUEVO
import { ProtectedRoute } from './features/auth/components/ProtectedRoute' // ← NUEVO
import { LoginPage } from './pages/LoginPage' // ← NUEVO
import { DashboardPage } from './pages/DashboardPage'
import { ClientesPage } from './pages/ClientesPage'
import { MedidasPage } from './pages/MedidasPage'
import { PedidosPage } from './pages/PedidosPage'
import { PagosPage } from './pages/PagosPage'
import { ConfiguracionPage } from './pages/ConfiguracionPage'

function App() {
  return (
    <AuthProvider> {/* ← NUEVO: Envolver todo con AuthProvider */}
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta pública: Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas protegidas */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="medidas" element={<MedidasPage />} />
              <Route path="pedidos" element={<PedidosPage />} />
              <Route path="pagos" element={<PagosPage />} />
              <Route path="configuracion" element={<ConfiguracionPage />} />
            </Route>

            {/* Redireccionar rutas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App