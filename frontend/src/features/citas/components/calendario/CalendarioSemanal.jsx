import { BloqueCita } from './BloqueCita'

const HORAS = Array.from({ length: 11 }, (_, i) => i + 9)

export function CalendarioSemanal({ citas, fechaActual, onCitaClick, onSlotClick }) {
  const obtenerLunes = (fecha) => {
    const d = new Date(fecha)
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    d.setHours(0, 0, 0, 0)
    return d
  }

  const lunes = obtenerLunes(fechaActual)
  const dias = Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(lunes)
    dia.setDate(lunes.getDate() + i)
    return dia
  })

  const esMismoDia = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const esHoy = (dia) => esMismoDia(dia, new Date())

  const citasPorDia = (dia) => {
    return citas.filter(cita => {
      const fechaCita = new Date(cita.fecha_hora_inicio)
      return esMismoDia(fechaCita, dia)
    })
  }

  const formatearDia = (dia) => {
    const nombre = dia.toLocaleDateString('es-MX', { weekday: 'short' })
    const numero = dia.getDate()
    return { nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1), numero }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
      {/* Header con días */}
      <div className="grid grid-cols-8 border-b border-gray-200" style={{ minWidth: '640px' }}>
        <div className="p-3 bg-gray-50 border-r border-gray-200" />
        {dias.map((dia, i) => {
          const { nombre, numero } = formatearDia(dia)
          return (
            <div
              key={i}
              className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
                esHoy(dia) ? 'bg-blue-50' : 'bg-gray-50'
              }`}
            >
              <p className={`text-xs font-medium ${esHoy(dia) ? 'text-blue-600' : 'text-gray-500'}`}>
                {nombre}
              </p>
              <p className={`text-lg font-bold ${
                esHoy(dia) ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {numero}
              </p>
            </div>
          )
        })}
      </div>

      {/* Cuerpo con horas */}
      <div className="grid grid-cols-8 max-h-[600px] overflow-y-auto" style={{ minWidth: '640px' }}>
        {HORAS.map((hora) => (
          <div key={hora} className="contents">
            {/* Etiqueta de hora */}
            <div className="p-2 border-r border-b border-gray-100 bg-gray-50 flex items-start justify-end">
              <span className="text-xs font-medium text-gray-500">
                {`${String(hora).padStart(2, '0')}:00`}
              </span>
            </div>

            {/* Celdas de cada día */}
            {dias.map((dia, i) => {
              const citasDelDia = citasPorDia(dia)
              const citasEnHora = citasDelDia.filter(cita => {
                const h = new Date(cita.fecha_hora_inicio).getHours()
                return h === hora
              })

              return (
                <div
                  key={i}
                  className="border-r border-b border-gray-100 last:border-r-0 min-h-[60px] p-1"
                >
                  {citasEnHora.map(cita => (
                    <BloqueCita
                      key={cita.id_cita}
                      cita={cita}
                      onClick={onCitaClick}
                    />
                  ))}
                  {citasEnHora.length === 0 && (
                    <button
                      onClick={() => onSlotClick(dia, hora)}
                      className="w-full h-full min-h-[52px] rounded hover:bg-blue-50 transition-colors opacity-0 hover:opacity-100"
                      aria-label={`Crear cita a las ${hora}:00`}
                    >
                      <span className="text-xs text-blue-500 font-medium">+ Nueva</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}
