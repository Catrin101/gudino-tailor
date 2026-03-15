import { useState } from 'react'
import { Scissors, Plus, X, AlertCircle } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'

/**
 * Paso 3: Compostura — Registro de múltiples prendas con sus instrucciones
 *
 * CAMBIO: Reemplaza el anterior Paso3Remiendo que solo permitía un textarea global.
 * Ahora el usuario puede agregar N prendas, cada una con:
 *   - Tipo de prenda (selección)
 *   - Descripción/instrucciones específicas (texto libre)
 *
 * El comportamiento es análogo a Paso4Detalles de Confección,
 * adaptado para que la descripción sea obligatoria en cada ítem.
 */
export function Paso3Compostura({ prendasCompostura, onActualizar }) {
    // Estado local del formulario de la prenda que se está agregando
    const [nuevaPrenda, setNuevaPrenda] = useState({
        tipo: '',
        descripcion: ''
    })
    const [errores, setErrores] = useState({})

    const tiposPrenda = [
        'Saco',
        'Pantalón',
        'Camisa',
        'Vestido',
        'Falda',
        'Chaleco',
        'Abrigo',
        'Chaqueta',
        'Traje completo',
        'Otra prenda'
    ]

    const ejemplosInstrucciones = [
        'Subir bastilla 3 cm',
        'Cerrar agujero en codo derecho',
        'Cambiar cierre delantero',
        'Ajustar cintura 2 cm',
        'Reparar costura lateral',
        'Colocar parches en codos',
        'Meter mangas 1.5 cm',
        'Reemplazar botones'
    ]

    // ─── Validar prenda antes de agregar ──────────────────────────────────
    const validarPrenda = () => {
        const nuevosErrores = {}

        if (!nuevaPrenda.tipo) {
            nuevosErrores.tipo = 'Selecciona el tipo de prenda'
        }
        if (!nuevaPrenda.descripcion || nuevaPrenda.descripcion.trim() === '') {
            nuevosErrores.descripcion = 'Describe el trabajo a realizar en esta prenda'
        }

        setErrores(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    // ─── Agregar prenda a la lista ─────────────────────────────────────────
    const agregarPrenda = () => {
        if (!validarPrenda()) return

        const prenda = {
            tipo: nuevaPrenda.tipo,
            descripcion: nuevaPrenda.descripcion.trim()
        }

        onActualizar([...prendasCompostura, prenda])

        // Limpiar formulario para la siguiente prenda
        setNuevaPrenda({ tipo: '', descripcion: '' })
        setErrores({})
    }

    // ─── Eliminar prenda de la lista ───────────────────────────────────────
    const eliminarPrenda = (index) => {
        onActualizar(prendasCompostura.filter((_, i) => i !== index))
    }

    // ─── Usar ejemplo como descripción ────────────────────────────────────
    const usarEjemplo = (ejemplo) => {
        setNuevaPrenda(prev => ({ ...prev, descripcion: ejemplo }))
        if (errores.descripcion) setErrores(prev => ({ ...prev, descripcion: null }))
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Instrucciones de Compostura</h2>
            <p className="text-gray-600 mb-6">
                Agrega cada prenda que se va a trabajar con sus instrucciones específicas.
                Puedes incluir tantas prendas como necesite el pedido.
            </p>

            {/* ── Lista de prendas ya agregadas ─────────────────────────────── */}
            {prendasCompostura.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Prendas en este pedido ({prendasCompostura.length})
                    </h3>
                    <div className="space-y-2">
                        {prendasCompostura.map((prenda, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
                            >
                                {/* Número e ícono */}
                                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Scissors className="w-4 h-4 text-green-700" />
                                </div>

                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900">{prenda.tipo}</p>
                                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                        {prenda.descripcion}
                                    </p>
                                </div>

                                {/* Botón eliminar */}
                                <button
                                    onClick={() => eliminarPrenda(index)}
                                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                                    title="Eliminar prenda"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Formulario para agregar nueva prenda ──────────────────────── */}
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-green-600" />
                    Agregar prenda
                </h3>

                <div className="space-y-4">
                    {/* Tipo de prenda */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Prenda
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                            value={nuevaPrenda.tipo}
                            onChange={(e) => {
                                setNuevaPrenda(prev => ({ ...prev, tipo: e.target.value }))
                                if (errores.tipo) setErrores(prev => ({ ...prev, tipo: null }))
                            }}
                            className={`
                w-full px-4 py-3 border rounded-lg text-lg
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${errores.tipo ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
              `}
                        >
                            <option value="">Seleccionar tipo de prenda...</option>
                            {tiposPrenda.map(tipo => (
                                <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                        </select>
                        {errores.tipo && (
                            <p className="mt-1 text-sm text-red-600">{errores.tipo}</p>
                        )}
                    </div>

                    {/* Descripción / instrucciones */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ¿Qué se le hace a esta prenda?
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                            value={nuevaPrenda.descripcion}
                            onChange={(e) => {
                                setNuevaPrenda(prev => ({ ...prev, descripcion: e.target.value }))
                                if (errores.descripcion) setErrores(prev => ({ ...prev, descripcion: null }))
                            }}
                            placeholder="Describe detalladamente el trabajo a realizar en esta prenda..."
                            rows={3}
                            className={`
                w-full px-4 py-3 border rounded-lg text-base
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${errores.descripcion ? 'border-red-500 bg-red-50' : 'border-gray-300'}
              `}
                        />
                        {errores.descripcion && (
                            <p className="mt-1 text-sm text-red-600">{errores.descripcion}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {nuevaPrenda.descripcion.length} caracteres
                        </p>
                    </div>

                    {/* Botón agregar */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={agregarPrenda}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Agregar esta prenda al pedido
                    </Button>
                </div>
            </div>

            {/* ── Ejemplos de instrucciones comunes ─────────────────────────── */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Scissors className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-700 text-sm">
                        Instrucciones frecuentes (clic para usar)
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ejemplosInstrucciones.map((ejemplo, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => usarEjemplo(ejemplo)}
                            className="text-left px-3 py-2 text-sm text-gray-700 bg-gray-50
                         border border-gray-200 rounded-lg
                         hover:border-green-400 hover:bg-green-50
                         transition-colors"
                        >
                            {ejemplo}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Alerta si no hay prendas ──────────────────────────────────── */}
            {prendasCompostura.length === 0 && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                            Agrega al menos una prenda con sus instrucciones para poder continuar.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
