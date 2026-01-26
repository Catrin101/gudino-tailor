import { Search, Bell, User, Menu } from 'lucide-react'
import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '../features/auth/context/AuthContext'
import { useNotification } from '../shared/context/NotificationContext'

/**
 * Barra de navegación superior
 * Incluye logo, búsqueda global y menú de usuario
 */
export function Navbar({ onToggleSidebar, onSearch }) {
  const [terminoBusqueda, setTerminoBusqueda] = useState('')

  const { logout, getUserData } = useAuth()
  const notification = useNotification()
  const userData = getUserData()

  const handleLogout = async () => {
    const confirmar = await notification.showConfirm({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      type: 'warning',
      confirmText: 'Sí, cerrar sesión',
      cancelText: 'Cancelar'
    })

    if (confirmar) {
      const result = await logout()
      if (result.success) {
        notification.success('Sesión cerrada correctamente')
      } else {
        notification.error(result.error)
      }
    }
  }

  const handleBuscar = (e) => {
    const valor = e.target.value
    setTerminoBusqueda(valor)
    if (onSearch) {
      onSearch(valor)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 h-16">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Botón de menú hamburguesa (móvil) + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">GT</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">GudiñoTailor</h1>
              <p className="text-xs text-gray-500">Sistema de Sastrería</p>
            </div>
          </div>
        </div>

        {/* Búsqueda global (oculta en móvil pequeño) */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar..."
              value={terminoBusqueda}
              onChange={handleBuscar}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Acciones de usuario - ACTUALIZAR */}
        <div className="flex items-center gap-2">
          {/* Notificaciones */}
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            aria-label="Notificaciones"
          >
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
          </button>

          {/* Menú de usuario - NUEVO */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-gray-700">
                {userData?.nombre || 'Usuario'}
              </span>
              <span className="text-xs text-gray-500">
                {userData?.rol || 'Admin'}
              </span>
            </div>

            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>

            {/* Botón de logout - NUEVO */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
