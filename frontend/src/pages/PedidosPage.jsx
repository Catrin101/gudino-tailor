import { Card } from '../shared/components/Card'
import { Package } from 'lucide-react'

export function PedidosPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Gestión de Pedidos</h1>
        <p className="text-gray-600 mt-2">Control de trabajos y estados</p>
      </div>

      <Card className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Módulo en Desarrollo
        </h2>
        <p className="text-gray-500">
          Esta sección estará disponible próximamente
        </p>
      </Card>
    </div>
  )
}
