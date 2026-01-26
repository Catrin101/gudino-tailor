import { useState, useEffect } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { TIPOS_MEDIDA, CAMPOS_MEDIDAS } from '../../../core/constants/medidas'
import { AlertCircle } from 'lucide-react'

/**
 * Formulario para tomar medidas (Torso y Pantalón)
 * Incluye validación y detección de cambios extremos
 */
export function FormularioMedidas({
  tipoMedida,
  medidasAnteriores = null,
  onGuardar,
  onCancelar,
  loading = false,
  cambiosExtremos = []
}) {
  const [valores, setValores] = useState({})
  const [errores, setErrores] = useState({})
  const [etiqueta, setEtiqueta] = useState('')

  const campos = CAMPOS_MEDIDAS[tipoMedida] || []

  // Inicializar con medidas anteriores si existen
  useEffect(() => {
    if (medidasAnteriores?.valores) {
      setValores(medidasAnteriores.valores)
      setEtiqueta(medidasAnteriores.etiqueta || '')
    } else {
      // Inicializar en vacío
      const valoresIniciales = {}
      campos.forEach(campo => {
        valoresIniciales[campo.key] = ''
      })
      setValores(valoresIniciales)
    }
  }, [medidasAnteriores, tipoMedida])

  /**
   * Manejar cambio en inputs
   */
  const handleChange = (key, value) => {
    // Permitir solo números y punto decimal
    const valorLimpio = value.replace(/[^0-9.]/g, '')

    // Evitar múltiples puntos decimales
    const partes = valorLimpio.split('.')
    const valorFinal = partes.length > 2
      ? partes[0] + '.' + partes.slice(1).join('')
      : valorLimpio

    setValores(prev => ({
      ...prev,
      [key]: valorFinal
    }))

    // Limpiar error del campo
    if (errores[key]) {
      setErrores(prev => ({
        ...prev,
        [key]: null
      }))
    }
  }

  /**
   * Validar formulario
   */
  const validar = () => {
    const nuevosErrores = {}

    campos.forEach(campo => {
      const valor = valores[campo.key]

      if (!valor || valor.trim() === '') {
        nuevosErrores[campo.key] = 'Requerido'
      } else {
        const numero = parseFloat(valor)

        if (isNaN(numero) || numero <= 0) {
          nuevosErrores[campo.key] = 'Debe ser mayor a 0'
        } else if (numero > 300) {
          nuevosErrores[campo.key] = 'Máximo 300 cm'
        } else if (!/^\d+(\.\d{1,2})?$/.test(valor)) {
          nuevosErrores[campo.key] = 'Máx. 2 decimales'
        }
      }
    })

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  /**
   * Manejar envío
   */
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validar()) {
      return
    }

    // Convertir valores a números
    const valoresNumericos = {}
    Object.entries(valores).forEach(([key, value]) => {
      valoresNumericos[key] = parseFloat(value)
    })

    onGuardar({
      valores: valoresNumericos,
      etiqueta: etiqueta.trim() || `Medidas ${new Date().toLocaleDateString()}`
    })
  }

  /**
   * Calcular diferencia con medidas anteriores
   */
  const obtenerDiferencia = (key) => {
    if (!medidasAnteriores?.valores || !valores[key]) return null

    const valorAnterior = medidasAnteriores.valores[key]
    const valorNuevo = parseFloat(valores[key])

    if (isNaN(valorNuevo)) return null

    const diferencia = valorNuevo - valorAnterior
    const aumenta = diferencia > 0

    return {
      diferencia: Math.abs(diferencia).toFixed(1),
      aumenta,
      porcentaje: ((Math.abs(diferencia) / valorAnterior) * 100).toFixed(1)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Etiqueta */}
      <div>
        <Input
          label="Etiqueta / Ocasión"
          value={etiqueta}
          onChange={(e) => setEtiqueta(e.target.value)}
          placeholder="Ej: Medidas Boda 2025, Traje Formal..."
          disabled={loading}
        />
        <p className="text-sm text-gray-500 mt-1">
          Opcional - Ayuda a identificar estas medidas en el historial
        </p>
      </div>

      {/* Alertas de cambios extremos */}
      {cambiosExtremos.length > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-warning-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-warning-900 mb-2">
                ⚠️ Cambios Extremos Detectados
              </h4>
              <p className="text-sm text-warning-800 mb-3">
                Los siguientes cambios exceden la tolerancia habitual:
              </p>
              <ul className="space-y-1 text-sm text-warning-800">
                {cambiosExtremos.map((cambio, idx) => (
                  <li key={idx}>
                    • <strong>{cambio.campo}:</strong> {cambio.diferencia}cm de diferencia
                    ({cambio.porcentaje}% de cambio)
                  </li>
                ))}
              </ul>
              <p className="text-sm text-warning-800 mt-3 font-medium">
                💡 Considera crear un nuevo pedido si el cliente cambió significativamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Campos de medidas */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          Medidas de {tipoMedida === TIPOS_MEDIDA.TORSO ? 'Torso' : 'Pantalón'}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {campos.map(campo => {
            const diferencia = obtenerDiferencia(campo.key)

            return (
              <div key={campo.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {campo.label}
                    <span className="text-danger-500 ml-1">*</span>
                  </label>
                  {diferencia && (
                    <span className={`text-xs font-medium ${diferencia.aumenta ? 'text-green-600' : 'text-blue-600'
                      }`}>
                      {diferencia.aumenta ? '+' : '-'}{diferencia.diferencia} cm
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={valores[campo.key] || ''}
                    onChange={(e) => handleChange(campo.key, e.target.value)}
                    placeholder="0.0"
                    disabled={loading}
                    className={`
                      w-full px-4 py-3 pr-12 border rounded-lg text-lg
                      focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      ${errores[campo.key] ? 'border-danger-500' : 'border-gray-300'}
                      ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}
                    `}
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {campo.unidad}
                  </span>
                </div>

                {errores[campo.key] && (
                  <p className="mt-1 text-sm text-danger-600">{errores[campo.key]}</p>
                )}

                {medidasAnteriores?.valores[campo.key] && (
                  <p className="mt-1 text-xs text-gray-500">
                    Anterior: {medidasAnteriores.valores[campo.key]} cm
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Guardando...' : 'Guardar Medidas'}
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
