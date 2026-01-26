import { Card } from '../../../shared/components/Card'
import { Package, DollarSign, Clock } from 'lucide-react'

/**
 * Lista de actividad reciente del negocio
 */
export function ListaActividad({ actividades, loading }) {
    const iconos = {
        pedido: Package,
        pago: DollarSign
    }

    const colores = {
        pedido: 'bg-blue-100 text-blue-600',
        pago: 'bg-green-100 text-green-600'
    }

    const formatearFecha = (fecha) => {
        const date = new Date(fecha)
        const ahora = new Date()
        const diferencia = Math.floor((ahora - date) / 1000)

        if (diferencia < 60) return 'Hace un momento'
        if (diferencia < 3600) return `Hace ${Math.floor(diferencia / 60)} min`
        if (diferencia < 86400) return `Hace ${Math.floor(diferencia / 3600)} h`
        if (diferencia < 172800) return 'Ayer'

        return date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <Card>
                <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="animate-pulse flex gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        )
    }

    if (!actividades || actividades.length === 0) {
        return (
            <Card>
                <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
                <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No hay actividad reciente</p>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Actividad Reciente
                </h3>
                <span className="text-sm text-gray-500">
                    Últimas {actividades.length} acciones
                </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {actividades.map((actividad, index) => {
                    const Icon = iconos[actividad.tipo] || Package
                    const colorClass = colores[actividad.tipo] || 'bg-gray-100 text-gray-600'

                    return (
                        <div
                            key={index}
                            className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                    {actividad.titulo}
                                </p>
                                <p className="text-sm text-gray-600 truncate">
                                    {actividad.descripcion}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatearFecha(actividad.fecha)}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}