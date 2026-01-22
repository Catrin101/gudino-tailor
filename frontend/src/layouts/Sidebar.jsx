import { 
  LayoutDashboard, 
  Users, 
  Ruler, 
  Package, 
  DollarSign, 
  Settings,
  X,
  ChevronLeft
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

/**
 * Menú lateral de navegación
 * Responsive con versión móvil colapsable
 */
export function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      badge: null
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      path: '/clientes',
      badge: null
    },
    {
      id: 'medidas',
      label: 'Medidas',
      icon: Ruler,
      path: '/medidas',
      badge: null
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: Package,
      path: '/pedidos',
      badge: '5' // Ejemplo de badge
    },
    {
      id: 'pagos',
      label: 'Caja y Pagos',
      icon: DollarSign,
      path: '/pagos',
      badge: null
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: Settings,
      path: '/configuracion',
      badge: null
    }
  ]

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header del sidebar (móvil) */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
            <span className="font-semibold text-gray-900">Menú</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      // Cerrar sidebar en móvil al navegar
                      if (window.innerWidth < 1024) {
                        onClose()
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-semibold bg-primary-600 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-bold text-sm">EG</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Enrique Gudiño
                </p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
