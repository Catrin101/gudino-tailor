import { useState, useEffect } from 'react'
import { useNotification } from '../shared/context/NotificationContext'
import { useClientes } from '../features/clientes/hooks/useClientes'
import { useMedidas } from '../features/medidas/hooks/useMedidas'
import { FormularioMedidas } from '../features/medidas/components/FormularioMedidas'
import { TarjetaMedida } from '../features/medidas/components/TarjetaMedida'
import { ModalDetallesMedida } from '../features/medidas/components/ModalDetallesMedida'
import { ModalComparacion } from '../features/medidas/components/ModalComparacion'
import { Card } from '../shared/components/Card'
import { Button } from '../shared/components/Button'
import { TIPOS_MEDIDA } from '../core/constants/medidas'
import { Ruler, User, Plus, GitCompare, Calendar } from 'lucide-react'
import { MedidaService } from '../features/medidas/services/MedidaService'

/**
 * Página principal del módulo de medidas
 */
export function MedidasPage() {
  const { clientes } = useClientes()
  const {
    medidas,
    loading,
    error,
    cargarMedidas,
    crearMedida,
    eliminarMedida,
    obtenerUltimasPorTipo
  } = useMedidas()

  const [vistaActual, setVistaActual] = useState('seleccion') // 'seleccion' | 'formulario' | 'historial'
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [tipoMedidaSeleccionado, setTipoMedidaSeleccionado] = useState(null)
  const [medidasAnteriores, setMedidasAnteriores] = useState(null)
  const [medidaSeleccionada, setMedidaSeleccionada] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarComparacion, setMostrarComparacion] = useState(false)
  const [medidaComparar, setMedidaComparar] = useState(null)
  const [cambiosExtremos, setCambiosExtremos] = useState([])

  const notification = useNotification()

  const medidaService = new MedidaService()

  /**
   * Seleccionar cliente y cargar su historial
   */
  const handleSeleccionarCliente = async (cliente) => {
    setClienteSeleccionado(cliente)
    await cargarMedidas(cliente.id_cliente)
    setVistaActual('historial')
  }

  /**
   * Iniciar toma de medidas
   */
  const handleTomarMedidas = async (tipoMedida) => {
    setTipoMedidaSeleccionado(tipoMedida)

    // Cargar medidas anteriores del tipo seleccionado
    const ultimasMedidas = await obtenerUltimasPorTipo(
      clienteSeleccionado.id_cliente,
      tipoMedida
    )

    setMedidasAnteriores(ultimasMedidas)
    setVistaActual('formulario')
  }

  /**
   * Guardar nuevas medidas
   */
  const handleGuardarMedidas = async (datosMedidas) => {
    try {
      // Detectar cambios extremos si hay medidas anteriores
      if (medidasAnteriores) {
        const { cambiosExtremos: cambios } = medidaService.compararMedidas(
          datosMedidas.valores,
          medidasAnteriores.valores
        )

        if (cambios.length > 0) {
          // Mostrar confirmación si hay cambios extremos
          const confirmar = await notification.showConfirm({
            title: 'Cambios Extremos Detectados',
            message: `Se detectaron ${cambios.length} cambios extremos en las medidas.\n\n` +
              cambios.map(c => `• ${c.campo}: ${c.diferencia}cm de diferencia`).join('\n') +
              '\n\n¿Deseas continuar guardando estas medidas?',
            type: 'warning',
            confirmText: 'Sí, guardar',
            cancelText: 'Revisar'
          })

          if (!confirmar) {
            return
          }
        }
      }

      await crearMedida({
        id_cliente: clienteSeleccionado.id_cliente,
        tipo_medida: tipoMedidaSeleccionado,
        valores: datosMedidas.valores,
        etiqueta: datosMedidas.etiqueta
      })

      notification.success('Medidas guardadas correctamente')
      setVistaActual('historial')
      setTipoMedidaSeleccionado(null)
      setMedidasAnteriores(null)
      setCambiosExtremos([])

      // Recargar medidas
      await cargarMedidas(clienteSeleccionado.id_cliente)
    } catch (err) {
      notification.error(err.message)
    }
  }

  /**
   * Ver detalles de una medida
   */
  const handleVerDetalles = (medida) => {
    setMedidaSeleccionada(medida)
    setMostrarModal(true)
  }

  /**
   * Comparar con versión anterior
   */
  const handleComparar = (medidaActual) => {
    // Buscar la versión anterior del mismo tipo
    const medidasDelMismoTipo = medidas
      .filter(m => m.tipo_medida === medidaActual.tipo_medida)
      .sort((a, b) => new Date(b.fecha_toma) - new Date(a.fecha_toma))

    const indiceActual = medidasDelMismoTipo.findIndex(
      m => m.id_medida === medidaActual.id_medida
    )

    const anterior = medidasDelMismoTipo[indiceActual + 1]

    if (anterior) {
      setMedidaSeleccionada(medidaActual)
      setMedidaComparar(anterior)
      setMostrarComparacion(true)
    } else {
      notification.error('No hay versión anterior para comparar')
    }
  }

  /**
   * Eliminar medida
   */
  const handleEliminar = async (medida) => {
    const confirmar = await notification.showConfirm({
      title: 'Eliminar Medida',
      message: `¿Eliminar medida "${medida.etiqueta || 'sin etiqueta'}"?`,
      type: 'danger',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar'
    })

    if (!confirmar) {
      return
    }

    try {
      await eliminarMedida(medida.id_medida)
      notification.success('Medida eliminada correctamente')
      setMostrarModal(false)
    } catch (err) {
      notification.error(err.message)
    }
  }

  /**
   * Cancelar y volver
   */
  const handleCancelar = () => {
    if (vistaActual === 'formulario') {
      setVistaActual('historial')
      setTipoMedidaSeleccionado(null)
      setMedidasAnteriores(null)
    } else {
      setVistaActual('seleccion')
      setClienteSeleccionado(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Gestión de Medidas</h1>
        <p className="text-gray-600 mt-2">
          Historial de medidas y versionado por cliente
        </p>
      </div>

      {/* Error global */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-danger-50 text-danger-700 border border-danger-200">
          ⚠️ {error}
        </div>
      )}

      {/* VISTA: Selección de cliente */}
      {vistaActual === 'seleccion' && (
        <div>
          <Card>
            <div className="text-center py-8">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Selecciona un Cliente
              </h2>
              <p className="text-gray-500 mb-6">
                Elige el cliente para ver o tomar medidas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {clientes.map(cliente => (
                <button
                  key={cliente.id_cliente}
                  onClick={() => handleSeleccionarCliente(cliente)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-colors"
                >
                  <p className="font-semibold text-gray-900">{cliente.nombre}</p>
                  <p className="text-sm text-gray-500">{cliente.telefono}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* VISTA: Historial del cliente */}
      {vistaActual === 'historial' && clienteSeleccionado && (
        <div>
          {/* Info del cliente */}
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {clienteSeleccionado.nombre}
                </h2>
                <p className="text-gray-600">{clienteSeleccionado.telefono}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={() => handleTomarMedidas(TIPOS_MEDIDA.TORSO)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Medidas Torso
                </Button>

                <Button
                  variant="primary"
                  onClick={() => handleTomarMedidas(TIPOS_MEDIDA.PANTALON)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Medidas Pantalón
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCancelar}
                >
                  Cambiar Cliente
                </Button>
              </div>
            </div>
          </Card>

          {/* Lista de medidas */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Cargando medidas...</p>
            </div>
          ) : medidas.length === 0 ? (
            <Card className="text-center py-12">
              <Ruler className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay medidas registradas
              </h3>
              <p className="text-gray-500 mb-6">
                Comienza tomando las primeras medidas de este cliente
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Agrupar por tipo */}
              {[TIPOS_MEDIDA.TORSO, TIPOS_MEDIDA.PANTALON].map(tipo => {
                const medidasTipo = medidas.filter(m => m.tipo_medida === tipo)

                if (medidasTipo.length === 0) return null

                return (
                  <div key={tipo}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      Historial de {tipo}
                      <span className="text-sm font-normal text-gray-500">
                        ({medidasTipo.length} versiones)
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {medidasTipo.map(medida => (
                        <div key={medida.id_medida} className="relative">
                          <TarjetaMedida
                            medida={medida}
                            onClick={handleVerDetalles}
                          />
                          {medidasTipo.length > 1 && (
                            <button
                              onClick={() => handleComparar(medida)}
                              className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                              title="Comparar con versión anterior"
                            >
                              <GitCompare className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA: Formulario de toma de medidas */}
      {vistaActual === 'formulario' && (
        <Card className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">
            Tomar Medidas de {tipoMedidaSeleccionado}
          </h2>
          <p className="text-gray-600 mb-6">
            Cliente: <strong>{clienteSeleccionado.nombre}</strong>
          </p>

          <FormularioMedidas
            tipoMedida={tipoMedidaSeleccionado}
            medidasAnteriores={medidasAnteriores}
            onGuardar={handleGuardarMedidas}
            onCancelar={handleCancelar}
            loading={loading}
            cambiosExtremos={cambiosExtremos}
          />
        </Card>
      )}

      {/* Modal de detalles */}
      {mostrarModal && medidaSeleccionada && (
        <ModalDetallesMedida
          medida={medidaSeleccionada}
          onCerrar={() => setMostrarModal(false)}
          onEditar={(medida) => {
            // TODO: Implementar edición
            notification.info('Edición no implementada aún')
          }}
          onEliminar={handleEliminar}
        />
      )}

      {/* Modal de comparación */}
      {mostrarComparacion && medidaSeleccionada && medidaComparar && (
        <ModalComparacion
          medidaActual={medidaSeleccionada}
          medidaAnterior={medidaComparar}
          onCerrar={() => {
            setMostrarComparacion(false)
            setMedidaComparar(null)
          }}
        />
      )}
    </div>
  )
}
