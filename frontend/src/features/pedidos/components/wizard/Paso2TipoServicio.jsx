import { Package, Scissors, Calendar } from 'lucide-react'
import { TIPOS_SERVICIO } from '../../../../core/constants/estados'

/**
 * Paso 2: Selección de tipo de servicio
 */
export function Paso2TipoServicio({ tipoSeleccionado, onSeleccionar }) {
  const servicios = [
    {
      tipo: TIPOS_SERVICIO.CONFECCION,
      titulo: 'Confección',
      descripcion: 'Crear prendas nuevas desde cero',
      icon: Package,
      color: 'blue',
      detalles: ['Requiere medidas', 'Tiempo: 2-4 semanas', 'Incluye pruebas']
    },
    {
      tipo: TIPOS_SERVICIO.REMIENDO,
      titulo: 'Remiendo',
      descripcion: 'Ajustes y reparaciones de prendas',
      icon: Scissors,
      color: 'green',
      detalles: ['No requiere medidas', 'Tiempo: 1-3 días', 'Trabajo rápido']
    },
    {
      tipo: TIPOS_SERVICIO.RENTA,
      titulo: 'Renta',
      descripcion: 'Préstamo de prendas para eventos',
      icon: Calendar,
      color: 'purple',
      detalles: ['Requiere fechas', 'Ajustes incluidos', 'Depósito requerido']
    }
  ]

  const getColorClasses = (color, seleccionado) => {
    const colores = {
      blue: seleccionado 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-gray-200 hover:border-blue-300',
      green: seleccionado
        ? 'border-green-500 bg-green-50'
        : 'border-gray-200 hover:border-green-300',
      purple: seleccionado
        ? 'border-purple-500 bg-purple-50'
        : 'border-gray-200 hover:border-purple-300'
    }
    return colores[color]
  }

  const getIconColor = (color) => {
    const colores = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600'
    }
    return colores[color]
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">¿Qué Tipo de Servicio?</h2>
      <p className="text-gray-600 mb-8">
        Selecciona el tipo de trabajo que realizarás
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {servicios.map(servicio => {
          const Icon = servicio.icon
          const seleccionado = tipoSeleccionado === servicio.tipo

          return (
            <button
              key={servicio.tipo}
              onClick={() => onSeleccionar(servicio.tipo)}
              className={`
                p-6 rounded-xl border-2 transition-all text-left
                ${getColorClasses(servicio.color, seleccionado)}
                ${seleccionado ? 'transform scale-105 shadow-lg' : 'hover:shadow-md'}
              `}
            >
              {/* Icono */}
              <div className={`w-16 h-16 rounded-lg bg-white shadow-md flex items-center justify-center mb-4 ${getIconColor(servicio.color)}`}>
                <Icon className="w-8 h-8" />
              </div>

              {/* Título y descripción */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {servicio.titulo}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {servicio.descripcion}
              </p>

              {/* Detalles */}
              <ul className="space-y-1">
                {servicio.detalles.map((detalle, idx) => (
                  <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    {detalle}
                  </li>
                ))}
              </ul>

              {/* Indicador de selección */}
              {seleccionado && (
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary-700">
                  <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  Seleccionado
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
