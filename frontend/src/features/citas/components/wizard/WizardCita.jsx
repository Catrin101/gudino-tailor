import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { useCitas } from '../../hooks/useCitas'
import { Paso1ClienteCita } from './Paso1ClienteCita'
import { Paso2RazonCita } from './Paso2RazonCita'
import { Paso3FechaHora } from './Paso3FechaHora'
import { Paso4ConfirmarCita } from './Paso4ConfirmarCita'

export function WizardCita({ fechaInicial, horaInicial, onCerrar, onGuardada }) {
  const { crearCita, loading } = useCitas()
  const [pasoActual, setPasoActual] = useState(1)
  const [datos, setDatos] = useState({
    cliente: null,
    razon: null,
    notas_adicionales: '',
    id_pedido: null,
    fecha_hora_inicio: null,
    fecha_hora_fin: null
  })

  const pasos = [
    { numero: 1, titulo: 'Cliente', descripcion: '¿Con quién?' },
    { numero: 2, titulo: 'Razón', descripcion: '¿Para qué?' },
    { numero: 3, titulo: 'Fecha', descripcion: '¿Cuándo?' },
    { numero: 4, titulo: 'Confirmar', descripcion: 'Revisar y guardar' }
  ]

  const actualizarDatos = (nuevos) => {
    setDatos(prev => ({ ...prev, ...nuevos }))
  }

  const validarPaso = () => {
    switch (pasoActual) {
      case 1: return datos.cliente !== null
      case 2: return datos.razon !== null
      case 3: return datos.fecha_hora_inicio !== null && datos.fecha_hora_fin !== null
      case 4: return true
      default: return true
    }
  }

  const siguientePaso = () => {
    if (validarPaso() && pasoActual < 4) {
      setPasoActual(p => p + 1)
    }
  }

  const pasoAnterior = () => {
    if (pasoActual > 1) setPasoActual(p => p - 1)
  }

  const handleGuardar = async () => {
    try {
      await crearCita({
        id_cliente: datos.cliente.id_cliente,
        id_pedido: datos.id_pedido || null,
        razon: datos.razon,
        notas_adicionales: datos.notas_adicionales || null,
        fecha_hora_inicio: datos.fecha_hora_inicio,
        fecha_hora_fin: datos.fecha_hora_fin
      })
      onGuardada()
    } catch {
      // El error ya se maneja en useCitas
    }
  }

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <Paso1ClienteCita
            clienteSeleccionado={datos.cliente}
            onSeleccionar={(cliente) => actualizarDatos({ cliente })}
          />
        )
      case 2:
        return (
          <Paso2RazonCita
            razonSeleccionada={datos.razon}
            notas={datos.notas_adicionales}
            pedidoVinculado={datos.id_pedido}
            clienteId={datos.cliente?.id_cliente}
            onActualizar={actualizarDatos}
          />
        )
      case 3:
        return (
          <Paso3FechaHora
            fechaSeleccionada={fechaInicial}
            horaSeleccionada={horaInicial}
            razon={datos.razon}
            onActualizar={actualizarDatos}
          />
        )
      case 4:
        return <Paso4ConfirmarCita datos={datos} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Nueva Cita</h2>
          <button
            onClick={onCerrar}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Indicador de progreso */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {pasos.map((paso, index) => (
              <div key={paso.numero} className="flex items-center flex-1">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      font-bold text-sm transition-colors
                      ${pasoActual === paso.numero
                        ? 'bg-primary-600 text-white'
                        : pasoActual > paso.numero
                          ? 'bg-success-500 text-white'
                          : 'bg-gray-200 text-gray-500'}
                    `}
                  >
                    {pasoActual > paso.numero ? '✓' : paso.numero}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-medium text-gray-900">{paso.titulo}</p>
                  </div>
                </div>
                {index < pasos.length - 1 && (
                  <div
                    className={`
                      flex-1 h-1 mx-3 transition-colors
                      ${pasoActual > paso.numero ? 'bg-success-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">
          {renderPaso()}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl gap-3">
          <Button
            variant="ghost"
            onClick={pasoActual === 1 ? onCerrar : pasoAnterior}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <ChevronLeft className="w-5 h-5" />
            {pasoActual === 1 ? 'Cancelar' : 'Anterior'}
          </Button>

          {pasoActual < 4 ? (
            <Button
              variant="primary"
              onClick={siguientePaso}
              disabled={!validarPaso()}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              Siguiente
              <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleGuardar}
              disabled={loading}
              className="w-full sm:w-auto sm:px-8"
            >
              {loading ? 'Guardando...' : '✓ Guardar Cita'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
