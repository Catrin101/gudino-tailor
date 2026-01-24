import { useState, useEffect } from 'react'
import { PedidoService } from '../services/PedidoService'

/**
 * Hook personalizado para gestión de pedidos
 */
export function usePedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const service = new PedidoService()

  /**
   * Cargar todos los pedidos
   */
  const cargarPedidos = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await service.obtenerTodos()
      setPedidos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Crear pedido
   */
  const crearPedido = async (datosPedido) => {
    setLoading(true)
    setError(null)

    try {
      const nuevoPedido = await service.crear(datosPedido)
      setPedidos(prev => [nuevoPedido, ...prev])
      return nuevoPedido
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Actualizar pedido
   */
  const actualizarPedido = async (id, datosActualizados) => {
    setLoading(true)
    setError(null)

    try {
      const pedidoActualizado = await service.actualizar(id, datosActualizados)
      setPedidos(prev =>
        prev.map(p => p.id_pedido === id ? pedidoActualizado : p)
      )
      return pedidoActualizado
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cambiar estado de pedido
   */
  const cambiarEstado = async (id, nuevoEstado) => {
    setLoading(true)
    setError(null)

    try {
      const pedidoActualizado = await service.cambiarEstado(id, nuevoEstado)
      setPedidos(prev =>
        prev.map(p => p.id_pedido === id ? pedidoActualizado : p)
      )
      return pedidoActualizado
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Eliminar pedido
   */
  const eliminarPedido = async (id, motivo) => {
    setLoading(true)
    setError(null)

    try {
      await service.eliminar(id, {
        motivo,
        usuario_id: null // TODO: Obtener del contexto de autenticación
      })
      setPedidos(prev => prev.filter(p => p.id_pedido !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Buscar pedidos
   */
  const buscarPedidos = async (termino) => {
    setLoading(true)
    setError(null)

    try {
      const data = await service.buscar(termino)
      setPedidos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtener pedidos por estado
   */
  const obtenerPorEstado = async (estado) => {
    try {
      return await service.obtenerPorEstado(estado)
    } catch (err) {
      setError(err.message)
      return []
    }
  }

  /**
   * Obtener pedido por ID
   */
  const obtenerPorId = async (id) => {
    try {
      return await service.obtenerPorId(id)
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  // Cargar pedidos al montar
  useEffect(() => {
    cargarPedidos()
  }, [])

  return {
    pedidos,
    loading,
    error,
    cargarPedidos,
    crearPedido,
    actualizarPedido,
    cambiarEstado,
    eliminarPedido,
    buscarPedidos,
    obtenerPorEstado,
    obtenerPorId
  }
}
