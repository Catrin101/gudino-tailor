import { RAZONES_CITA } from '../../../../core/constants/citas'
import { Calendar, Clock, User, FileText, Package, CheckCircle } from 'lucide-react'

export function Paso4ConfirmarCita({ datos }) {
  const razonInfo = RAZONES_CITA[datos.razon]
  const fechaInicio = datos.fecha_hora_inicio ? new Date(datos.fecha_hora_inicio) : null
  const fechaFin = datos.fecha_hora_fin ? new Date(datos.fecha_hora_fin) : null

  return (
    <div className="p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Confirma los datos de la cita</h3>
      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Revisa todo antes de guardar</p>

      <div className="space-y-3 sm:space-y-4">
        {/* Cliente */}
        <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0 mt-1" />
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Cliente</p>
            <p className="text-base sm:text-lg font-bold text-gray-900">{datos.cliente?.nombre}</p>
            {datos.cliente?.telefono && (
              <p className="text-sm text-gray-600">{datos.cliente.telefono}</p>
            )}
          </div>
        </div>

        {/* Razón */}
        <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0 mt-1" />
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Razón</p>
            <p className="text-base sm:text-lg font-bold text-gray-900">{razonInfo?.label || datos.razon}</p>
            <p className="text-sm text-gray-600">~{razonInfo?.duracion || 30} minutos</p>
          </div>
        </div>

        {/* Fecha y hora */}
        {fechaInicio && (
          <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Fecha y hora</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                {fechaInicio.toLocaleDateString('es-MX', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {fechaInicio.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                {fechaFin && ` — ${fechaFin.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`}
              </div>
            </div>
          </div>
        )}

        {/* Pedido vinculado */}
        {datos.id_pedido && (
          <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Pedido vinculado</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">#{String(datos.id_pedido).slice(-4)}</p>
            </div>
          </div>
        )}

        {/* Notas */}
        {datos.notas_adicionales && (
          <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Notas</p>
              <p className="text-gray-700">{datos.notas_adicionales}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 sm:mt-6 bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
        <p className="text-sm sm:text-base text-green-800 font-medium">
          Todo listo para guardar la cita
        </p>
      </div>
    </div>
  )
}
