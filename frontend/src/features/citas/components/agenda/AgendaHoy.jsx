import { useState, useEffect } from 'react'
import { useCitas } from '../../hooks/useCitas'
import { TarjetaCitaAgenda } from './TarjetaCitaAgenda'
import { ModalDetalleCita } from '../detalle/ModalDetalleCita'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function AgendaHoy() {
  const { obtenerCitasPorDia, loading } = useCitas()
  const [citas, setCitas] = useState([])
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const navigate = useNavigate()

  const hoy = new Date().toISOString().split('T')[0]

  useEffect(() => {
    cargarCitas()
  }, [])

  const cargarCitas = async () => {
    const datos = await obtenerCitasPorDia(hoy)
    setCitas(datos || [])
  }

  const handleCitaClick = (cita) => {
    setCitaSeleccionada(cita)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-fit">
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-gray-900">Agenda de Hoy</h3>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
            {citas.length} cita{citas.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {new Date().toLocaleDateString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </p>
      </div>

      <div className="p-3 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Cargando...</p>
          </div>
        ) : citas.length === 0 ? (
          <div className="py-8 text-center">
            <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">Sin citas hoy</p>
            <p className="text-xs text-gray-400 mt-1">Disponible todo el día</p>
          </div>
        ) : (
          <div className="space-y-2">
            {citas.map(cita => (
              <TarjetaCitaAgenda
                key={cita.id_cita}
                cita={cita}
                onClick={handleCitaClick}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={() => navigate('/calendario')}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium
                   text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        >
          Ver Calendario Completo
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {citaSeleccionada && (
        <ModalDetalleCita
          cita={citaSeleccionada}
          onCerrar={() => setCitaSeleccionada(null)}
          onActualizar={() => {
            setCitaSeleccionada(null)
            cargarCitas()
          }}
        />
      )}
    </div>
  )
}
