import { Calendar, User, DollarSign, Package, AlertCircle } from 'lucide-react'
import { Card } from '../../../shared/components/Card'
import { ETIQUETAS_TIPO_SERVICIO, COLORES_TIPO_SERVICIO } from '../../../core/constants/estados'

/**
 * Tarjeta individual de pedido para el Kanban
 *
 * CAMBIO: Usa ETIQUETAS_TIPO_SERVICIO para mostrar "Compostura" en lugar de "Remiendo"
 * y COLORES_TIPO_SERVICIO desde el mapa centralizado.
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
    return new Date(pedido.fecha_promesa) < new Date()
  }

  const diasRestantes = () => {
    if (!pedido.fecha_promesa) return null
    return Math.ceil((new Date(pedido.fecha_promesa) - new Date()) / (1000 * 60 * 60 * 24))
  }

  const dias = diasRestantes()
  const vencido = esFechaVencida()

  // Badge de tipo de servicio desde mapa centralizado
  const colorTipo = COLORES_TIPO_SERVICIO[pedido.tipo_servicio] || {
    bg: 'bg-gray-100', text: 'text-gray-700'
  }
  const etiquetaTipo = ETIQUETAS_TIPO_SERVICIO[pedido.tipo_servicio] || pedido.tipo_servicio

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(pedido)}
    >
      <div className="space-y-3">
        {/* ID y tipo de servicio */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500">
            #{pedido.id_pedido}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorTipo.bg} ${colorTipo.text}`}>
            {etiquetaTipo}
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
            <span className={`text-sm ${vencido ? 'text-danger-600 font-semibold' : 'text-gray-600'}`}>
              {formatearFecha(pedido.fecha_promesa)}
            </span>
            {dias !== null && (
              <span className={`text-xs font-medium px-2 py-1 rounded ${vencido
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
            <span className={`text-sm font-bold ${pedido.saldo_pendiente > 0 ? 'text-warning-600' : 'text-success-600'
              }`}>
              ${parseFloat(pedido.saldo_pendiente).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Alerta saldo pendiente + terminado */}
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
