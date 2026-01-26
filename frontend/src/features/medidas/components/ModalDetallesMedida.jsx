import { X, Calendar, Tag, Edit, Trash2 } from 'lucide-react'
import { Button } from '../../../shared/components/Button'

/**
 * Modal para ver detalles completos de una medida
 * Muestra todos los valores y permite editar/eliminar
 */
export function ModalDetallesMedida({
    medida,
    onCerrar,
    onEditar,
    onEliminar,
    puedeEditar = true
}) {
    const formatearFecha = (fecha) => {
        if (!fecha) return 'Sin fecha'
        return new Date(fecha).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Detalles de Medida
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {medida.tipo_medida} - {medida.activo ? 'Activa' : 'Obsoleta'}
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
                    {/* Información general */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        {medida.etiqueta && (
                            <div className="flex items-center gap-2">
                                <Tag className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Etiqueta</p>
                                    <p className="font-medium text-gray-900">{medida.etiqueta}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-600" />
                            <div>
                                <p className="text-sm text-gray-500">Fecha de toma</p>
                                <p className="font-medium text-gray-900">
                                    {formatearFecha(medida.fecha_toma)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Valores de medidas */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Medidas de {medida.tipo_medida}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(medida.valores).map(([campo, valor]) => (
                                <div
                                    key={campo}
                                    className="bg-white border border-gray-200 rounded-lg p-4"
                                >
                                    <p className="text-sm text-gray-500 capitalize mb-1">
                                        {campo.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {valor}
                                        <span className="text-sm text-gray-500 ml-1">cm</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alerta si está obsoleta */}
                    {!medida.activo && (
                        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                            <p className="text-warning-800 text-sm">
                                ⚠️ Esta medida ha sido marcada como obsoleta.
                                Existe una versión más reciente de estas medidas.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer con acciones */}
                {puedeEditar && medida.activo && (
                    <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
                        <Button
                            variant="primary"
                            onClick={() => onEditar(medida)}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Editar Medidas
                        </Button>

                        <Button
                            variant="danger"
                            onClick={() => onEliminar(medida)}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}