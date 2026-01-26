import { useState, useEffect } from 'react'
import { useNotification } from '../shared/context/NotificationContext'
import { usePedidos } from '../features/pedidos/hooks/usePedidos'
import { WizardPedido } from '../features/pedidos/components/WizardPedido'
import { ColumnaKanban } from '../features/pedidos/components/ColumnaKanban'
import { ModalDetallePedido } from '../features/pedidos/components/ModalDetallePedido'
import { Card } from '../shared/components/Card'
import { Button } from '../shared/components/Button'
import { Plus, LayoutGrid, List, Search } from 'lucide-react'
import { ESTADOS_PEDIDO } from '../core/constants/estados'


/**
 * Página principal del módulo de pedidos
 */
export function PedidosPage() {
  const {
    pedidos,
    loading,
    error,
    crearPedido,
    cambiarEstado,
    buscarPedidos,
    cargarPedidos
  } = usePedidos()

  const [vistaActual, setVistaActual] = useState('kanban') // 'kanban' | 'lista' | 'wizard'
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [mostrarModalPago, setMostrarModalPago] = useState(false)
  const [pedidoParaPago, setPedidoParaPago] = useState(null)

  const notification = useNotification()

  /**
   * Iniciar creación de pedido
   */
  const handleNuevoPedido = () => {
    setVistaActual('wizard')
  }

  /**
   * Guardar nuevo pedido
   */
  const handleGuardarPedido = async (datosPedido) => {
    try {
      const nuevoPedido = await crearPedido(datosPedido)
      notification.success(`Pedido #${nuevoPedido.id_pedido} creado correctamente`)
      setVistaActual('kanban')
    } catch (err) {
      notification.error(err.message)
    }
  }

  /**
   * Cancelar creación
   */
  const handleCancelar = async () => {
    const confirmar = await notification.showConfirm({
      title: 'Cancelar Pedido',
      message: '¿Cancelar la creación del pedido? Se perderán los datos ingresados.',
      type: 'warning',
      confirmText: 'Sí, cancelar',
      cancelText: 'Continuar editando'
    })

    if (confirmar) {
      setVistaActual('kanban')
    }
  }

  /**
   * Ver detalles de un pedido
   */
  const handleVerDetalle = (pedido) => {
    setPedidoSeleccionado(pedido)
    setMostrarModal(true)
  }

  /**
   * Cambiar estado de pedido
   */
  const handleCambiarEstado = async (idPedido, nuevoEstado) => {
    try {
      await cambiarEstado(idPedido, nuevoEstado)
      notification.success(`Estado actualizado a: ${nuevoEstado}`)
      setMostrarModal(false)
      setPedidoSeleccionado(null)
    } catch (err) {
      notification.error(err.message)
    }
  }

  /**
   * Registrar pago (placeholder)
   */
  const handleRegistrarPago = (pedido) => {
    setPedidoParaPago(pedido)
    setMostrarModalPago(true)
    setMostrarModal(false) // Cerrar modal de detalles
    // Navegar a la página de pagos con el pedido seleccionado
    window.location.href = `/pagos?pedido=${pedido.id_pedido}`
  }

  /**
   * Guardar pago desde el modal
   */
  const handleGuardarPago = async (datoPago) => {
    try {
      // Importar el servicio de pagos
      const { PagoService } = await import('../features/pagos/services/PagoService')
      const pagoService = new PagoService()

      await pagoService.registrar(datoPago)

      notification.success('Pago registrado correctamente')
      setMostrarModalPago(false)
      setPedidoParaPago(null)

      // Recargar pedidos para actualizar saldos
      await cargarPedidos()
    } catch (err) {
      if (err.advertencias) {
        // Error de sobrepago - necesita confirmación
        const confirmar = await notification.showConfirm({
          title: 'Sobrepago Detectado',
          message: `${err.advertencias[0].mensaje}\n\n¿Desea continuar y generar un crédito a favor del cliente?`,
          type: 'warning',
          confirmText: 'Sí, continuar',
          cancelText: 'Cancelar'
        })

        if (confirmar) {
          // Reintentar con confirmación
          await handleGuardarPago({ ...datoPago, confirmarSobrepago: true })
        }
      } else {
        notification.error(err.message)
      }
    }
  }

  /**
   * Buscar pedidos
   */
  const handleBuscar = async (termino) => {
    setTerminoBusqueda(termino)
    if (termino.trim()) {
      await buscarPedidos(termino)
    } else {
      await cargarPedidos()
    }
  }

  /**
   * Agrupar pedidos por estado
   */
  const pedidosPorEstado = {
    [ESTADOS_PEDIDO.EN_ESPERA]: pedidos.filter(p => p.estado === ESTADOS_PEDIDO.EN_ESPERA),
    [ESTADOS_PEDIDO.EN_PROCESO]: pedidos.filter(p => p.estado === ESTADOS_PEDIDO.EN_PROCESO),
    [ESTADOS_PEDIDO.PRUEBA]: pedidos.filter(p => p.estado === ESTADOS_PEDIDO.PRUEBA),
    [ESTADOS_PEDIDO.TERMINADO]: pedidos.filter(p => p.estado === ESTADOS_PEDIDO.TERMINADO)
  }

  /**
   * Formatear fecha
   */
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div>
      {/* Header */}
      {vistaActual !== 'wizard' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Gestión de Pedidos</h1>
              <p className="text-gray-600 mt-2">
                Control de trabajos y estados
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleNuevoPedido}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Pedido
            </Button>
          </div>

          {/* Barra de herramientas */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por grupo o # de pedido..."
                value={terminoBusqueda}
                onChange={(e) => handleBuscar(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Botones de vista */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setVistaActual('kanban')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${vistaActual === 'kanban'
                  ? 'bg-white text-primary-700 font-medium shadow'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </button>
              <button
                onClick={() => setVistaActual('lista')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${vistaActual === 'lista'
                  ? 'bg-white text-primary-700 font-medium shadow'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <List className="w-4 h-4" />
                Lista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error global */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-danger-50 text-danger-700 border border-danger-200">
          ⚠️ {error}
        </div>
      )}

      {/* VISTA: Wizard de nuevo pedido */}
      {vistaActual === 'wizard' && (
        <WizardPedido
          onGuardar={handleGuardarPedido}
          onCancelar={handleCancelar}
          loading={loading}
        />
      )}

      {/* VISTA: Tablero Kanban */}
      {vistaActual === 'kanban' && (
        <>
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-gray-50">
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-900">{pedidos.length}</p>
            </Card>

            <Card className="bg-gray-50">
              <p className="text-sm text-gray-600 font-medium">En Espera</p>
              <p className="text-3xl font-bold text-gray-900">
                {pedidosPorEstado[ESTADOS_PEDIDO.EN_ESPERA].length}
              </p>
            </Card>

            <Card className="bg-blue-50">
              <p className="text-sm text-blue-600 font-medium">En Proceso</p>
              <p className="text-3xl font-bold text-blue-900">
                {pedidosPorEstado[ESTADOS_PEDIDO.EN_PROCESO].length}
              </p>
            </Card>

            <Card className="bg-yellow-50">
              <p className="text-sm text-yellow-600 font-medium">En Prueba</p>
              <p className="text-3xl font-bold text-yellow-900">
                {pedidosPorEstado[ESTADOS_PEDIDO.PRUEBA].length}
              </p>
            </Card>

            <Card className="bg-green-50">
              <p className="text-sm text-green-600 font-medium">Terminados</p>
              <p className="text-3xl font-bold text-green-900">
                {pedidosPorEstado[ESTADOS_PEDIDO.TERMINADO].length}
              </p>
            </Card>
          </div>

          {/* Tablero Kanban */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Cargando pedidos...</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              <ColumnaKanban
                titulo="En Espera"
                estado={ESTADOS_PEDIDO.EN_ESPERA}
                pedidos={pedidosPorEstado[ESTADOS_PEDIDO.EN_ESPERA]}
                color="gray"
                onPedidoClick={handleVerDetalle}
              />

              <ColumnaKanban
                titulo="En Proceso"
                estado={ESTADOS_PEDIDO.EN_PROCESO}
                pedidos={pedidosPorEstado[ESTADOS_PEDIDO.EN_PROCESO]}
                color="blue"
                onPedidoClick={handleVerDetalle}
              />

              <ColumnaKanban
                titulo="Prueba"
                estado={ESTADOS_PEDIDO.PRUEBA}
                pedidos={pedidosPorEstado[ESTADOS_PEDIDO.PRUEBA]}
                color="yellow"
                onPedidoClick={handleVerDetalle}
              />

              <ColumnaKanban
                titulo="Terminado"
                estado={ESTADOS_PEDIDO.TERMINADO}
                pedidos={pedidosPorEstado[ESTADOS_PEDIDO.TERMINADO]}
                color="green"
                onPedidoClick={handleVerDetalle}
              />
            </div>
          )}
        </>
      )}

      {/* VISTA: Lista */}
      {vistaActual === 'lista' && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Lista de Pedidos</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Cargando pedidos...</p>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay pedidos para mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Servicio</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha Promesa</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Saldo</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pedidos.map(pedido => (
                    <tr key={pedido.id_pedido} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        #{pedido.id_pedido}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {pedido.clientes?.nombre || 'Sin cliente'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${pedido.tipo_servicio === 'Confeccion'
                          ? 'bg-blue-100 text-blue-700'
                          : pedido.tipo_servicio === 'Remiendo'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                          }`}>
                          {pedido.tipo_servicio}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${pedido.estado === 'En Espera'
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
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatearFecha(pedido.fecha_promesa)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                        ${parseFloat(pedido.costo_total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`font-semibold ${pedido.saldo_pendiente > 0
                          ? 'text-warning-600'
                          : 'text-success-600'
                          }`}>
                          ${parseFloat(pedido.saldo_pendiente).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="outline"
                          onClick={() => handleVerDetalle(pedido)}
                          className="text-sm py-1 px-3"
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Modal de detalles */}
      {mostrarModal && pedidoSeleccionado && (
        <ModalDetallePedido
          pedido={pedidoSeleccionado}
          onCerrar={() => {
            setMostrarModal(false)
            setPedidoSeleccionado(null)
          }}
          onCambiarEstado={handleCambiarEstado}
          onRegistrarPago={handleRegistrarPago}
          loading={loading}
        />
      )}
    </div>
  )
}
