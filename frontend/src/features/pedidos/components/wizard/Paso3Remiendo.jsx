import { Scissors } from 'lucide-react'

/**
 * Paso 3: Descripción del remiendo
 */
export function Paso3Remiendo({ descripcion, onActualizar }) {
  const ejemplos = [
    'Subir bastilla de pantalón',
    'Cerrar agujero en saco',
    'Cambiar cierre de pantalón',
    'Ajustar cintura',
    'Reparar costura lateral',
    'Colocar parches en codos'
  ]

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Instrucciones del Remiendo</h2>
      <p className="text-gray-600 mb-6">
        Describe detalladamente el trabajo a realizar
      </p>

      {/* Campo de texto grande */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción del Trabajo
          <span className="text-danger-500 ml-1">*</span>
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => onActualizar(e.target.value)}
          placeholder="Ej: Subir bastilla de pantalón 3cm, cerrar agujero en codo derecho..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-gray-500">
            Sé lo más específico posible para evitar confusiones
          </p>
          <p className="text-sm text-gray-400">
            {descripcion.length} caracteres
          </p>
        </div>
      </div>

      {/* Ejemplos de remiendos comunes */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Scissors className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Ejemplos Comunes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ejemplos.map((ejemplo, idx) => (
            <button
              key={idx}
              onClick={() => onActualizar(ejemplo)}
              className="text-left p-3 bg-white border border-gray-200 rounded-lg
                       hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <p className="text-sm text-gray-700">{ejemplo}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
