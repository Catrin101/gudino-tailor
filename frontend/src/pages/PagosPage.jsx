import { useState, useEffect } from 'react'
import { useNotification } from '../shared/context/NotificationContext'
import { usePagos } from '../features/pagos/hooks/usePagos'
import { usePedidos } from '../features/pedidos/hooks/usePedidos'
import { FormularioPago } from '../features/pagos/components/FormularioPago'
import { ResumenCaja } from '../features/pagos/components/ResumenCaja'
import { Card } from '../shared/components/Card'
import { Button } from '../shared/components/Button'
import { Input } from '../shared/components/Input'
import { DollarSign, Calendar, Search, Filter, Download } from 'lucide-react'

/**
 * Página principal del módulo de pagos y caja
 */
export function PagosPage() {
  const {
    pagos,
    loading,
    error,
    resumenDia,
    registrarPago,
    cargarPagosPorFechas,
    cargarResumenDia
  } = usePagos()

  const { pedidos, cargarPedidos: cargarPedidosCompletos } = usePedidos()

  const [vistaActual, setVistaActual] = useState('resumen') // 'resumen' | 'historial' | 'registrar'
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)

  const notification = useNotification()

  const [filtros, setFiltros] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    busqueda: ''
  })

  // Cargar pedidos al inicio
  useEffect(() => {
    cargarResumenDia()
    cargarPagosPorFechas(filtros.fechaInicio, filtros.fechaFin)
    cargarPedidosCompletos() // Cargar pedidos para poder buscarlos
  }, [])

  /**
   * Mostrar mensaje temporal
   */
  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  /**
   * Registrar pago
   */
  const handleRegistrarPago = async (datoPago) => {
    try {
      await registrarPago(datoPago)
      notification.success('Pago registrado correctamente')
      setVistaActual('resumen')
      setPedidoSeleccionado(null)
      // Recargar datos
      await cargarResumenDia()
      await cargarPagosPorFechas(filtros.fechaInicio, filtros.fechaFin)
    } catch (err) {
      if (err.advertencias) {
        // Error de sobrepago
        notification.error('Sobrepago detectado. Por favor confirma.')
      } else {
        notification.error(err.message)
      }
    }
  }

  /**
   * Buscar pedido para registrar pago
   */
  const handleBuscarPedido = (termino) => {
    const numeroPedido = parseInt(termino)
    if (isNaN(numeroPedido)) {
      notification.error('Ingresa un número de pedido válido')
      return
    }

    const pedido = pedidos.find(p => p.id_pedido === numeroPedido)
    if (!pedido) {
      notification.error('Pedido no encontrado')
      return
    }

    if (pedido.saldo_pendiente <= 0) {
      notification.error('Este pedido ya está completamente pagado')
      return
    }

    setPedidoSeleccionado(pedido)
    setVistaActual('registrar')
  }

  /**
   * Aplicar filtros de fecha
   */
  const handleFiltrarFechas = async () => {
    await cargarPagosPorFechas(filtros.fechaInicio, filtros.fechaFin)
  }

  /**
   * Formatear fecha
   */
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Calcular total de pagos filtrados
   */
  const totalPagosFiltrados = pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Caja y Pagos</h1>
            <p className="text-gray-600 mt-2">
              Control financiero del negocio
            </p>
          </div>

          {vistaActual === 'resumen' && (
            <Button
              variant="primary"
              onClick={() => setVistaActual('registrar')}
              className="flex items-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              Registrar Pago
            </Button>
          )}
        </div>

        {/* Pestañas */}
        {vistaActual !== 'registrar' && (
          <div className="mt-6 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setVistaActual('resumen')}
              className={`px-4 py-2 font-medium transition-colors ${vistaActual === 'resumen'
                ? 'text-primary-700 border-b-2 border-primary-700'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Resumen del Día
            </button>
            <button
              onClick={() => setVistaActual('historial')}
              className={`px-4 py-2 font-medium transition-colors ${vistaActual === 'historial'
                ? 'text-primary-700 border-b-2 border-primary-700'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Historial de Pagos
            </button>
          </div>
        )}
      </div>

      {/* Error global */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-danger-50 text-danger-700 border border-danger-200">
          ⚠️ {error}
        </div>
      )}

      {/* VISTA: Resumen del día */}
      {vistaActual === 'resumen' && (
        <div>
          <ResumenCaja resumen={resumenDia} loading={loading} />

          {/* Últimos pagos del día */}
          <Card className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Últimos Pagos del Día</h2>
              <span className="text-sm text-gray-500">
                {pagos.filter(p => {
                  const hoy = new Date().toDateString()
                  const fechaPago = new Date(p.fecha_pago).toDateString()
                  return fechaPago === hoy
                }).length} transacciones
              </span>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {pagos
                  .filter(p => {
                    const hoy = new Date().toDateString()
                    const fechaPago = new Date(p.fecha_pago).toDateString()
                    return fechaPago === hoy
                  })
                  .slice(0, 10)
                  .map(pago => (
                    <div
                      key={pago.id_pago}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">
                            Pedido #{pago.id_pedido}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${pago.concepto === 'Anticipo'
                            ? 'bg-blue-100 text-blue-700'
                            : pago.concepto === 'Abono'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                            }`}>
                            {pago.concepto}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{formatearFecha(pago.fecha_pago)}</span>
                          <span>•</span>
                          <span>{pago.metodo}</span>
                          {pago.pedidos?.clientes?.nombre && (
                            <>
                              <span>•</span>
                              <span>{pago.pedidos.clientes.nombre}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-xl font-bold text-success-600">
                        +${parseFloat(pago.monto).toFixed(2)}
                      </span>
                    </div>
                  ))}

                {pagos.filter(p => {
                  const hoy = new Date().toDateString()
                  const fechaPago = new Date(p.fecha_pago).toDateString()
                  return fechaPago === hoy
                }).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No hay pagos registrados hoy
                    </div>
                  )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* VISTA: Historial de pagos */}
      {vistaActual === 'historial' && (
        <div>
          {/* Filtros */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicio
                </label>
                <Input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicio: e.target.value }))}
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Fin
                </label>
                <Input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: e.target.value }))}
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="primary"
                  onClick={handleFiltrarFechas}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtrar
                </Button>
              </div>
            </div>
          </Card>

          {/* Resumen del periodo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-primary-50">
              <p className="text-sm text-primary-600 font-medium">Total del Periodo</p>
              <p className="text-3xl font-bold text-primary-900 mt-1">
                ${totalPagosFiltrados.toFixed(2)}
              </p>
            </Card>

            <Card className="bg-blue-50">
              <p className="text-sm text-blue-600 font-medium">Transacciones</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {pagos.length}
              </p>
            </Card>

            <Card className="bg-green-50">
              <p className="text-sm text-green-600 font-medium">Promedio por Pago</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                ${pagos.length > 0 ? (totalPagosFiltrados / pagos.length).toFixed(2) : '0.00'}
              </p>
            </Card>
          </div>

          {/* Tabla de pagos */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Historial de Pagos</h2>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Cargando pagos...</p>
              </div>
            ) : pagos.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay pagos en este periodo</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Pedido
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Concepto
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Método
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pagos.map(pago => (
                      <tr key={pago.id_pago} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatearFecha(pago.fecha_pago)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          #{pago.id_pedido}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {pago.pedidos?.clientes?.nombre || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${pago.concepto === 'Anticipo'
                            ? 'bg-blue-100 text-blue-700'
                            : pago.concepto === 'Abono'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                            }`}>
                            {pago.concepto}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {pago.metodo}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-success-600">
                          ${parseFloat(pago.monto).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* VISTA: Registrar pago */}
      {vistaActual === 'registrar' && (
        <Card className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Registrar Pago</h2>

          {!pedidoSeleccionado ? (
            <div>
              <p className="text-gray-600 mb-4">
                Busca el pedido por nombre de cliente o número de pedido
              </p>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de cliente o #pedido..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Lista de pedidos con saldo pendiente */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pedidos
                  .filter(p => {
                    // Filtrar solo pedidos con saldo pendiente
                    if (p.saldo_pendiente <= 0) return false
                    if (p.estado === 'Entregado') return false

                    // Aplicar búsqueda
                    if (filtros.busqueda.trim()) {
                      const termino = filtros.busqueda.toLowerCase()
                      const nombreCliente = p.clientes?.nombre?.toLowerCase() || ''
                      const idPedido = p.id_pedido.toString()

                      return nombreCliente.includes(termino) || idPedido.includes(termino)
                    }

                    return true
                  })
                  .map(pedido => (
                    <button
                      key={pedido.id_pedido}
                      onClick={() => setPedidoSeleccionado(pedido)}
                      className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-gray-900">
                              Pedido #{pedido.id_pedido}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${pedido.tipo_servicio === 'Confeccion'
                              ? 'bg-blue-100 text-blue-700'
                              : pedido.tipo_servicio === 'Remiendo'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-purple-100 text-purple-700'
                              }`}>
                              {pedido.tipo_servicio}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${pedido.estado === 'En Espera'
                              ? 'bg-gray-100 text-gray-700'
                              : pedido.estado === 'En Proceso'
                                ? 'bg-blue-100 text-blue-700'
                                : pedido.estado === 'Prueba'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                              {pedido.estado}
                            </span>
                          </div>

                          <p className="text-gray-900 font-medium mb-1">
                            {pedido.clientes?.nombre || 'Sin cliente'}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Total: ${parseFloat(pedido.costo_total).toFixed(2)}</span>
                            <span>•</span>
                            <span>Pagado: ${(parseFloat(pedido.costo_total) - parseFloat(pedido.saldo_pendiente)).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Saldo Pendiente</p>
                          <p className="text-2xl font-bold text-warning-600">
                            ${parseFloat(pedido.saldo_pendiente).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}

                {pedidos.filter(p => {
                  if (p.saldo_pendiente <= 0) return false
                  if (p.estado === 'Entregado') return false

                  if (filtros.busqueda.trim()) {
                    const termino = filtros.busqueda.toLowerCase()
                    const nombreCliente = p.clientes?.nombre?.toLowerCase() || ''
                    const idPedido = p.id_pedido.toString()
                    return nombreCliente.includes(termino) || idPedido.includes(termino)
                  }

                  return true
                }).length === 0 && (
                    <div className="text-center py-12">
                      <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {filtros.busqueda.trim()
                          ? 'No se encontraron pedidos con saldo pendiente'
                          : 'No hay pedidos con saldo pendiente'
                        }
                      </p>
                    </div>
                  )}
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setVistaActual('resumen')}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <FormularioPago
              pedido={pedidoSeleccionado}
              onGuardar={handleRegistrarPago}
              onCancelar={() => {
                setPedidoSeleccionado(null)
                setVistaActual('resumen')
              }}
              loading={loading}
            />
          )}
        </Card>
      )}
    </div>
  )
}
