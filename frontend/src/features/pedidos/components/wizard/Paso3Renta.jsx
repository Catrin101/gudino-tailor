import { Calendar, AlertCircle } from 'lucide-react'
import { Input } from '../../../../shared/components/Input'

/**
 * Paso 3: Fechas de renta
 */
export function Paso3Renta({ fechaEvento, fechaDevolucion, onActualizar }) {
  const calcularDiasRenta = () => {
    if (!fechaEvento || !fechaDevolucion) return 0
    
    const inicio = new Date(fechaEvento)
    const fin = new Date(fechaDevolucion)
    const diferencia = fin - inicio
    
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
  }

  const diasRenta = calcularDiasRenta()
  const hoy = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Fechas de Renta</h2>
      <p className="text-gray-600 mb-6">
        Especifica cuándo será el evento y cuándo se devolverá la prenda
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Fecha del evento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha del Evento
            <span className="text-danger-500 ml-1">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={fechaEvento}
              onChange={(e) => onActualizar({ fecha_evento: e.target.value })}
              min={hoy}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-lg
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Día en que el cliente usará la prenda
          </p>
        </div>

        {/* Fecha de devolución */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Devolución
            <span className="text-danger-500 ml-1">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={fechaDevolucion}
              onChange={(e) => onActualizar({ fecha_devolucion: e.target.value })}
              min={fechaEvento || hoy}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-lg
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Fecha máxima para devolver la prenda
          </p>
        </div>
      </div>

      {/* Información calculada */}
      {diasRenta > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Duración de la renta
              </p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-blue-600">
                  {diasRenta}
                </span>
                <span className="text-blue-800">
                  {diasRenta === 1 ? 'día' : 'días'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advertencia si las fechas están muy cerca */}
      {fechaEvento && fechaDevolucion && diasRenta < 3 && (
        <div className="mt-4 bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-warning-800">
              <p className="font-medium mb-1">⚠️ Fechas muy próximas</p>
              <p>
                El evento es en menos de 3 días. Asegúrate de que haya tiempo 
                suficiente para preparar y ajustar la prenda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700 mb-2">
          <strong>Nota importante:</strong>
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Se requiere un depósito al momento de la renta</li>
          <li>• Los ajustes básicos están incluidos</li>
          <li>• Aplican cargos adicionales por retraso en la devolución</li>
        </ul>
      </div>
    </div>
  )
}
