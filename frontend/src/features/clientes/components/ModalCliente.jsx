import { X, User, Phone, Calendar, FileText, DollarSign, Package } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { useEffect, useState } from 'react'
import { ClienteService } from '../services/ClienteService'

/**
 * Modal para ver detalles completos del cliente
 * Incluye historial y estadísticas
 */
export function ModalCliente({ cliente, onCerrar, onEditar, onDesactivar }) {
  const [estadisticas, setEstadisticas] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [cliente])

  const cargarEstadisticas = async () => {
    try {
      const service = new ClienteService()
      const stats = await service.obtenerEstadisticas(cliente.id_cliente)
      setEstadisticas(stats)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setCargando(false)
    }
  }

  const formatearTelefono = (telefono) => {
    if (!telefono || telefono.length !== 10) return telefono
    return `(${telefono.slice(0, 3)}) ${telefono.slice(3, 6)}-${telefono.slice(6)}`
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin registro'
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Detalles del Cliente</h2>
          <button
            onClick={onCerrar}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-primary-600" />
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="text-lg font-semibold">{cliente.nombre}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-primary-600" />
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="text-lg font-semibold">{formatearTelefono(cliente.telefono)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary-600" />
              <div>
                <p className="text-sm text-gray-500">Fecha de Registro</p>
                <p className="text-lg">{formatearFecha(cliente.fecha_registro)}</p>
              </div>
            </div>

            {cliente.notas_generales && (
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-primary-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Notas Generales</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {cliente.notas_generales}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Estadísticas */}
          {!cargando && estadisticas && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total de pedidos */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Pedidos</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {estadisticas.totalPedidos}
                  </p>
                </div>

                {/* Saldo pendiente */}
                <div className={`p-4 rounded-lg ${
                  estadisticas.saldoPendiente > 0 
                    ? 'bg-warning-50' 
                    : 'bg-success-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className={`w-5 h-5 ${
                      estadisticas.saldoPendiente > 0 
                        ? 'text-warning-600' 
                        : 'text-success-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      estadisticas.saldoPendiente > 0 
                        ? 'text-warning-900' 
                        : 'text-success-900'
                    }`}>
                      Saldo Actual
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    estadisticas.saldoPendiente > 0 
                      ? 'text-warning-600' 
                      : 'text-success-600'
                  }`}>
                    ${estadisticas.saldoPendiente.toFixed(2)}
                  </p>
                </div>

                {/* Deuda histórica */}
                {cliente.deuda_historica > 0 && (
                  <div className="bg-danger-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-danger-600" />
                      <span className="text-sm font-medium text-danger-900">
                        Deuda Histórica
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-danger-600">
                      ${cliente.deuda_historica.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Último pedido */}
              {estadisticas.ultimoPedido && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Último pedido: {formatearFecha(estadisticas.ultimoPedido)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
          <Button
            variant="primary"
            onClick={() => onEditar(cliente)}
            className="flex-1"
          >
            Editar Cliente
          </Button>
          
          <Button
            variant="danger"
            onClick={() => onDesactivar(cliente)}
          >
            {cliente.activo ? 'Desactivar' : 'Reactivar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
