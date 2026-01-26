import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '../../../shared/components/Button'

/**
 * Modal para comparar dos versiones de medidas
 * Muestra diferencias visuales entre versiones
 */
export function ModalComparacion({ medidaActual, medidaAnterior, onCerrar }) {
    const calcularDiferencia = (campo) => {
        const valorActual = medidaActual.valores[campo]
        const valorAnterior = medidaAnterior?.valores[campo]

        if (!valorAnterior) {
            return { tipo: 'nuevo', valor: valorActual }
        }

        const diferencia = valorActual - valorAnterior
        const porcentaje = ((Math.abs(diferencia) / valorAnterior) * 100).toFixed(1)

        if (Math.abs(diferencia) < 0.1) {
            return { tipo: 'igual', valor: valorActual, diferencia: 0, porcentaje: 0 }
        }

        return {
            tipo: diferencia > 0 ? 'aumento' : 'disminucion',
            valor: valorActual,
            diferencia: Math.abs(diferencia),
            porcentaje,
            aumenta: diferencia > 0
        }
    }

    const formatearFecha = (fecha) => {
        if (!fecha) return ''
        return new Date(fecha).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const todosLosCampos = new Set([
        ...Object.keys(medidaActual.valores),
        ...(medidaAnterior ? Object.keys(medidaAnterior.valores) : [])
    ])

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Comparación de Medidas
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Diferencias entre versiones
                        </p>
                    </div>
                    <button
                        onClick={onCerrar}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-6">
                    {/* Información de versiones */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium mb-1">Versión Actual</p>
                            <p className="font-semibold text-blue-900">
                                {medidaActual.etiqueta || 'Sin etiqueta'}
                            </p>
                            <p className="text-sm text-blue-700">
                                {formatearFecha(medidaActual.fecha_toma)}
                            </p>
                        </div>

                        {medidaAnterior && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 font-medium mb-1">Versión Anterior</p>
                                <p className="font-semibold text-gray-900">
                                    {medidaAnterior.etiqueta || 'Sin etiqueta'}
                                </p>
                                <p className="text-sm text-gray-700">
                                    {formatearFecha(medidaAnterior.fecha_toma)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Tabla de comparación */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Comparación Detallada</h3>

                        <div className="border border-gray-200 rounded-lg overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Medida
                                        </th>
                                        <th className="px-2 py-3 text-center text-xs sm:text-sm font-medium text-gray-700">
                                            Anterior
                                        </th>
                                        <th className="px-2 py-3 text-center text-xs sm:text-sm font-medium text-gray-700">
                                            Actual
                                        </th>
                                        <th className="px-2 py-3 text-center text-xs sm:text-sm font-medium text-gray-700">
                                            Diferencia
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {Array.from(todosLosCampos).map((campo) => {
                                        const diff = calcularDiferencia(campo)

                                        return (
                                            <tr key={campo} className="hover:bg-gray-50">
                                                <td className="px-3 py-3 text-xs sm:text-sm font-medium text-gray-900 capitalize">
                                                    {campo.replace(/_/g, ' ')}
                                                </td>

                                                <td className="px-2 py-3 text-center text-xs sm:text-sm text-gray-600">
                                                    {medidaAnterior?.valores[campo]
                                                        ? `${medidaAnterior.valores[campo]} cm`
                                                        : '-'
                                                    }
                                                </td>

                                                <td className="px-2 py-3 text-center text-xs sm:text-sm font-semibold text-gray-900">
                                                    {diff.valor} cm
                                                </td>

                                                <td className="px-2 py-3 text-center">
                                                    {diff.tipo === 'nuevo' && (
                                                        <span className="text-xs text-blue-600 font-medium">
                                                            NUEVO
                                                        </span>
                                                    )}

                                                    {diff.tipo === 'igual' && (
                                                        <div className="flex items-center justify-center gap-1 text-gray-500">
                                                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span className="text-xs">Sin cambio</span>
                                                        </div>
                                                    )}

                                                    {diff.tipo === 'aumento' && (
                                                        <div className="flex items-center justify-center gap-1 text-green-600">
                                                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span className="text-xs sm:text-sm font-semibold">
                                                                +{diff.diferencia} cm
                                                            </span>
                                                            <span className="text-xs hidden sm:inline">
                                                                ({diff.porcentaje}%)
                                                            </span>
                                                        </div>
                                                    )}

                                                    {diff.tipo === 'disminucion' && (
                                                        <div className="flex items-center justify-center gap-1 text-blue-600">
                                                            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span className="text-xs sm:text-sm font-semibold">
                                                                -{diff.diferencia} cm
                                                            </span>
                                                            <span className="text-xs hidden sm:inline">
                                                                ({diff.porcentaje}%)
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Resumen de cambios */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">💡 Resumen</h4>
                        <p className="text-sm text-blue-800">
                            {(() => {
                                const cambios = Array.from(todosLosCampos).map(calcularDiferencia)
                                const aumentos = cambios.filter(c => c.tipo === 'aumento').length
                                const disminuciones = cambios.filter(c => c.tipo === 'disminucion').length
                                const sinCambio = cambios.filter(c => c.tipo === 'igual').length

                                return `${aumentos} medidas aumentaron, ${disminuciones} disminuyeron, ${sinCambio} sin cambio.`
                            })()}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <Button variant="outline" onClick={onCerrar} className="w-full">
                        Cerrar Comparación
                    </Button>
                </div>
            </div>
        </div>
    )
}