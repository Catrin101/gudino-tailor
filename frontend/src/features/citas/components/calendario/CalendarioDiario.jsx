import { BloqueCita } from './BloqueCita'
import { Clock } from 'lucide-react'

const HORAS = Array.from({ length: 11 }, (_, i) => i + 9)

export function CalendarioDiario({ citas, fechaActual, onCitaClick, onSlotClick }) {
  const esMismoDia = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const esHoy = esMismoDia(fechaActual, new Date())

  const citasDelDia = citas.filter(cita => {
    const fechaCita = new Date(cita.fecha_hora_inicio)
    return esMismoDia(fechaCita, fechaActual)
  })

  const citasEnHora = (hora) => {
    return citasDelDia.filter(cita => {
      const h = new Date(cita.fecha_hora_inicio).getHours()
      return h === hora
    })
  }

  const nombreDia = fechaActual.toLocaleDateString('es-MX', { weekday: 'long' })
  const fechaStr = fechaActual.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b border-gray-200 ${esHoy ? 'bg-blue-50' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${esHoy ? 'text-blue-600' : 'text-gray-500'}`} />
          <div>
            <p className={`text-sm font-medium capitalize ${esHoy ? 'text-blue-600' : 'text-gray-500'}`}>
              {nombreDia}
            </p>
            <p className={`text-lg font-bold ${esHoy ? 'text-blue-700' : 'text-gray-900'}`}>
              {fechaStr}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              citasDelDia.length > 0
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {citasDelDia.length} cita{citasDelDia.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Línea de tiempo */}
      <div className="max-h-[600px] overflow-y-auto">
        {HORAS.map((hora) => {
          const citasEnEstaHora = citasEnHora(hora)
          return (
            <div key={hora} className="flex border-b border-gray-100 last:border-b-0">
              {/* Etiqueta de hora */}
              <div className="w-20 p-3 bg-gray-50 border-r border-gray-200 flex items-start justify-end flex-shrink-0">
                <span className="text-sm font-semibold text-gray-600">
                  {`${String(hora).padStart(2, '0')}:00`}
                </span>
              </div>

              {/* Contenido */}
              <div className="flex-1 p-2 min-h-[70px]">
                {citasEnEstaHora.length > 0 ? (
                  <div className="space-y-2">
                    {citasEnEstaHora.map(cita => (
                      <BloqueCita
                        key={cita.id_cita}
                        cita={cita}
                        onClick={onCitaClick}
                      />
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => onSlotClick(fechaActual, hora)}
                    className="w-full h-full min-h-[60px] rounded-lg border-2 border-dashed border-gray-200 
                             hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center
                             opacity-0 hover:opacity-100"
                    aria-label={`Crear cita a las ${hora}:00`}
                  >
                    <span className="text-sm text-blue-500 font-medium">+ Nueva cita</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
