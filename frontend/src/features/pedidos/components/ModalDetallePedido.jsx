import { X, User, Phone, Calendar, Package, DollarSign, FileText, ArrowRight } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { ESTADOS_PEDIDO, FLUJO_ESTADOS } from '../../../core/constants/estados'

/**
 * Modal para ver detalles completos del pedido
 * Permite cambiar de estado
 */
export function ModalDetallePedido({ 
  pedido, 
  onCerrar, 
  onCambiarEstado,
  onRegistrarPago,
  loading = false
}) {
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha'
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const obtenerSiguienteEstado = () => {
    const indiceActual = FLUJO_ESTADOS.indexOf(pedido.estado)
    if (indiceActual < FLUJO_ESTADOS.length - 1) {
      return FLUJO_ESTADOS[indiceActual + 1]
    }
    return null
  }

  const puedeAvanzar = () => {
    const siguiente = obtenerSiguienteEstado()
    if (!siguiente) return false

    // No permitir entregar si hay saldo pendiente
    if (siguiente === ESTADOS_PEDIDO.ENTREGADO && pedido.saldo_pendiente > 0) {
      return false
    }

    return true
  }

  const siguienteEstado = obtenerSiguienteEstado()
  const puedeAvanzarEstado = puedeAvanzar()

  const handleAvanzarEstado = () => {
    if (siguienteEstado === ESTADOS_PEDIDO.ENTREGADO && pedido.saldo_pendiente > 0) {
      alert(`No se puede entregar el pedido. Saldo pendiente: $${pedido.saldo_pendiente.toFixed(2)}`)
      return
    }

    if (confirm(`¿Cambiar estado a "${siguienteEstado}"?`)) {
      onCambiarEstado(pedido.id_pedido, siguienteEstado)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Pedido #{pedido.id_pedido}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                pedido.tipo_servicio === 'Confeccion'
                  ? 'bg-blue-100 text-blue-700'
                  : pedido.tipo_servicio === 'Remiendo'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {pedido.tipo_servicio}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                pedido.estado === 'En Espera'
                  ? 'bg-gray-100 text-gray-700'
                  : pedido.estado === 'En Proceso'
                  ? 'bg-blue-100 text-blue-700'
                  : pedido.estado === 'Prueba'
                  ? 'bg-yellow-100 text-yellow-700'
                  : pedido.estado === 'Terminado'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-success-100 text-success-700'
              }`}>
                {pedido.estado}
              </span>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información del cliente */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Información del Cliente</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{pedido.clientes?.nombre || 'Sin cliente'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">{pedido.clientes?.telefono || 'Sin teléfono'}</span>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Fecha de Creación</span>
              </div>
              <p className="text-blue-800">{formatearFecha(pedido.fecha_creacion)}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Fecha Prometida</span>
              </div>
              <p className="text-green-800">{formatearFecha(pedido.fecha_promesa)}</p>
            </div>
          </div>

          {/* Grupo (si aplica) */}
          {pedido.nombre_grupo && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Grupo</p>
                  <p className="text-purple-800">{pedido.nombre_grupo}</p>
                </div>
              </div>
            </div>
          )}

          {/* Detalles del pedido */}
          {pedido.detalles_pedido && pedido.detalles_pedido.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Detalles del Pedido</h3>
              <div className="space-y-2">
                {pedido.detalles_pedido.map((detalle, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{detalle.tipo_prenda}</span>
                    </div>
                    {detalle.descripcion && (
                      <p className="text-sm text-gray-600 mt-1 ml-6">{detalle.descripcion}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información financiera */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Información de Pago</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Costo Total:</span>
                <span className="font-semibold text-gray-900">
                  ${parseFloat(pedido.costo_total).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Total Pagado:</span>
                <span className="font-semibold text-success-600">
                  ${(parseFloat(pedido.costo_total) - parseFloat(pedido.saldo_pendiente)).toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between text-xl">
                  <span className="font-semibold text-gray-900">Saldo Pendiente:</span>
                  <span className={`font-bold ${
                    pedido.saldo_pendiente > 0
                      ? 'text-warning-600'
                      : 'text-success-600'
                  }`}>
                    ${parseFloat(pedido.saldo_pendiente).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-success-500 h-3 rounded-full transition-all"
                    style={{ 
                      width: `${((pedido.costo_total - pedido.saldo_pendiente) / pedido.costo_total * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Historial de pagos */}
          {pedido.pagos && pedido.pagos.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Historial de Pagos</h3>
              <div className="space-y-2">
                {pedido.pagos.map((pago, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{pago.concepto}</p>
                      <p className="text-sm text-gray-500">
                        {formatearFecha(pago.fecha_pago)} • {pago.metodo}
                      </p>
                    </div>
                    <span className="font-bold text-success-600">
                      +${parseFloat(pago.monto).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerta si no puede entregar */}
          {pedido.estado === ESTADOS_PEDIDO.TERMINADO && pedido.saldo_pendiente > 0 && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <div className="flex gap-3">
                <DollarSign className="w-6 h-6 text-danger-600 flex-shrink-0" />
                <div className="text-sm text-danger-800">
                  <p className="font-semibold mb-1">⚠️ No se puede entregar</p>
                  <p>
                    El cliente debe liquidar el saldo pendiente de ${pedido.saldo_pendiente.toFixed(2)} 
                    antes de poder marcar el pedido como entregado.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
          {pedido.saldo_pendiente > 0 && (
            <Button
              variant="success"
              onClick={() => onRegistrarPago(pedido)}
              className="flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Registrar Pago
            </Button>
          )}

          {siguienteEstado && (
            <Button
              variant="primary"
              onClick={handleAvanzarEstado}
              disabled={!puedeAvanzarEstado || loading}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {loading ? 'Cambiando...' : (
                <>
                  Avanzar a: {siguienteEstado}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          )}

          {pedido.estado === ESTADOS_PEDIDO.ENTREGADO && (
            <div className="flex-1 flex items-center justify-center gap-2 text-success-700 font-medium">
              <span className="text-2xl">✓</span>
              Pedido Completado
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
