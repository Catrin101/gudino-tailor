import { useState, useEffect } from 'react'
import { Card } from '../shared/components/Card'
import { Button } from '../shared/components/Button'
import { useConfiguracionStore } from '../core/store/useConfiguracionStore'
import { SeccionHorario } from '../features/configuracion/components/SeccionHorario'
import { SeccionPenalizaciones } from '../features/configuracion/components/SeccionPenalizaciones'
import { SeccionDuraciones } from '../features/configuracion/components/SeccionDuraciones'
import { Settings, RotateCcw, Check } from 'lucide-react'

export function ConfiguracionPage() {
  const { configuracion, loading, cargar, guardar, restablecer } = useConfiguracionStore()
  const [horario, setHorario] = useState({ apertura: '09:00', cierre: '19:00', dias: [] })
  const [penalizaciones, setPenalizaciones] = useState({})
  const [duraciones, setDuraciones] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)
  const [restableciendo, setRestableciendo] = useState(false)

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    if (configuracion) {
      setHorario({
        apertura: configuracion.hora_apertura,
        cierre: configuracion.hora_cierre,
        dias: configuracion.dias_atencion
      })
      setPenalizaciones({
        MOVER_24_48: configuracion.penalizacion_mover_24_48,
        MOVER_MENOS_24: configuracion.penalizacion_mover_menos_24,
        CANCELAR_24_48: configuracion.penalizacion_cancelar_24_48,
        CANCELAR_MENOS_24: configuracion.penalizacion_cancelar_menos_24,
        NO_SHOW: configuracion.penalizacion_no_show
      })
      setDuraciones({
        PRUEBA_PARCIAL: configuracion.duracion_prueba_parcial,
        ENTREGA_PEDIDO: configuracion.duracion_entrega_pedido,
        TOMA_MEDIDAS: configuracion.duracion_toma_medidas,
        DEVOLUCION_RENTA: configuracion.duracion_devolucion_renta,
        REMIENDO_ENTREGA: configuracion.duracion_remiendo_entrega,
        CONSULTA: configuracion.duracion_consulta,
        OTRO: configuracion.duracion_otro
      })
    }
  }, [configuracion])

  const handleGuardar = async () => {
    setGuardando(true)
    setExito(false)
    try {
      await guardar({
        hora_apertura: horario.apertura,
        hora_cierre: horario.cierre,
        dias_atencion: horario.dias,
        penalizacion_mover_24_48: penalizaciones.MOVER_24_48,
        penalizacion_mover_menos_24: penalizaciones.MOVER_MENOS_24,
        penalizacion_cancelar_24_48: penalizaciones.CANCELAR_24_48,
        penalizacion_cancelar_menos_24: penalizaciones.CANCELAR_MENOS_24,
        penalizacion_no_show: penalizaciones.NO_SHOW,
        duracion_prueba_parcial: duraciones.PRUEBA_PARCIAL,
        duracion_entrega_pedido: duraciones.ENTREGA_PEDIDO,
        duracion_toma_medidas: duraciones.TOMA_MEDIDAS,
        duracion_devolucion_renta: duraciones.DEVOLUCION_RENTA,
        duracion_remiendo_entrega: duraciones.REMIENDO_ENTREGA,
        duracion_consulta: duraciones.CONSULTA,
        duracion_otro: duraciones.OTRO
      })
      setExito(true)
      setTimeout(() => setExito(false), 3000)
    } catch {
      // El error se maneja en el store
    } finally {
      setGuardando(false)
    }
  }

  const handleRestablecer = async () => {
    setRestableciendo(true)
    try {
      await restablecer()
      setExito(true)
      setTimeout(() => setExito(false), 3000)
    } catch {
      // El error se maneja en el store
    } finally {
      setRestableciendo(false)
    }
  }

  if (loading && !configuracion.id) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-2">Ajustes del sistema</p>
        </div>
        <Card className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 mt-4">Cargando configuración...</p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">Ajustes del sistema</p>
      </div>

      <div className="space-y-6">
        <Card>
          <SeccionHorario horario={horario} onChange={setHorario} />
        </Card>

        <Card>
          <SeccionPenalizaciones penalizaciones={penalizaciones} onChange={setPenalizaciones} />
        </Card>

        <Card>
          <SeccionDuraciones duraciones={duraciones} onChange={setDuraciones} />
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleRestablecer}
            disabled={restableciendo}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {restableciendo ? 'Restableciendo...' : 'Restablecer valores default'}
          </Button>

          <Button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex items-center gap-2"
          >
            {exito ? (
              <>
                <Check className="w-4 h-4" />
                Guardado
              </>
            ) : guardando ? (
              'Guardando...'
            ) : (
              <>
                <Settings className="w-4 h-4" />
                Guardar configuración
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
