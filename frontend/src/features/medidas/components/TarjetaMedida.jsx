import { Calendar, Tag, User, AlertCircle, CheckCircle } from 'lucide-react'
import { Card } from '../../../shared/components/Card'

/**
 * Tarjeta individual de medida
 * Muestra información resumida de una versión de medidas
 */
export function TarjetaMedida({ medida, onClick, mostrarCliente = false }) {
    const formatearFecha = (fecha) => {
        if (!fecha) return 'Sin fecha'
        return new Date(fecha).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const obtenerResumenValores = (valores) => {
        if (!valores) return []

        // Mostrar los primeros 3 campos
        return Object.entries(valores).slice(0, 3).map(([key, value]) => ({
            campo: key.replace(/_/g, ' '),
            valor: value
        }))
    }

    const resumen = obtenerResumenValores(medida.valores)

    return (
        <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onClick(medida)}
        >
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {/* Tipo de medida */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${medida.tipo_medida === 'Torso'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                {medida.tipo_medida}
                            </span>

                            {medida.activo ? (
                                <CheckCircle className="w-5 h-5 text-success-500" title="Activa" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-gray-400" title="Obsoleta" />
                            )}
                        </div>

                        {/* Etiqueta */}
                        {medida.etiqueta && (
                            <div className="flex items-center gap-2 text-gray-700 mb-2">
                                <Tag className="w-4 h-4" />
                                <span className="font-medium">{medida.etiqueta}</span>
                            </div>
                        )}

                        {/* Fecha */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{formatearFecha(medida.fecha_toma)}</span>
                        </div>

                        {/* Cliente (si se muestra) */}
                        {mostrarCliente && medida.clientes && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                <User className="w-4 h-4" />
                                <span>{medida.clientes.nombre}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Resumen de valores */}
                <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Vista previa:</p>
                    <div className="grid grid-cols-3 gap-2">
                        {resumen.map((item, idx) => (
                            <div key={idx} className="text-center">
                                <p className="text-xs text-gray-500 capitalize truncate">
                                    {item.campo}
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {item.valor} cm
                                </p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">
                        + {Object.keys(medida.valores).length - 3} más...
                    </p>
                </div>
            </div>
        </Card>
    )
}