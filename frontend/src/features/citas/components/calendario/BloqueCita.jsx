import { COLORES_ESTADO_CITA, RAZONES_CITA } from '../../../../core/constants/citas'

export function BloqueCita({ cita, onClick }) {
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
        w-full text-left p-2 rounded-lg border-l-4 transition-all
        hover:shadow-md cursor-pointer
        ${colores.bg} border-l-${colores.point.replace('bg-', '')}
      `}
      style={{ borderLeftColor: colores.point.replace('bg-', '#').replace('gray-400', '#9CA3AF').replace('blue-500', '#3B82F6').replace('green-500', '#10B981').replace('red-500', '#EF4444') }}
    >
      <p className="text-xs font-semibold text-gray-900 truncate">
        {horaInicio} - {horaFin}
      </p>
      <p className="text-sm font-medium text-gray-800 truncate mt-0.5">
        {cita.clientes?.nombre || 'Sin cliente'}
      </p>
      <p className="text-xs text-gray-600 truncate">
        {razon?.label || cita.razon}
      </p>
    </button>
  )
}
