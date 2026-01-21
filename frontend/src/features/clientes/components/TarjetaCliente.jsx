import { User, Phone, Calendar, AlertCircle } from 'lucide-react'
import { Card } from '../../../shared/components/Card'

/**
 * Tarjeta individual de cliente
 * Muestra información resumida del cliente
 */
export function TarjetaCliente({ cliente, onClick }) {
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
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Phone className="w-4 h-4" />
            <span>{formatearTelefono(cliente.telefono)}</span>
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

        {/* Indicador de deuda histórica */}
        {cliente.deuda_historica > 0 && (
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
