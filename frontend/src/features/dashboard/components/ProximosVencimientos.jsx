import { Card } from '../../../shared/components/Card'
import { Calendar, AlertCircle, Phone, DollarSign } from 'lucide-react'

/**
 * Lista de pedidos próximos a vencer
 */
export function ProximosVencimientos({ pedidos, loading, onPedidoClick }) {

    const formatearFecha = (fecha) => {
        const date = new Date(fecha)
        const hoy = new Date()
        const diferencia = Math.ceil((date - hoy) / (1000 * 60 * 60 * 24))

        return {
            texto: date.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short'
            }),
            dias: diferencia,
            urgente: diferencia <= 2
        }
    }

    const handlePedidoClick = (pedido) => {
        if (onPedidoClick) {
            onPedidoClick(pedido)
        }
    }

    if (loading) {
        return (
            <Card>
                <h3 className="text-lg font-semibold mb-4">Próximas Entregas</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </Card>
        )
    }

    if (!pedidos || pedidos.length === 0) {
        return (
            <Card>
                <h3 className="text-lg font-semibold mb-4">Próximas Entregas</h3>
                <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No hay entregas próximas</p>
                    <p className="text-sm text-gray-400 mt-1">
                        (Próximos 7 días)
                    </p>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Próximas Entregas
                </h3>
                <span className="text-sm text-gray-500">
                    Próximos 7 días
                </span>
            </div>

            <div className="space-y-3">
                {pedidos.map((pedido) => {
                    const fechaInfo = formatearFecha(pedido.fecha_promesa)

                    return (
                        <button
                            key={pedido.id_pedido}
                            onClick={() => handlePedidoClick(pedido)}
                            className={`
                w-full text-left p-3 rounded-lg transition-all
                ${fechaInfo.urgente
                                    ? 'bg-red-50 border-2 border-red-200 hover:bg-red-100'
                                    : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                                }
              `}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900">
                                            Pedido #{pedido.id_pedido}
                                        </span>
                                        {fechaInfo.urgente && (
                                            <AlertCircle className="w-4 h-4 text-red-600" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium">
                                        {pedido.clientes?.nombre || 'Sin cliente'}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${fechaInfo.urgente
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }
                  `}>
                                        {fechaInfo.dias === 0
                                            ? '¡Hoy!'
                                            : fechaInfo.dias === 1
                                                ? 'Mañana'
                                                : `En ${fechaInfo.dias} días`
                                        }
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <Calendar className="w-3 h-3" />
                                        <span>{fechaInfo.texto}</span>
                                    </div>

                                    {pedido.clientes?.telefono && (
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Phone className="w-3 h-3" />
                                            <span>{pedido.clientes.telefono}</span>
                                        </div>
                                    )}
                                </div>

                                {pedido.saldo_pendiente > 0 && (
                                    <div className="flex items-center gap-1 text-warning-600 font-medium">
                                        <DollarSign className="w-3 h-3" />
                                        <span>Debe: ${parseFloat(pedido.saldo_pendiente).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className={`
                    px-2 py-0.5 rounded text-xs font-medium
                    ${pedido.tipo_servicio === 'Confeccion'
                                            ? 'bg-blue-100 text-blue-700'
                                            : pedido.tipo_servicio === 'Remiendo'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-purple-100 text-purple-700'
                                        }
                  `}>
                                        {pedido.tipo_servicio}
                                    </span>

                                    <span className={`
                    px-2 py-0.5 rounded text-xs font-medium
                    ${pedido.estado === 'En Espera'
                                            ? 'bg-gray-100 text-gray-700'
                                            : pedido.estado === 'En Proceso'
                                                ? 'bg-blue-100 text-blue-700'
                                                : pedido.estado === 'Prueba'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-green-100 text-green-700'
                                        }
                  `}>
                                        {pedido.estado}
                                    </span>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </Card>
    )
}