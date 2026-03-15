import {
  X, User, Phone, Calendar, Package, DollarSign, FileText,
  ArrowRight, Scissors, PartyPopper, AlertCircle
} from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import {
  ESTADOS_PEDIDO, FLUJO_ESTADOS, TIPOS_SERVICIO,
  ETIQUETAS_TIPO_SERVICIO, COLORES_TIPO_SERVICIO
} from '../../../core/constants/estados'

/**
 * Modal de detalle de pedido
 *
 * CAMBIOS:
 * 1. Usa ETIQUETAS_TIPO_SERVICIO para mostrar "Compostura" en lugar de "Remiendo"
 * 2. La sección de COMPOSTURA ahora muestra una lista de prendas con sus
 *    instrucciones individuales (igual que CONFECCIÓN), en lugar de un solo textarea.
 * 3. Colores y badges vienen del mapa COLORES_TIPO_SERVICIO centralizado.
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
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const formatearFechaCorta = (fecha) => {
    if (!fecha) return 'Sin fecha'
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
  }

  const obtenerSiguienteEstado = () => {
    const idx = FLUJO_ESTADOS.indexOf(pedido.estado)
    return idx < FLUJO_ESTADOS.length - 1 ? FLUJO_ESTADOS[idx + 1] : null
  }

  const puedeAvanzar = () => {
    const siguiente = obtenerSiguienteEstado()
    if (!siguiente) return false
    if (siguiente === ESTADOS_PEDIDO.ENTREGADO && pedido.saldo_pendiente > 0) return false
    return true
  }

  const siguienteEstado = obtenerSiguienteEstado()
  const puedeAvanzarEstado = puedeAvanzar()

  const handleAvanzarEstado = () => {
    if (siguienteEstado === ESTADOS_PEDIDO.ENTREGADO && pedido.saldo_pendiente > 0) {
      alert(`No se puede entregar el pedido. Saldo pendiente: $${parseFloat(pedido.saldo_pendiente).toFixed(2)}`)
      return
    }
    if (confirm(`¿Cambiar estado a "${siguienteEstado}"?`)) {
      onCambiarEstado(pedido.id_pedido, siguienteEstado)
    }
  }

  // ─── Colores del badge de tipo de servicio ───────────────────────────
  const colorTipo = COLORES_TIPO_SERVICIO[pedido.tipo_servicio] || {
    bg: 'bg-gray-100', text: 'text-gray-700'
  }

  // ─── Colores del badge de estado ────────────────────────────────────
  const badgeEstadoClass = {
    [ESTADOS_PEDIDO.EN_ESPERA]: 'bg-gray-100 text-gray-700',
    [ESTADOS_PEDIDO.EN_PROCESO]: 'bg-blue-100 text-blue-700',
    [ESTADOS_PEDIDO.PRUEBA]: 'bg-yellow-100 text-yellow-700',
    [ESTADOS_PEDIDO.TERMINADO]: 'bg-green-100 text-green-700',
    [ESTADOS_PEDIDO.ENTREGADO]: 'bg-success-100 text-success-700'
  }[pedido.estado] || 'bg-gray-100 text-gray-700'

  // ─── Renderizar sección específica por tipo ──────────────────────────
  const renderContenidoTipoServicio = () => {

    // ── CONFECCIÓN: lista de prendas con medidas ─────────────────────
    if (pedido.tipo_servicio === TIPOS_SERVICIO.CONFECCION) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Prendas a Confeccionar</h3>
          </div>

          {pedido.detalles_pedido?.length > 0 ? (
            <div className="space-y-2">
              {pedido.detalles_pedido.map((detalle, idx) => (
                <div key={idx} className="bg-white border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{detalle.tipo_prenda}</p>
                      {detalle.descripcion && (
                        <p className="text-sm text-gray-600 mt-1">{detalle.descripcion}</p>
                      )}
                      {detalle.id_medida && (
                        <p className="text-xs text-blue-600 mt-1">📏 Medidas ID: {detalle.id_medida}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-blue-700">No hay detalles de prendas registrados</p>
          )}
        </div>
      )
    }

    /**
     * CAMBIO: COMPOSTURA ahora muestra UNA tarjeta por prenda con sus
     * instrucciones, en lugar de un único bloque de texto global.
     * La estructura de datos es idéntica a Confección:
     *   detalles_pedido[n].tipo_prenda + detalles_pedido[n].descripcion
     */
    if (pedido.tipo_servicio === TIPOS_SERVICIO.COMPOSTURA) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Scissors className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">
              Prendas a Trabajar
              {pedido.detalles_pedido?.length > 0 && (
                <span className="ml-2 text-sm font-normal text-green-700">
                  ({pedido.detalles_pedido.length} {pedido.detalles_pedido.length === 1 ? 'prenda' : 'prendas'})
                </span>
              )}
            </h3>
          </div>

          {pedido.detalles_pedido?.length > 0 ? (
            <div className="space-y-2">
              {pedido.detalles_pedido.map((detalle, idx) => (
                <div key={idx} className="bg-white border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    {/* Número de prenda */}
                    <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-700">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{detalle.tipo_prenda}</p>
                      {detalle.descripcion ? (
                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                          {detalle.descripcion}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 mt-1 italic">Sin instrucciones específicas</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-green-700 italic">
              No hay prendas registradas en este pedido
            </p>
          )}
        </div>
      )
    }

    // ── RENTA: fechas e información del evento ───────────────────────
    if (pedido.tipo_servicio === TIPOS_SERVICIO.RENTA) {
      const fechaEvento = pedido.detalles_pedido?.[0]?.fecha_evento
      const fechaDevolucion = pedido.detalles_pedido?.[0]?.fecha_devolucion

      const diasRenta = () => {
        if (!fechaEvento || !fechaDevolucion) return 0
        return Math.ceil(
          (new Date(fechaDevolucion) - new Date(fechaEvento)) / (1000 * 60 * 60 * 24)
        )
      }
      const dias = diasRenta()

      return (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <PartyPopper className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Información de Renta</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-600 font-medium mb-1">Fecha del Evento</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <p className="text-sm font-semibold text-gray-900">
                  {fechaEvento ? formatearFechaCorta(fechaEvento) : 'No especificada'}
                </p>
              </div>
            </div>
            <div className="bg-white border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-600 font-medium mb-1">Fecha de Devolución</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <p className="text-sm font-semibold text-gray-900">
                  {fechaDevolucion ? formatearFechaCorta(fechaDevolucion) : 'No especificada'}
                </p>
              </div>
            </div>
          </div>

          {dias > 0 && (
            <div className="mt-3 bg-white border border-purple-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-600 font-medium">Duración</span>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-purple-600">{dias}</span>
                  <span className="text-sm text-purple-700">{dias === 1 ? 'día' : 'días'}</span>
                </div>
              </div>
            </div>
          )}

          {pedido.detalles_pedido?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-purple-600 font-medium mb-2">Prendas Rentadas:</p>
              <div className="space-y-1">
                {pedido.detalles_pedido.map((d, idx) => (
                  <div key={idx} className="bg-white border border-purple-200 rounded p-2">
                    <p className="text-sm font-medium text-gray-900">{d.tipo_prenda}</p>
                    {d.descripcion && (
                      <p className="text-xs text-gray-600 mt-0.5">{d.descripcion}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Pedido #{pedido.id_pedido}
            </h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorTipo.bg} ${colorTipo.text}`}>
                {ETIQUETAS_TIPO_SERVICIO[pedido.tipo_servicio] || pedido.tipo_servicio}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeEstadoClass}`}>
                {pedido.estado}
              </span>
            </div>
          </div>
          <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">

          {/* Cliente */}
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

          {/* Grupo */}
          {pedido.nombre_grupo && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Grupo</p>
                  <p className="text-lg font-bold text-purple-800">{pedido.nombre_grupo}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contenido específico por tipo */}
          {renderContenidoTipoServicio()}

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
                  <span className={`font-bold ${pedido.saldo_pendiente > 0 ? 'text-warning-600' : 'text-success-600'}`}>
                    ${parseFloat(pedido.saldo_pendiente).toFixed(2)}
                  </span>
                </div>
              </div>
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
          {pedido.pagos?.length > 0 && (
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
                <AlertCircle className="w-6 h-6 text-danger-600 flex-shrink-0" />
                <div className="text-sm text-danger-800">
                  <p className="font-semibold mb-1">⚠️ No se puede entregar</p>
                  <p>
                    El cliente debe liquidar el saldo pendiente de
                    ${parseFloat(pedido.saldo_pendiente).toFixed(2)} antes de marcar como entregado.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
