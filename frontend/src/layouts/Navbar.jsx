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

  // ← NUEVO: Agregar hooks
  const { logout, getUserData } = useAuth()
  const notification = useNotification()
  const userData = getUserData()

  // ← NUEVO: Handler de logout
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

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 h-16">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* ... código existente ... */}

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
