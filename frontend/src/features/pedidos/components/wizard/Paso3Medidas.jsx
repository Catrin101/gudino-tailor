import { useEffect, useState } from 'react'
import { useMedidas } from '../../../medidas/hooks/useMedidas'
import { TIPOS_MEDIDA } from '../../../../core/constants/medidas'
import { AlertCircle, CheckCircle, Ruler } from 'lucide-react'

/**
 * Paso 3: Selección de medidas (Solo para Confección)
 */
export function Paso3Medidas({ 
  cliente, 
  medidasTorso, 
  medidasPantalon, 
  onActualizar 
}) {
  const { medidas, cargarMedidas, loading } = useMedidas()
  const [medidasCliente, setMedidasCliente] = useState({ torso: [], pantalon: [] })

  useEffect(() => {
    if (cliente) {
      cargarMedidas(cliente.id_cliente)
    }
  }, [cliente])

  useEffect(() => {
    // Filtrar medidas activas por tipo
    const torso = medidas.filter(m => 
      m.tipo_medida === TIPOS_MEDIDA.TORSO && m.activo
    )
    const pantalon = medidas.filter(m => 
      m.tipo_medida === TIPOS_MEDIDA.PANTALON && m.activo
    )

    setMedidasCliente({ torso, pantalon })

    // Seleccionar automáticamente las más recientes
    if (torso.length > 0 && !medidasTorso) {
      onActualizar({ medidas_torso: torso[0] })
    }
    if (pantalon.length > 0 && !medidasPantalon) {
      onActualizar({ medidas_pantalon: pantalon[0] })
    }
  }, [medidas])

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const renderSeccionMedidas = (tipo, medidasDisponibles, medidaSeleccionada, onSeleccionar) => {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Ruler className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">
            Medidas de {tipo === 'torso' ? 'Torso' : 'Pantalón'}
          </h3>
        </div>

        {medidasDisponibles.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">
              No hay medidas de {tipo} registradas
            </p>
            <p className="text-sm text-gray-500">
              Deberás tomarlas antes o después de crear el pedido
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {medidasDisponibles.map(medida => (
              <button
                key={medida.id_medida}
                onClick={() => onSeleccionar(medida)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${medidaSeleccionada?.id_medida === medida.id_medida
                    ? 'border-primary-500 bg-white shadow-md'
                    : 'border-gray-200 bg-white hover:border-primary-300'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">
                      {medida.etiqueta || 'Sin etiqueta'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Tomadas: {formatearFecha(medida.fecha_toma)}
                    </p>
                    
                    {/* Vista previa de valores */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(medida.valores).slice(0, 3).map(([campo, valor]) => (
                        <span 
                          key={campo}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {campo.replace(/_/g, ' ')}: {valor}cm
                        </span>
                      ))}
                      <span className="text-xs text-gray-400 px-2 py-1">
                        +{Object.keys(medida.valores).length - 3} más
                      </span>
                    </div>
                  </div>

                  {medidaSeleccionada?.id_medida === medida.id_medida && (
                    <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Cargando medidas del cliente...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Selecciona las Medidas</h2>
      <p className="text-gray-600 mb-6">
        Elige las medidas que usarás para este pedido de <strong>{cliente?.nombre}</strong>
      </p>

      {/* Alerta informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">💡 Importante:</p>
            <p>
              Selecciona al menos un tipo de medida. Si el cliente necesita ambos 
              (saco y pantalón), puedes seleccionar las dos versiones.
            </p>
          </div>
        </div>
      </div>

      {/* Secciones de medidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSeccionMedidas(
          'torso',
          medidasCliente.torso,
          medidasTorso,
          (medida) => onActualizar({ medidas_torso: medida })
        )}

        {renderSeccionMedidas(
          'pantalon',
          medidasCliente.pantalon,
          medidasPantalon,
          (medida) => onActualizar({ medidas_pantalon: medida })
        )}
      </div>

      {/* Advertencia si no hay medidas */}
      {medidasCliente.torso.length === 0 && medidasCliente.pantalon.length === 0 && (
        <div className="mt-6 bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-warning-800">
              <p className="font-medium mb-1">⚠️ Sin medidas registradas</p>
              <p>
                Este cliente no tiene medidas en el sistema. Puedes continuar creando 
                el pedido y tomar las medidas después, o cancelar para tomarlas ahora.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
