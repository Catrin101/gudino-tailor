import { useState, useEffect } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { X } from 'lucide-react'

/**
 * Formulario para crear o editar un cliente
 * @param {Object} cliente - Cliente a editar (null para crear nuevo)
 * @param {Function} onGuardar - Callback al guardar
 * @param {Function} onCancelar - Callback al cancelar
 * @param {boolean} loading - Estado de carga
 */
export function FormularioCliente({ cliente = null, onGuardar, onCancelar, loading = false }) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    notas_generales: '',
    es_migracion: false
  })

  const [errores, setErrores] = useState({})

  // Cargar datos si es edición
  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        telefono: cliente.telefono || '',
        notas_generales: cliente.notas_generales || '',
        es_migracion: false
      })
    }
  }, [cliente])

  /**
   * Manejar cambios en los inputs
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  /**
   * Formatear teléfono mientras se escribe
   */
  const handleTelefonoChange = (e) => {
    let value = e.target.value.replace(/\D/g, '') // Solo números
    value = value.substring(0, 10) // Máximo 10 dígitos
    
    setFormData(prev => ({
      ...prev,
      telefono: value
    }))

    if (errores.telefono) {
      setErrores(prev => ({ ...prev, telefono: null }))
    }
  }

  /**
   * Validar formulario
   */
  const validar = () => {
    const nuevosErrores = {}

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio'
    } else if (formData.telefono.length !== 10) {
      nuevosErrores.telefono = 'El teléfono debe tener 10 dígitos'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validar()) {
      return
    }

    onGuardar(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <Input
        label="Nombre Completo"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        placeholder="Juan Pérez García"
        error={errores.nombre}
        required
        disabled={loading}
      />

      {/* Teléfono */}
      <Input
        label="Teléfono"
        name="telefono"
        value={formData.telefono}
        onChange={handleTelefonoChange}
        placeholder="6861234567"
        error={errores.telefono}
        required
        disabled={loading}
        maxLength={10}
      />

      {/* Notas generales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas Generales
        </label>
        <textarea
          name="notas_generales"
          value={formData.notas_generales}
          onChange={handleChange}
          placeholder="Preferencias, observaciones, etc."
          rows={3}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Checkbox de migración (solo al crear) */}
      {!cliente && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="es_migracion"
              checked={formData.es_migracion}
              onChange={handleChange}
              disabled={loading}
              className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <div>
              <span className="font-medium text-gray-900">
                Este cliente viene del cuaderno físico
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Marca esta opción si estás migrando datos históricos
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Guardando...' : (cliente ? 'Actualizar Cliente' : 'Crear Cliente')}
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
