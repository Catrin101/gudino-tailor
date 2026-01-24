import { Calendar, User, DollarSign, Package, AlertCircle } from 'lucide-react'
import { Card } from '../../../shared/components/Card'

/**
 * Tarjeta individual de pedido para el Kanban
 */
export function TarjetaPedido({ pedido, onClick }) {
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha'
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short'
    })
  }

  const esFechaVencida = () => {
    if (!pedido.fecha_promesa) return false
    const hoy = new Date()
    const promesa = new Date(pedido.fecha_promesa)
    return promesa < hoy
  }

  const diasRestantes = () => {
    if (!pedido.fecha_promesa) return null
    const hoy = new Date()
    const promesa = new Date(pedido.fecha_promesa)
    const diferencia = Math.ceil((promesa - hoy) / (1000 * 60 * 60 * 24))
    return diferencia
  }

  const dias = diasRestantes()
  const vencido = esFechaVencida()

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(pedido)}
    >
      <div className="space-y-3">
        {/* Header con ID y tipo */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500">
            #{pedido.id_pedido}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            pedido.tipo_servicio === 'Confeccion'
              ? 'bg-blue-100 text-blue-700'
              : pedido.tipo_servicio === 'Remiendo'
              ? 'bg-green-100 text-green-700'
              : 'bg-purple-100 text-purple-700'
          }`}>
            {pedido.tipo_servicio}
          </span>
        </div>

        {/* Cliente */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="font-semibold text-gray-900 truncate">
            {pedido.clientes?.nombre || 'Sin cliente'}
          </span>
        </div>

        {/* Grupo (si aplica) */}
        {pedido.nombre_grupo && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="w-4 h-4" />
            <span className="truncate">{pedido.nombre_grupo}</span>
          </div>
        )}

        {/* Fecha de entrega */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex-1 flex items-center justify-between">
            <span className={`text-sm ${
              vencido ? 'text-danger-600 font-semibold' : 'text-gray-600'
            }`}>
              {formatearFecha(pedido.fecha_promesa)}
            </span>
            {dias !== null && (
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                vencido
                  ? 'bg-danger-100 text-danger-700'
                  : dias <= 3
                  ? 'bg-warning-100 text-warning-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {vencido ? `${Math.abs(dias)}d vencido` : `${dias}d restantes`}
              </span>
            )}
          </div>
        </div>

        {/* Saldo pendiente */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex-1 flex items-center justify-between">
            <span className="text-sm text-gray-600">Saldo:</span>
            <span className={`text-sm font-bold ${
              pedido.saldo_pendiente > 0
                ? 'text-warning-600'
                : 'text-success-600'
            }`}>
              ${parseFloat(pedido.saldo_pendiente).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Indicador de saldo pendiente alto */}
        {pedido.saldo_pendiente > 0 && pedido.estado === 'Terminado' && (
          <div className="flex items-center gap-2 p-2 bg-warning-50 rounded text-xs text-warning-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Pendiente de pago</span>
          </div>
        )}
      </div>
    </Card>
  )
}
