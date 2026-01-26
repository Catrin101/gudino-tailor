import { Card } from '../../../shared/components/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

/**
 * Gráfica de ingresos de los últimos 7 días
 */
export function GraficaIngresos({ datos, loading }) {
    if (loading) {
        return (
            <Card>
                <h3 className="text-lg font-semibold mb-4">Ingresos de la Semana</h3>
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </Card>
        )
    }

    if (!datos || datos.length === 0) {
        return (
            <Card>
                <h3 className="text-lg font-semibold mb-4">Ingresos de la Semana</h3>
                <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No hay datos de ingresos</p>
                </div>
            </Card>
        )
    }

    const total = datos.reduce((sum, item) => sum + item.monto, 0)
    const promedio = total / datos.length

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Ingresos de la Semana
                    </h3>
                    <p className="text-sm text-gray-500">
                        Últimos 7 días
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-success-600">
                        ${total.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={datos} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="fecha"
                            tick={{ fontSize: 12 }}
                            stroke="#6B7280"
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            stroke="#6B7280"
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                padding: '8px'
                            }}
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Ingresos']}
                        />
                        <Line
                            type="monotone"
                            dataKey="monto"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={{ fill: '#10B981', r: 5 }}
                            activeDot={{ r: 7 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Promedio diario:</span>
                    <span className="font-semibold text-gray-900">
                        ${promedio.toFixed(2)}
                    </span>
                </div>
            </div>
        </Card>
    )
}