import { useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { useNotification } from '../../../shared/context/NotificationContext'
import { ModalCondonarPenalizacion } from '../../citas/components/modales/ModalCondonarPenalizacion'
import { ETIQUETAS_TIPO_PENALIZACION } from '../../../core/constants/citas'

/**
 * Panel de penalizaciones pendientes en la sección de Pagos
 */
export function PanelPenalizaciones({ penalizaciones, loading, onCobrar, onCondonar }) {
  const [penalizacionSeleccionada, setPenalizacionSeleccionada] = useState(null)
  const [mostrarModalCondonar, setMostrarModalCondonar] = useState(false)
  const [filtroCliente, setFiltroCliente] = useState('')
  const notification = useNotification()

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleCobrar = async (penalizacion) => {
    try {
      await onCobrar(penalizacion.id_penalizacion, penalizacion.id_pedido, 'Cobro desde Panel de Pagos')
      notification.success(`Penalización de $${penalizacion.monto.toFixed(2)} cobrada correctamente`)
    } catch (err) {
      notification.error(err.message)
    }
  }

  const handleCondonar = async (motivo) => {
    try {
      await onCondonar(penalizacionSeleccionada.id_penalizacion, motivo)
      notification.success('Penalización condonada')
      setMostrarModalCondonar(false)
      setPenalizacionSeleccionada(null)
    } catch (err) {
      notification.error(err.message)
    }
  }

  const penalizacionesFiltradas = penalizaciones.filter(p => {
    if (!filtroCliente.trim()) return true
    const nombre = p.clientes?.nombre?.toLowerCase() || ''
    return nombre.includes(filtroCliente.toLowerCase())
  })

  const totalPendiente = penalizacionesFiltradas.reduce(
    (sum, p) => sum + parseFloat(p.monto), 0
  )

  return (
    <div>
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-danger-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-danger-600" />
            <div>
              <p className="text-sm text-danger-600 font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-danger-900">
                {penalizacionesFiltradas.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-warning-50">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-warning-600" />
            <div>
              <p className="text-sm text-warning-600 font-medium">Total por Cobrar</p>
              <p className="text-2xl font-bold text-warning-900">
                ${totalPendiente.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-sm text-gray-600 font-medium mb-2">Filtrar por cliente</p>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </Card>
      </div>

      {/* Tabla de penalizaciones */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Penalizaciones Pendientes</h2>
          <span className="text-sm text-gray-500">
            {penalizacionesFiltradas.length} registro{penalizacionesFiltradas.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Cargando penalizaciones...</p>
          </div>
        ) : penalizacionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-success-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              {filtroCliente
                ? 'No hay penalizaciones pendientes para este cliente'
                : 'No hay penalizaciones pendientes'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Pedido
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {penalizacionesFiltradas.map(penalizacion => (
                  <tr key={penalizacion.id_penalizacion} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {penalizacion.clientes?.nombre || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {penalizacion.clientes?.telefono || ''}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {ETIQUETAS_TIPO_PENALIZACION[penalizacion.tipo] || penalizacion.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-lg font-bold text-danger-700">
                        ${parseFloat(penalizacion.monto).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatearFecha(penalizacion.fecha_aplicacion)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {penalizacion.pedidos ? (
                        <span className="text-gray-900">
                          #{penalizacion.pedidos.id_pedido}
                        </span>
                      ) : (
                        <span className="text-gray-400">Sin vincular</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleCobrar(penalizacion)}
                          className="flex items-center gap-1"
                        >
                          <DollarSign className="w-3 h-3" />
                          Cobrar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPenalizacionSeleccionada(penalizacion)
                            setMostrarModalCondonar(true)
                          }}
                          className="flex items-center gap-1 text-gray-600"
                        >
                          <XCircle className="w-3 h-3" />
                          Condonar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de condonación */}
      {mostrarModalCondonar && penalizacionSeleccionada && (
        <ModalCondonarPenalizacion
          penalizacion={penalizacionSeleccionada}
          onConfirmar={handleCondonar}
          onCerrar={() => {
            setMostrarModalCondonar(false)
            setPenalizacionSeleccionada(null)
          }}
          loading={loading}
        />
      )}
    </div>
  )
}
