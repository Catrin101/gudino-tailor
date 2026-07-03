import { useState, useCallback } from 'react'
import { CitaService } from '../services/CitaService'
import { useNotification } from '../../../shared/context/NotificationContext'

const service = new CitaService()

export function useCitas() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const notification = useNotification()

  const ejecutar = useCallback(async (operacion, mensajeExito) => {
    setLoading(true)
    setError(null)
    try {
      const resultado = await operacion()
      if (mensajeExito) {
        notification.success(mensajeExito)
      }
      return resultado
    } catch (err) {
      const msg = err.message || 'Ocurrió un error'
      setError(msg)
      notification.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [notification])

  const crearCita = useCallback((datos) =>
    ejecutar(() => service.crear(datos), 'Cita creada correctamente')
  , [ejecutar])

  const moverCita = useCallback((id, nuevaInicio, nuevaFin) =>
    ejecutar(() => service.mover(id, nuevaInicio, nuevaFin), 'Cita reprogramada')
  , [ejecutar])

  const cancelarCita = useCallback((id, canceladaPor = 'Cliente', condonar = false, motivo = '') =>
    ejecutar(() => service.cancelar(id, canceladaPor, condonar, motivo), 'Cita cancelada')
  , [ejecutar])

  const marcarNoShow = useCallback((id) =>
    ejecutar(() => service.marcarNoShow(id), 'No Show registrado')
  , [ejecutar])

  const confirmarCita = useCallback((id) =>
    ejecutar(() => service.confirmar(id), 'Cita confirmada')
  , [ejecutar])

  const completarCita = useCallback((id) =>
    ejecutar(() => service.completar(id), 'Cita completada')
  , [ejecutar])

  const condonarPenalizacion = useCallback((idPenalizacion, motivo) =>
    ejecutar(() => service.condonarPenalizacion(idPenalizacion, motivo), 'Penalización condonada')
  , [ejecutar])

  const cobrarPenalizacion = useCallback((idPenalizacion, notas) =>
    ejecutar(() => service.cobrarPenalizacion(idPenalizacion, notas), 'Penalización cobrada')
  , [ejecutar])

  const obtenerCitasPorDia = useCallback(async (fecha) => {
    setLoading(true)
    setError(null)
    try {
      return await service.obtenerPorFecha(fecha)
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const obtenerCitasPorRango = useCallback(async (inicio, fin) => {
    setLoading(true)
    setError(null)
    try {
      return await service.obtenerPorRangoFechas(inicio, fin)
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const obtenerCitaPorId = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      return await service.obtenerPorId(id)
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const obtenerHistorialCliente = useCallback(async (idCliente) => {
    setLoading(true)
    setError(null)
    try {
      return await service.obtenerPorCliente(idCliente)
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const obtenerPenalizacionesPendientes = useCallback(async (idCliente) => {
    try {
      return await service.obtenerPenalizacionesPendientes(idCliente)
    } catch {
      return []
    }
  }, [])

  const calcularPenalizacionCancelacion = useCallback((fechaHora) => {
    return service.calcularPenalizacionCancelacion(fechaHora)
  }, [])

  const calcularPenalizacionMovimiento = useCallback(async (fechaHora) => {
    return await service.calcularPenalizacionMovimiento(fechaHora)
  }, [])

  return {
    loading,
    error,
    crearCita,
    moverCita,
    cancelarCita,
    marcarNoShow,
    confirmarCita,
    completarCita,
    condonarPenalizacion,
    cobrarPenalizacion,
    obtenerCitasPorDia,
    obtenerCitasPorRango,
    obtenerCitaPorId,
    obtenerHistorialCliente,
    obtenerPenalizacionesPendientes,
    calcularPenalizacionCancelacion,
    calcularPenalizacionMovimiento
  }
}
