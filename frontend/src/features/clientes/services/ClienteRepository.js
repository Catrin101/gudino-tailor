import { supabase } from '../../../core/config/supabase'

/**
 * Repositorio para operaciones CRUD de clientes en Supabase
 * Maneja toda la comunicación con la base de datos
 */
export class ClienteRepository {
  /**
   * Obtener todos los clientes activos
   * @param {boolean} incluirInactivos - Si se deben incluir clientes inactivos
   * @returns {Promise<Array>}
   */
  async obtenerTodos(incluirInactivos = false) {
    let query = supabase
      .from('clientes')
      .select('*')
      .order('nombre', { ascending: true })

    if (!incluirInactivos) {
      query = query.eq('activo', true)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener clientes: ${error.message}`)
    }

    return data || []
  }

  /**
   * Buscar cliente por ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async obtenerPorId(id) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id_cliente', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Cliente no encontrado
      }
      throw new Error(`Error al obtener cliente: ${error.message}`)
    }

    return data
  }

  /**
   * Buscar clientes por nombre o teléfono
   * @param {string} termino
   * @returns {Promise<Array>}
   */
  async buscar(termino) {
    if (!termino || termino.trim() === '') {
      return this.obtenerTodos()
    }

    const terminoBusqueda = `%${termino}%`

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`nombre.ilike.${terminoBusqueda},telefono.ilike.${terminoBusqueda}`)
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) {
      throw new Error(`Error al buscar clientes: ${error.message}`)
    }

    return data || []
  }

  /**
   * Crear nuevo cliente
   * @param {Object} cliente - Datos del cliente
   * @returns {Promise<Object>}
   */
  async crear(cliente) {
    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        notas_generales: cliente.notas_generales || null,
        deuda_historica: cliente.deuda_historica || 0
      }])
      .select()
      .single()

    if (error) {
      // Error de teléfono duplicado
      if (error.code === '23505') {
        throw new Error('Ya existe un cliente con este teléfono')
      }
      throw new Error(`Error al crear cliente: ${error.message}`)
    }

    return data
  }

  /**
   * Actualizar cliente existente
   * @param {number} id
   * @param {Object} datosActualizados
   * @returns {Promise<Object>}
   */
  async actualizar(id, datosActualizados) {
    const { data, error } = await supabase
      .from('clientes')
      .update(datosActualizados)
      .eq('id_cliente', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe un cliente con este teléfono')
      }
      throw new Error(`Error al actualizar cliente: ${error.message}`)
    }

    return data
  }

  /**
   * Desactivar cliente (soft delete)
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async desactivar(id) {
    return this.actualizar(id, { activo: false })
  }

  /**
   * Reactivar cliente
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async reactivar(id) {
    return this.actualizar(id, { activo: true })
  }

  /**
   * Verificar si un cliente tiene pedidos activos con saldo pendiente
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async tienePedidosActivos(id) {
    const { data, error } = await supabase
      .from('pedidos')
      .select('id_pedido')
      .eq('id_cliente', id)
      .neq('estado', 'Entregado')
      .gt('saldo_pendiente', 0)
      .limit(1)

    if (error) {
      throw new Error(`Error al verificar pedidos: ${error.message}`)
    }

    return data && data.length > 0
  }

  /**
   * Obtener estadísticas del cliente
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async obtenerEstadisticas(id) {
    // Total de pedidos
    const { count: totalPedidos } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('id_cliente', id)

    // Saldo pendiente total
    const { data: pedidosActivos } = await supabase
      .from('pedidos')
      .select('saldo_pendiente')
      .eq('id_cliente', id)
      .neq('estado', 'Entregado')

    const saldoTotal = pedidosActivos?.reduce((sum, p) => sum + parseFloat(p.saldo_pendiente), 0) || 0

    // Último pedido
    const { data: ultimoPedido } = await supabase
      .from('pedidos')
      .select('fecha_creacion')
      .eq('id_cliente', id)
      .order('fecha_creacion', { ascending: false })
      .limit(1)
      .single()

    return {
      totalPedidos: totalPedidos || 0,
      saldoPendiente: saldoTotal,
      ultimoPedido: ultimoPedido?.fecha_creacion || null
    }
  }
}
