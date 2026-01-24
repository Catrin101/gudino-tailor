import { DollarSign, CreditCard, Banknote, Smartphone } from 'lucide-react'
import { Input } from '../../../../shared/components/Input'

/**
 * Paso 5: Cotización y pago inicial
 */
export function Paso5Pago({ costoTotal, anticipo, metodoPago, onActualizar }) {
  const metodosPago = [
    { id: 'Efectivo', nombre: 'Efectivo', icon: Banknote },
    { id: 'Tarjeta', nombre: 'Tarjeta', icon: CreditCard },
    { id: 'Transferencia', nombre: 'Transferencia', icon: Smartphone }
  ]

  const calcularSaldo = () => {
    const total = parseFloat(costoTotal) || 0
    const abono = parseFloat(anticipo) || 0
    return Math.max(0, total - abono)
  }

  const calcularPorcentaje = () => {
    const total = parseFloat(costoTotal) || 0
    const abono = parseFloat(anticipo) || 0
    if (total === 0) return 0
    return ((abono / total) * 100).toFixed(0)
  }

  const saldo = calcularSaldo()
  const porcentaje = calcularPorcentaje()

  const errores = {
    costoTotal: costoTotal && parseFloat(costoTotal) <= 0 ? 'Debe ser mayor a 0' : null,
    anticipo: anticipo && parseFloat(anticipo) <= 0 ? 'Debe ser mayor a 0' : 
              anticipo && parseFloat(anticipo) > parseFloat(costoTotal) ? 'No puede ser mayor al total' : null
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Cotización y Pago</h2>
<p className="text-gray-600 mb-6">
Define el precio y registra el anticipo inicial
</p>
<div className="space-y-6">
    {/* Costo total */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Costo Total del Pedido
        <span className="text-danger-500 ml-1">*</span>
      </label>
      <div className="relative">
        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="number"
          step="0.01"
          min="0"
          value={costoTotal}
          onChange={(e) => onActualizar({ costo_total: e.target.value })}
          placeholder="0.00"
          className={`
            w-full pl-12 pr-4 py-3 border rounded-lg text-lg
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${errores.costoTotal ? 'border-danger-500' : 'border-gray-300'}
          `}
        />
      </div>
      {errores.costoTotal && (
        <p className="mt-1 text-sm text-danger-600">{errores.costoTotal}</p>
      )}
    </div>

    {/* Anticipo */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Anticipo Recibido
        <span className="text-danger-500 ml-1">*</span>
      </label>
      <div className="relative">
        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="number"
          step="0.01"
          min="0"
          max={costoTotal}
          value={anticipo}
          onChange={(e) => onActualizar({ anticipo: e.target.value })}
          placeholder="0.00"
          className={`
            w-full pl-12 pr-4 py-3 border rounded-lg text-lg
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${errores.anticipo ? 'border-danger-500' : 'border-gray-300'}
          `}
        />
      </div>
      {errores.anticipo && (
        <p className="mt-1 text-sm text-danger-600">{errores.anticipo}</p>
      )}
      <p className="mt-1 text-sm text-gray-500">
        Mínimo requerido para iniciar el trabajo
      </p>
    </div>

    {/* Método de pago */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Método de Pago
      </label>
      <div className="grid grid-cols-3 gap-4">
        {metodosPago.map(metodo => {
          const Icon = metodo.icon
          return (
            <button
              key={metodo.id}
              onClick={() => onActualizar({ metodo_pago: metodo.id })}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${metodoPago === metodo.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
                }
              `}
            >
              <Icon className={`w-8 h-8 mx-auto mb-2 ${
                metodoPago === metodo.id ? 'text-primary-600' : 'text-gray-400'
              }`} />
              <p className={`text-sm font-medium ${
                metodoPago === metodo.id ? 'text-primary-900' : 'text-gray-700'
              }`}>
                {metodo.nombre}
              </p>
            </button>
          )
        })}
      </div>
    </div>

    {/* Resumen */}
    {costoTotal && anticipo && (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Resumen del Pago</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Costo Total:</span>
            <span className="font-semibold text-gray-900">
              ${parseFloat(costoTotal).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Anticipo:</span>
            <span className="font-semibold text-success-600">
              -${parseFloat(anticipo).toFixed(2)}
            </span>
          </div>

          <div className="border-t border-gray-300 pt-3">
            <div className="flex justify-between text-xl">
              <span className="font-semibold text-gray-900">Saldo Pendiente:</span>
              <span className={`font-bold ${
                saldo > 0 ? 'text-warning-600' : 'text-success-600'
              }`}>
                ${saldo.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Pagado: {porcentaje}%</span>
              <span>Pendiente: {100 - porcentaje}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-success-500 h-3 rounded-full transition-all"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
        </div>

        {/* Alerta si el anticipo es muy bajo */}
        {porcentaje < 30 && (
          <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-sm text-warning-800">
              ⚠️ El anticipo es menor al 30%. Se recomienda un anticipo del 50% como mínimo.
            </p>
          </div>
        )}
      </div>
    )}
  </div>
</div>
)
}
