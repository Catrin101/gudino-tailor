import { TarjetaPedido } from './TarjetaPedido'

/**
 * Columna individual del tablero Kanban
 */
export function ColumnaKanban({ titulo, estado, pedidos, color, onPedidoClick }) {
  const colores = {
    gray: {
      header: 'bg-gray-100 text-gray-700',
      border: 'border-gray-200'
    },
    blue: {
      header: 'bg-blue-100 text-blue-700',
      border: 'border-blue-200'
    },
    yellow: {
      header: 'bg-yellow-100 text-yellow-700',
      border: 'border-yellow-200'
    },
    green: {
      header: 'bg-green-100 text-green-700',
      border: 'border-green-200'
    },
    success: {
      header: 'bg-success-100 text-success-700',
      border: 'border-success-200'
    }
  }

  const colorClasses = colores[color] || colores.gray

  return (
    <div className="flex flex-col h-full min-w-[300px]">
      {/* Header de la columna */}
      <div className={`${colorClasses.header} ${colorClasses.border} border-2 rounded-t-lg px-4 py-3 flex items-center justify-between`}>
        <h3 className="font-bold text-lg">{titulo}</h3>
        <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold">
          {pedidos.length}
        </span>
      </div>

      {/* Contenedor de tarjetas */}
      <div className={`flex-1 ${colorClasses.border} border-2 border-t-0 rounded-b-lg bg-gray-50 p-3 space-y-3 overflow-y-auto min-h-[400px] max-h-[calc(100vh-300px)]`}>
        {pedidos.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-400 text-sm">No hay pedidos</p>
          </div>
        ) : (
          pedidos.map(pedido => (
            <TarjetaPedido
              key={pedido.id_pedido}
              pedido={pedido}
              onClick={onPedidoClick}
            />
          ))
        )}
      </div>
    </div>
  )
}
