import { DollarSign } from 'lucide-react'

const CAMPOS_PENALIZACION = [
  { key: 'MOVER_24_48', label: 'Mover cita (24-48h antes)', description: 'Se aplica la 2da vez en el mes' },
  { key: 'MOVER_MENOS_24', label: 'Mover cita (<24h antes)', description: 'Siempre se aplica' },
  { key: 'CANCELAR_24_48', label: 'Cancelar cita (24-48h antes)', description: 'Cancelación tardía' },
  { key: 'CANCELAR_MENOS_24', label: 'Cancelar cita (<24h antes)', description: 'Cancelación de último momento' },
  { key: 'NO_SHOW', label: 'No Show', description: 'Cliente no se presenta' }
]

export function SeccionPenalizaciones({ penalizaciones, onChange }) {
  const actualizar = (key, valor) => {
    onChange({ ...penalizaciones, [key]: valor })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <DollarSign className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Montos de Penalización</h3>
      </div>

      <div className="space-y-4">
        {CAMPOS_PENALIZACION.map(campo => (
          <div key={campo.key} className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                {campo.label}
              </label>
              <p className="text-xs text-gray-500">{campo.description}</p>
            </div>
            <div className="relative w-full sm:w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="5"
                value={penalizaciones[campo.key]}
                onChange={(e) => actualizar(campo.key, Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
