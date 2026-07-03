import { useState } from 'react'
import { useCalendario } from '../components/calendario/useCalendario'
import { SelectorFecha } from '../components/calendario/SelectorFecha'
import { CalendarioSemanal } from '../components/calendario/CalendarioSemanal'
import { CalendarioDiario } from '../components/calendario/CalendarioDiario'
import { ModalDetalleCita } from '../components/detalle/ModalDetalleCita'
import { WizardCita } from '../components/wizard/WizardCita'
import { Button } from '../../../shared/components/Button'
import { Plus } from 'lucide-react'

export function CalendarioPage() {
  const {
    citas,
    fechaActual,
    vista,
    loading,
    setFechaActual,
    irHoy,
    irAnterior,
    irSiguiente,
    toggleVista,
    cargarCitas
  } = useCalendario()

  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [mostrarWizard, setMostrarWizard] = useState(false)
  const [fechaSlot, setFechaSlot] = useState(null)
  const [horaSlot, setHoraSlot] = useState(null)

  const handleCitaClick = (cita) => {
    setCitaSeleccionada(cita)
  }

  const handleSlotClick = (dia, hora) => {
    setFechaSlot(dia)
    setHoraSlot(hora)
    setMostrarWizard(true)
  }

  const handleNuevaCita = () => {
    setFechaSlot(null)
    setHoraSlot(null)
    setMostrarWizard(true)
  }

  const handleWizardClose = () => {
    setMostrarWizard(false)
    setFechaSlot(null)
    setHoraSlot(null)
    cargarCitas()
  }

  const handleCitaGuardada = () => {
    setMostrarWizard(false)
    setFechaSlot(null)
    setHoraSlot(null)
    cargarCitas()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-600 mt-1">Agenda del taller</p>
        </div>
        <Button variant="primary" onClick={handleNuevaCita} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva Cita
        </Button>
      </div>

      <SelectorFecha
        fechaActual={fechaActual}
        vista={vista}
        onAnterior={irAnterior}
        onSiguiente={irSiguiente}
        onHoy={irHoy}
        onToggleVista={toggleVista}
      />

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando citas...</p>
        </div>
      ) : vista === 'semanal' ? (
        <CalendarioSemanal
          citas={citas}
          fechaActual={fechaActual}
          onCitaClick={handleCitaClick}
          onSlotClick={handleSlotClick}
        />
      ) : (
        <CalendarioDiario
          citas={citas}
          fechaActual={fechaActual}
          onCitaClick={handleCitaClick}
          onSlotClick={handleSlotClick}
        />
      )}

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

      {mostrarWizard && (
        <WizardCita
          fechaInicial={fechaSlot}
          horaInicial={horaSlot}
          onCerrar={handleWizardClose}
          onGuardada={handleCitaGuardada}
        />
      )}
    </div>
  )
}
