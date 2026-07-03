import { useEffect } from 'react'
import { User, Phone, Calendar, AlertCircle } from 'lucide-react'
import { Card } from '../../../shared/components/Card'
import { usePenalizaciones } from '../../citas/hooks/usePenalizaciones'

/**
 * Tarjeta individual de cliente
 * Muestra información resumida del cliente
 */
export function TarjetaCliente({ cliente, onClick }) {
  const { comportamiento, cargarComportamiento } = usePenalizaciones()

  useEffect(() => {
    if (cliente?.id_cliente) {
      cargarComportamiento(cliente.id_cliente)
    }
  }, [cliente?.id_cliente])

  const formatearTelefono = (telefono) => {
    if (!telefono || telefono.length !== 10) return telefono
    return `(${telefono.slice(0, 3)}) ${telefono.slice(3, 6)}-${telefono.slice(6)}`
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin registro'
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(cliente)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Nombre */}
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              {cliente.nombre}
            </h3>
          </div>

          {/* Teléfono */}
          <div className={`flex items-center gap-2 mb-2 ${cliente.telefono ? 'text-gray-600' : 'text-gray-400'}`}>
            <Phone className="w-4 h-4" />
            <span>{cliente.telefono ? formatearTelefono(cliente.telefono) : <em>Sin teléfono</em>}</span>
          </div>

          {/* Fecha de registro */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Registro: {formatearFecha(cliente.fecha_registro)}</span>
          </div>

          {/* Notas (si existen) */}
          {cliente.notas_generales && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600 line-clamp-2">
              {cliente.notas_generales}
            </div>
          )}
        </div>

        {/* Indicador de comportamiento */}
        {comportamiento && comportamiento.detalles.totalPenalizaciones > 0 && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            comportamiento.color === 'success' ? 'bg-success-50 text-success-700' :
            comportamiento.color === 'green' ? 'bg-green-50 text-green-700' :
            comportamiento.color === 'warning' ? 'bg-warning-50 text-warning-700' :
            'bg-danger-50 text-danger-700'
          }`}>
            <AlertCircle className="w-4 h-4" />
            <span>{comportamiento.label}</span>
            {comportamiento.detalles.pendientes > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-white rounded-full">
                ${comportamiento.detalles.totalPendiente.toFixed(0)}
              </span>
            )}
          </div>
        )}

        {/* Indicador de deuda histórica (solo si no hay comportamiento) */}
        {cliente.deuda_historica > 0 && !comportamiento?.detalles?.totalPenalizaciones && (
          <div className="flex items-center gap-1 px-3 py-1 bg-warning-50 text-warning-700 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">
              ${cliente.deuda_historica.toFixed(2)}
            </span>
          </div>
        )}

        {/* Indicador de inactivo */}
        {!cliente.activo && (
          <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Inactivo
          </div>
        )}
      </div>
    </Card>
  )
}
