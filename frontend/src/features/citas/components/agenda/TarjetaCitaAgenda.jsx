import { COLORES_ESTADO_CITA, RAZONES_CITA } from '../../../../core/constants/citas'
import { Clock, User, Calendar } from 'lucide-react'

export function TarjetaCitaAgenda({ cita, onClick }) {
  const inicio = new Date(cita.fecha_hora_inicio)
  const fin = new Date(cita.fecha_hora_fin)
  const colores = COLORES_ESTADO_CITA[cita.estado] || COLORES_ESTADO_CITA['Agendada']
  const razon = RAZONES_CITA[cita.razon]

  const horaInicio = inicio.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const horaFin = fin.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  return (
    <button
      onClick={() => onClick(cita)}
      className={`
        w-full text-left p-3 rounded-lg border-l-4 transition-all
        hover:shadow-md cursor-pointer bg-white border border-gray-100
      `}
      style={{ borderLeftColor: colores.point.replace('bg-', '#').replace('gray-400', '#9CA3AF').replace('blue-500', '#3B82F6').replace('green-500', '#10B981').replace('red-500', '#EF4444') }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-sm font-semibold text-gray-900">
          {horaInicio} - {horaFin}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <User className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-sm font-medium text-gray-800 truncate">
          {cita.clientes?.nombre || 'Sin cliente'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-600 truncate">
          {razon?.label || cita.razon}
        </span>
        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${colores.bg} ${colores.text}`}>
          {cita.estado}
        </span>
      </div>
    </button>
  )
}
