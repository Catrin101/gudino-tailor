import { useState, useEffect } from 'react'
import { ClienteService } from '../services/ClienteService'

/**
 * Hook personalizado para gestión de clientes
 */
export function useClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const service = new ClienteService()

  /**
   * Cargar todos los clientes
   */
  const cargarClientes = async (incluirInactivos = false) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await service.obtenerTodos(incluirInactivos)
      setClientes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Buscar clientes
   */
  const buscarClientes = async (termino) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await service.buscar(termino)
      setClientes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Crear cliente
   */
  const crearCliente = async (cliente) => {
    setLoading(true)
    setError(null)
    
    try {
      const nuevoCliente = await service.crear(cliente)
      setClientes(prev => [...prev, nuevoCliente])
      return nuevoCliente
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Actualizar cliente
   */
  const actualizarCliente = async (id, datosActualizados) => {
    setLoading(true)
    setError(null)
    
    try {
      const clienteActualizado = await service.actualizar(id, datosActualizados)
      setClientes(prev => 
        prev.map(c => c.id_cliente === id ? clienteActualizado : c)
      )
      return clienteActualizado
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Desactivar cliente
   */
  const desactivarCliente = async (id) => {
    setLoading(true)
    setError(null)
    
    try {
      await service.desactivar(id)
      setClientes(prev => prev.filter(c => c.id_cliente !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes()
  }, [])

  return {
    clientes,
    loading,
    error,
    cargarClientes,
    buscarClientes,
    crearCliente,
    actualizarCliente,
    desactivarCliente
  }
}
