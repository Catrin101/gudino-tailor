import { useState, useEffect } from 'react'
import { MedidaService } from '../services/MedidaService'

/**
 * Hook personalizado para gestión de medidas
 */
export function useMedidas(idCliente = null) {
  const [medidas, setMedidas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const service = new MedidaService()

  /**
   * Cargar medidas de un cliente
   */
  const cargarMedidas = async (clienteId) => {
    if (!clienteId) return

    setLoading(true)
    setError(null)

    try {
      const data = await service.obtenerPorCliente(clienteId)
      setMedidas(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Crear nueva medida
   */
  const crearMedida = async (medida) => {
    setLoading(true)
    setError(null)

    try {
      const nuevaMedida = await service.crear(medida)
      setMedidas(prev => [nuevaMedida, ...prev])
      return nuevaMedida
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Actualizar medida (crea nueva versión)
   */
  const actualizarMedida = async (idAnterior, nuevosValores) => {
    setLoading(true)
    setError(null)

    try {
      const medidaActualizada = await service.actualizarCreandoVersion(
        idAnterior,
        nuevosValores
      )
      // Recargar medidas
      if (idCliente) {
        await cargarMedidas(idCliente)
      }
      return medidaActualizada
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Eliminar medida
   */
  const eliminarMedida = async (id) => {
    setLoading(true)
    setError(null)

    try {
      await service.eliminar(id)
      setMedidas(prev => prev.filter(m => m.id_medida !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtener últimas medidas por tipo
   */
  const obtenerUltimasPorTipo = async (clienteId, tipoMedida) => {
    try {
      return await service.obtenerUltimasPorTipo(clienteId, tipoMedida)
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  // Cargar medidas al montar el componente si se proporciona idCliente
  useEffect(() => {
    if (idCliente) {
      cargarMedidas(idCliente)
    }
  }, [idCliente])

  return {
    medidas,
    loading,
    error,
    cargarMedidas,
    crearMedida,
    actualizarMedida,
    eliminarMedida,
    obtenerUltimasPorTipo
  }
}
