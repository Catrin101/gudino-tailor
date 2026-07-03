import { useState, useEffect } from 'react'
import { useCitas } from '../../hooks/useCitas'
import { COLORES_ESTADO_CITA, RAZONES_CITA, ESTADOS_COBRO } from '../../../../core/constants/citas'
import { Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export function HistorialCitasCliente({ idCliente }) {
  const { obtenerHistorialCliente, loading } = useCitas()
  const [citas, setCitas] = useState([])

  useEffect(() => {
    if (idCliente) cargarHistorial()
  }, [idCliente])

  const cargarHistorial = async () => {
    const datos = await obtenerHistorialCliente(idCliente)
    setCitas(datos || [])
  }

  const completadas = citas.filter(c => c.estado === 'Completada').length
  const canceladas = citas.filter(c => c.estado === 'Cancelada').length
  const noShows = citas.filter(c => c.estado === 'No Show').length
  const penalizaciones = citas.reduce((acc, c) => {
    return acc + (c.penalizaciones_cita?.length || 0)
  }, 0)

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (citas.length === 0) {
    return (
      <div className="py-8 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 font-medium">Sin historial de citas</p>
      </div>
    )
  }

  return (
    <div>
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-green-700">{completadas}</p>
          <p className="text-xs text-green-600">Completadas</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <XCircle className="w-5 h-5 text-gray-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-700">{canceladas}</p>
          <p className="text-xs text-gray-600">Canceladas</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg text-center">
          <AlertCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-red-700">{noShows}</p>
          <p className="text-xs text-red-600">No Shows</p>
        </div>
      </div>

      {penalizaciones > 0 && (
        <p className="text-sm text-gray-600 mb-4">
          {penalizaciones} penalización{penalizaciones > 1 ? 'es' : ''} registrada{penalizaciones > 1 ? 's' : ''}
        </p>
      )}

      {/* Lista */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {citas.map(cita => {
          const colores = COLORES_ESTADO_CITA[cita.estado] || {}
          const razon = RAZONES_CITA[cita.razon]
          const fecha = new Date(cita.fecha_hora_inicio)

          return (
            <div key={cita.id_cita} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {razon?.label || cita.razon}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colores.bg} ${colores.text}`}>
                  {cita.estado}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                {' — '}
                {fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {cita.penalizaciones_cita?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {cita.penalizaciones_cita.map(p => (
                    <div key={p.id_penalizacion} className="flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${
                        p.estado_cobro === ESTADOS_COBRO.PENDIENTE ? 'bg-red-500' :
                        p.estado_cobro === ESTADOS_COBRO.CONDONADA ? 'bg-gray-400' :
                        'bg-green-500'
                      }`} />
                      <span className="text-gray-600">
                        ${p.monto.toFixed(2)} — {p.estado_cobro}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
