import { Clock } from 'lucide-react'

const DIAS_SEMANA = [
  { id: 0, label: 'Dom' },
  { id: 1, label: 'Lun' },
  { id: 2, label: 'Mar' },
  { id: 3, label: 'Mié' },
  { id: 4, label: 'Jue' },
  { id: 5, label: 'Vie' },
  { id: 6, label: 'Sáb' }
]

export function SeccionHorario({ horario, onChange }) {
  const toggleDia = (diaId) => {
    const dias = horario.dias.includes(diaId)
      ? horario.dias.filter(d => d !== diaId)
      : [...horario.dias, diaId].sort()
    onChange({ ...horario, dias })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Horario de Atención</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hora de apertura
          </label>
          <input
            type="time"
            value={horario.apertura}
            onChange={(e) => onChange({ ...horario, apertura: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hora de cierre
          </label>
          <input
            type="time"
            value={horario.cierre}
            onChange={(e) => onChange({ ...horario, cierre: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Días de atención
        </label>
        <div className="flex flex-wrap gap-2">
          {DIAS_SEMANA.map(dia => (
            <button
              key={dia.id}
              type="button"
              onClick={() => toggleDia(dia.id)}
              className={`
                px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all
                ${horario.dias.includes(dia.id)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-500'}
              `}
            >
              {dia.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
