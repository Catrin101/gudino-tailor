import { Card } from '../shared/components/Card'
import { Package, Users, DollarSign, AlertCircle } from 'lucide-react'

/**
 * Página principal del dashboard
 * Muestra resumen de estadísticas
 */
export function DashboardPage() {
  const estadisticas = [
    {
      titulo: 'Pedidos Activos',
      valor: '12',
      icono: Package,
      color: 'bg-blue-500',
      cambio: '+3 esta semana'
    },
    {
      titulo: 'Clientes',
      valor: '48',
      icono: Users,
      color: 'bg-green-500',
      cambio: '+5 este mes'
    },
    {
      titulo: 'Saldo Pendiente',
      valor: '$3,450',
      icono: DollarSign,
      color: 'bg-yellow-500',
      cambio: '8 pedidos'
    },
    {
      titulo: 'Pedidos Urgentes',
      valor: '3',
      icono: AlertCircle,
      color: 'bg-red-500',
      cambio: 'Vencen hoy'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Resumen de tu negocio</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {estadisticas.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.titulo}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.valor}
                </p>
                <p className="text-sm text-gray-500">{stat.cambio}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icono className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Secciones adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold mb-4">Pedidos Recientes</h2>
          <p className="text-gray-500">Próximamente...</p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
          <p className="text-gray-500">Próximamente...</p>
        </Card>
      </div>
    </div>
  )
}
