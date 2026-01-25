import { Card } from '../../../shared/components/Card'
import { DollarSign, TrendingUp, CreditCard, Banknote, Smartphone } from 'lucide-react'

/**
 * Resumen de caja del día
 * Muestra ingresos totales por método de pago
 */
export function ResumenCaja({ resumen, loading = false }) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (!resumen) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total General */}
      <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-primary-100 text-sm font-medium">Ingresos del Día</p>
            <p className="text-3xl font-bold mt-1">
              ${resumen.totalGeneral.toFixed(2)}
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <p className="text-primary-100 text-sm">
          {resumen.cantidadTransacciones} transacciones
        </p>
      </Card>

      {/* Efectivo */}
      <Card className="bg-green-50 border-2 border-green-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-green-700 text-sm font-medium">Efectivo</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              ${resumen.totalEfectivo.toFixed(2)}
            </p>
          </div>
          <div className="bg-green-200 p-3 rounded-lg">
            <Banknote className="w-6 h-6 text-green-700" />
          </div>
        </div>
      </Card>

      {/* Tarjeta */}
      <Card className="bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-700 text-sm font-medium">Tarjeta</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              ${resumen.totalTarjeta.toFixed(2)}
            </p>
          </div>
          <div className="bg-blue-200 p-3 rounded-lg">
            <CreditCard className="w-6 h-6 text-blue-700" />
          </div>
        </div>
      </Card>

      {/* Transferencia */}
      <Card className="bg-purple-50 border-2 border-purple-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-purple-700 text-sm font-medium">Transferencia</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              ${resumen.totalTransferencia.toFixed(2)}
            </p>
          </div>
          <div className="bg-purple-200 p-3 rounded-lg">
            <Smartphone className="w-6 h-6 text-purple-700" />
          </div>
        </div>
      </Card>

      {/* Desglose por concepto */}
      <Card className="md:col-span-2 lg:col-span-4">
        <h3 className="font-semibold text-gray-900 mb-4">Desglose por Concepto</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Anticipos</p>
            <p className="text-2xl font-bold text-gray-900">{resumen.anticipos}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Abonos</p>
            <p className="text-2xl font-bold text-gray-900">{resumen.abonos}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Liquidaciones</p>
            <p className="text-2xl font-bold text-gray-900">{resumen.liquidaciones}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
