import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { DollarSign, CreditCard, Banknote, Smartphone, AlertCircle } from 'lucide-react'
import { METODOS_PAGO, CONCEPTOS_PAGO } from '../../../core/constants/estados'

/**
 * Formulario para registrar pagos
 */
export function FormularioPago({ 
  pedido, 
  onGuardar, 
  onCancelar, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    monto: '',
    concepto: 'Abono',
    metodo: 'Efectivo',
    notas: ''
  })

  const [errores, setErrores] = useState({})
  const [advertenciaSobrepago, setAdvertenciaSobrepago] = useState(null)

  const metodosPago = [
    { id: METODOS_PAGO.EFECTIVO, nombre: 'Efectivo', icon: Banknote },
    { id: METODOS_PAGO.TARJETA, nombre: 'Tarjeta', icon: CreditCard },
    { id: METODOS_PAGO.TRANSFERENCIA, nombre: 'Transferencia', icon: Smartphone }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar error
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: null }))
    }

    // Detectar sobrepago
    if (name === 'monto') {
      const monto = parseFloat(value) || 0
      if (monto > pedido.saldo_pendiente) {
        const excedente = monto - pedido.saldo_pendiente
        setAdvertenciaSobrepago({
          excedente,
          mensaje: `El cliente pagaría $${excedente.toFixed(2)} de más`
        })
      } else {
        setAdvertenciaSobrepago(null)
      }
    }
  }

  const validar = () => {
    const nuevosErrores = {}

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      nuevosErrores.monto = 'El monto debe ser mayor a 0'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validar()) {
      return
    }

    // Si hay sobrepago, pedir confirmación
    if (advertenciaSobrepago) {
      if (!confirm(
        `${advertenciaSobrepago.mensaje}\n\n` +
        `¿Desea continuar y generar un crédito a favor del cliente?`
      )) {
        return
      }
    }

    onGuardar({
      ...formData,
      id_pedido: pedido.id_pedido,
      monto: parseFloat(formData.monto),
      confirmarSobrepago: advertenciaSobrepago !== null
    })
  }

  const calcularNuevoSaldo = () => {
    const monto = parseFloat(formData.monto) || 0
    return Math.max(0, pedido.saldo_pendiente - monto)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información del pedido */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Pedido #{pedido.id_pedido}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Costo Total:</p>
            <p className="font-bold text-gray-900">${parseFloat(pedido.costo_total).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Saldo Pendiente:</p>
            <p className="font-bold text-warning-600">${parseFloat(pedido.saldo_pendiente).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Monto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monto a Pagar
          <span className="text-danger-500 ml-1">*</span>
        </label>
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="number"
            name="monto"
            step="0.01"
            min="0"
            max={pedido.saldo_pendiente * 2}
            value={formData.monto}
            onChange={handleChange}
            placeholder="0.00"
            disabled={loading}
            className={`
              w-full pl-12 pr-4 py-3 border rounded-lg text-lg
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errores.monto ? 'border-danger-500' : 'border-gray-300'}
            `}
          />
        </div>
        {errores.monto && (
          <p className="mt-1 text-sm text-danger-600">{errores.monto}</p>
        )}

        {/* Botones de monto rápido */}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => handleChange({ target: { name: 'monto', value: pedido.saldo_pendiente } })}
            className="text-sm px-3 py-1 bg-primary-50 text-primary-700 rounded hover:bg-primary-100"
          >
            Liquidar (${parseFloat(pedido.saldo_pendiente).toFixed(2)})
          </button>
          <button
            type="button"
            onClick={() => handleChange({ target: { name: 'monto', value: (pedido.saldo_pendiente / 2).toFixed(2) } })}
            className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            50% (${(pedido.saldo_pendiente / 2).toFixed(2)})
          </button>
        </div>
      </div>

      {/* Alerta de sobrepago */}
      {advertenciaSobrepago && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-warning-600 flex-shrink-0" />
            <div className="text-sm text-warning-800">
              <p className="font-semibold mb-1">⚠️ SOBREPAGO DETECTADO</p>
              <p>{advertenciaSobrepago.mensaje}</p>
              <p className="mt-2">
                Se generará un crédito a favor del cliente que podrá usar en futuros pedidos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Concepto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Concepto
        </label>
        <select
          name="concepto"
          value={formData.concepto}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value={CONCEPTOS_PAGO.ANTICIPO}>Anticipo</option>
          <option value={CONCEPTOS_PAGO.ABONO}>Abono</option>
          <option value={CONCEPTOS_PAGO.LIQUIDACION}>Liquidación</option>
        </select>
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
                type="button"
                onClick={() => handleChange({ target: { name: 'metodo', value: metodo.id } })}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${formData.metodo === metodo.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                  }
                `}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${
                  formData.metodo === metodo.id ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  formData.metodo === metodo.id ? 'text-primary-900' : 'text-gray-700'
                }`}>
                  {metodo.nombre}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas (Opcional)
        </label>
        <textarea
          name="notas"
          value={formData.notas}
          onChange={handleChange}
          placeholder="Información adicional sobre el pago..."
          rows={2}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Resumen */}
      {formData.monto && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Resumen del Pago</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>Saldo actual:</span>
              <span className="font-semibold">${parseFloat(pedido.saldo_pendiente).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pago a registrar:</span>
              <span className="font-semibold">-${parseFloat(formData.monto).toFixed(2)}</span>
            </div>
            <div className="border-t border-blue-200 pt-1 flex justify-between">
              <span className="font-bold">Nuevo saldo:</span>
              <span className="font-bold">${calcularNuevoSaldo().toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="success"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Registrando...' : 'Registrar Pago'}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onCancelar}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
