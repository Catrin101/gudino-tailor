import { useState, useEffect } from 'react'
import { PagoService } from '../services/PagoService'

/**
 * Hook personalizado para gestión de pagos
 */
export function usePagos() {
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resumenDia, setResumenDia] = useState(null)

  const service = new PagoService()

  /**
   * Registrar nuevo pago
   */
  const registrarPago = async (datoPago) => {
    setLoading(true)
    setError(null)

    try {
      const nuevoPago = await service.registrar(datoPago)
      setPagos(prev => [nuevoPago, ...prev])
      return nuevoPago
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtener pagos por pedido
   */
  const cargarPagosPorPedido = async (idPedido) => {
    setLoading(true)
    setError(null)

    try {
      const data = await service.obtenerPorPedido(idPedido)
      setPagos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtener pagos por cliente
   */
  const cargarPagosPorCliente = async (idCliente) => {
    setLoading(true)
    setError(null)

    try {
      const data = await service.obtenerPorCliente(idCliente)
      setPagos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtener pagos por rango de fechas
   */
  const cargarPagosPorFechas = async (fechaInicio, fechaFin) => {
    setLoading(true)
    setError(null)

    try {
      const data = await service.obtenerPorRangoFechas(fechaInicio, fechaFin)
      setPagos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cargar resumen del día
   */
  const cargarResumenDia = async () => {
    try {
      const data = await service.obtenerResumenDia()
      setResumenDia(data)
    } catch (err) {
      setError(err.message)
    }
  }

  /**
   * Eliminar pago
   */
  const eliminarPago = async (id) => {
    setLoading(true)
    setError(null)

    try {
      await service.eliminar(id)
      setPagos(prev => prev.filter(p => p.id_pago !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    pagos,
    loading,
    error,
    resumenDia,
    registrarPago,
    cargarPagosPorPedido,
    cargarPagosPorCliente,
    cargarPagosPorFechas,
    cargarResumenDia,
    eliminarPago
  }
}
