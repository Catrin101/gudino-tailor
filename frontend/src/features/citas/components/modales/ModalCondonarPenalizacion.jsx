import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'

export function ModalCondonarPenalizacion({ penalizacion, onConfirmar, onCerrar, loading }) {
  const [motivo, setMotivo] = useState('')

  const handleConfirmar = () => {
    if (motivo.trim()) {
      onConfirmar(motivo.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Condonar Penalización</h3>
            <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Monto */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-yellow-700">Monto a condonar</p>
            <p className="text-3xl font-bold text-yellow-800">
              ${penalizacion.monto.toFixed(2)} MXN
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Tipo: {penalizacion.tipo === 'Cancelacion_Tardia' ? 'Cancelación tardía' :
                     penalizacion.tipo === 'No_Show' ? 'No Show' : penalizacion.tipo}
            </p>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la condonación <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Escribe por qué se condona esta penalización..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            {!motivo.trim() && (
              <p className="text-xs text-red-500 mt-1">El motivo es obligatorio</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <Button variant="ghost" onClick={onCerrar} disabled={loading} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="warning"
            onClick={handleConfirmar}
            disabled={loading || !motivo.trim()}
            className="flex-1"
          >
            {loading ? 'Condonando...' : 'Condonar y Continuar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
