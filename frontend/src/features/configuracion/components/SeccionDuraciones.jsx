import { Timer } from 'lucide-react'
import { RAZONES_CITA } from '../../../core/constants/citas'

const CAMPOS_DURACION = [
  { key: 'PRUEBA_PARCIAL', razon: 'PRUEBA_PARCIAL' },
  { key: 'ENTREGA_PEDIDO', razon: 'ENTREGA_PEDIDO' },
  { key: 'TOMA_MEDIDAS', razon: 'TOMA_MEDIDAS' },
  { key: 'DEVOLUCION_RENTA', razon: 'DEVOLUCION_RENTA' },
  { key: 'REMIENDO_ENTREGA', razon: 'REMIENDO_ENTREGA' },
  { key: 'CONSULTA', razon: 'CONSULTA' },
  { key: 'OTRO', razon: 'OTRO' }
]

export function SeccionDuraciones({ duraciones, onChange }) {
  const actualizar = (key, valor) => {
    onChange({ ...duraciones, [key]: valor })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Timer className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Duración por Tipo de Cita</h3>
      </div>

      <div className="space-y-4">
        {CAMPOS_DURACION.map(campo => {
          const razonInfo = RAZONES_CITA[campo.razon]
          return (
            <div key={campo.key} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  {razonInfo?.label || campo.razon}
                </label>
                <p className="text-xs text-gray-500">{razonInfo?.descripcion}</p>
              </div>
              <div className="relative w-full sm:w-32">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={duraciones[campo.key]}
                  onChange={(e) => actualizar(campo.key, Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  min
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
