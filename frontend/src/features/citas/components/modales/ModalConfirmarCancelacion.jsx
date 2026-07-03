import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'

export function ModalConfirmarCancelacion({ cita, penalizacion, onConfirmar, onCondonar, onCerrar, loading }) {
  const [canceladaPor, setCanceladaPor] = useState('Cliente')
  const fechaCita = new Date(cita.fecha_hora_inicio)
  const horasAntes = (fechaCita - new Date()) / (1000 * 60 * 60)
  const tienePenalizacion = penalizacion && penalizacion.monto > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Cancelar Cita</h3>
            <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Info de la cita */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">Cita de</p>
            <p className="font-bold text-gray-900">{cita.clientes?.nombre}</p>
            <p className="text-sm text-gray-600">
              {fechaCita.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' a las '}
              {fechaCita.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* ¿Quién cancela? */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Quién cancela?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCanceladaPor('Cliente')}
                className={`py-3 rounded-lg border-2 font-medium transition-all ${
                  canceladaPor === 'Cliente'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Cliente
              </button>
              <button
                onClick={() => setCanceladaPor('Taller')}
                className={`py-3 rounded-lg border-2 font-medium transition-all ${
                  canceladaPor === 'Taller'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Taller
              </button>
            </div>
          </div>

          {/* Penalización */}
          {tienePenalizacion ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800 text-lg">
                    Penalización: ${penalizacion.monto.toFixed(2)} MXN
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {horasAntes < 24
                      ? 'Cancelación de último momento (< 24h)'
                      : 'Cancelación tardía (24-48h)'}
                  </p>
                </div>
              </div>
            </div>
          ) : canceladaPor === 'Taller' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 font-medium">
                Cancelación del taller — Sin penalización
              </p>
            </div>
          ) : horasAntes > 48 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 font-medium">
                Sin penalización — Más de 48 horas de anticipación
              </p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <Button variant="ghost" onClick={onCerrar} disabled={loading} className="flex-1">
            Volver
          </Button>
          {tienePenalizacion && penalizacion.monto > 0 && (
            <Button
              variant="outline"
              onClick={onCondonar}
              disabled={loading}
              className="flex-1"
            >
              Condonar
            </Button>
          )}
          <Button
            variant="danger"
            onClick={() => onConfirmar(canceladaPor)}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Cancelando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
