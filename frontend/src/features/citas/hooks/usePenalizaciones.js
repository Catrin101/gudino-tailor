import { useState } from 'react'
import { PenalizacionService } from '../services/PenalizacionService'

/**
 * Hook para gestión de penalizaciones
 */
export function usePenalizaciones() {
  const [penalizaciones, setPenalizaciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [comportamiento, setComportamiento] = useState(null)

  const service = new PenalizacionService()

  /**
   * Cargar penalizaciones pendientes (vista de Pagos)
   */
  const cargarPendientes = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await service.obtenerTodasPendientes()
      setPenalizaciones(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cargar penalizaciones pendientes de un cliente
   */
  const cargarPendientesCliente = async (idCliente) => {
    setLoading(true)
    setError(null)
    try {
      const data = await service.obtenerPendientesPorCliente(idCliente)
      setPenalizaciones(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cargar historial de comportamiento de un cliente
   */
  const cargarComportamiento = async (idCliente) => {
    setLoading(true)
    setError(null)
    try {
      const historial = await service.obtenerHistorialPorCliente(idCliente)
      const calc = service.calcularComportamiento(historial)
      setComportamiento(calc)
      return calc
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cobrar una penalización
   */
  const cobrar = async (idPenalizacion, idPedido = null, notas = '') => {
    setLoading(true)
    setError(null)
    try {
      const resultado = await service.cobrar(idPenalizacion, idPedido, notas)
      await cargarPendientes()
      return resultado
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Condonar una penalización
   */
  const condonar = async (idPenalizacion, motivo) => {
    setLoading(true)
    setError(null)
    try {
      const resultado = await service.condonar(idPenalizacion, motivo)
      await cargarPendientes()
      return resultado
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    penalizaciones,
    loading,
    error,
    comportamiento,
    cargarPendientes,
    cargarPendientesCliente,
    cargarComportamiento,
    cobrar,
    condonar
  }
}
