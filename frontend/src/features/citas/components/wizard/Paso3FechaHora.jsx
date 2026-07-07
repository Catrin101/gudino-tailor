import { useState, useEffect } from 'react'
import { RAZONES_CITA } from '../../../../core/constants/citas'
import { useConfiguracionStore } from '../../../../core/store/useConfiguracionStore'
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react'

export function Paso3FechaHora({ fechaSeleccionada, horaSeleccionada, duracion, razon, onActualizar }) {
  const [fecha, setFecha] = useState(fechaSeleccionada || '')
  const [hora, setHora] = useState(horaSeleccionada || '')
  const [error, setError] = useState('')

  const getHorario = useConfiguracionStore(s => s.getHorario)
  const getDuraciones = useConfiguracionStore(s => s.getDuraciones)
  const getHoraCierre = useConfiguracionStore(s => s.getHoraCierre)
  const getDiasAtencion = useConfiguracionStore(s => s.getDiasAtencion)

  const horario = getHorario()
  const duraciones = getDuraciones()
  const duracionMin = duracion || duraciones[razon] || 30

  // Generar horas disponibles según horario del taller
  const horasDisponibles = []
  const [hApertura] = horario.apertura.split(':').map(Number)
  const [hCierre] = horario.cierre.split(':').map(Number)
  for (let h = hApertura; h < hCierre; h++) {
    horasDisponibles.push(`${String(h).padStart(2, '0')}:00`)
    if (h + 1 < hCierre) {
      horasDisponibles.push(`${String(h).padStart(2, '0')}:30`)
    }
  }

  useEffect(() => {
    if (fecha && hora) {
      const [h, m] = hora.split(':').map(Number)
      const inicio = new Date(fecha)
      inicio.setHours(h, m, 0, 0)
      const fin = new Date(inicio.getTime() + duracionMin * 60 * 1000)

      // Validar día de atención
      const diaSemana = inicio.getDay()
      if (!getDiasAtencion().includes(diaSemana)) {
        const nombresDias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
        setError(`El taller no atiende los ${nombresDias[diaSemana]}s`)
        return
      }

      // Validar horario del taller
      const horaCierreNum = getHoraCierre()
      const finHoras = fin.getHours() + fin.getMinutes() / 60
      if (finHoras > horaCierreNum) {
        const cierre = horario.cierre
        setError(`La cita excede el horario de atención (hasta ${cierre})`)
        return
      }

      // Validar anticipación mínima 2h
      const ahora = new Date()
      const dosHoras = new Date(ahora.getTime() + 2 * 60 * 60 * 1000)
      if (inicio < dosHoras) {
        setError('La cita debe ser al menos 2 horas en el futuro')
        return
      }

      setError('')
      onActualizar({
        fecha_hora_inicio: inicio.toISOString(),
        fecha_hora_fin: fin.toISOString()
      })
    }
  }, [fecha, hora, duracionMin])

  const hoy = new Date().toISOString().split('T')[0]

  return (
    <div className="p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">¿Cuándo será la cita?</h3>
      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Selecciona fecha y hora disponible</p>

      {/* Duración estimada */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-center gap-3">
        <Clock className="w-5 h-5 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-blue-800">
            Duración estimada: {duracionMin} minutos
          </p>
          <p className="text-xs text-blue-600">
            Razón: {razonInfo?.label || razon}
          </p>
        </div>
      </div>

      {/* Selector de fecha */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4" />
          Fecha
        </label>
        <input
          type="date"
          value={fecha}
          min={hoy}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Selector de hora */}
      <div className="mb-4 sm:mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4" />
          Hora
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {horasDisponibles.map(h => (
            <button
              key={h}
              onClick={() => setHora(h)}
              className={`
                py-2.5 sm:py-3 rounded-lg border-2 font-medium transition-all text-xs sm:text-sm
                ${hora === h
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'}
              `}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen */}
      {fecha && hora && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">Horario disponible</p>
            <p className="text-sm text-green-700">
              {new Date(fecha + 'T' + hora).toLocaleDateString('es-MX', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })} a las {hora}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Horario no disponible</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
