import { supabase } from '../../../core/config/supabase'

/**
 * Repositorio para operaciones CRUD de pedidos en Supabase
 */
export class PedidoRepository {
  /**
   * Obtener todos los pedidos
   * @param {boolean} incluirEliminados
   * @returns {Promise<Array>}
   */
  async obtenerTodos(incluirEliminados = false) {
    let query = supabase
      .from('pedidos')
      .select(`
        *,
        clientes (
          id_cliente,
          nombre,
          telefono
        )
      `)
      .order('fecha_creacion', { ascending: false })

    if (!incluirEliminados) {
      query = query.eq('eliminado', false)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener pedidos: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtener pedido por ID con relaciones completas
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async obtenerPorId(id) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        clientes (
          id_cliente,
          nombre,
          telefono,
          notas_generales
        ),
        detalles_pedido (
          *,
          medidas (
            *
          )
        ),
        pagos (
          *
        )
      `)
      .eq('id_pedido', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al obtener pedido: ${error.message}`)
    }

    return data
  }

  /**
   * Obtener pedidos por cliente
   * @param {number} idCliente
   * @returns {Promise<Array>}
   */
  async obtenerPorCliente(idCliente) {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id_cliente', idCliente)
      .eq('eliminado', false)
      .order('fecha_creacion', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener pedidos del cliente: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtener pedidos por estado
   * @param {string} estado
   * @returns {Promise<Array>}
   */
  async obtenerPorEstado(estado) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        clientes (
          nombre,
          telefono
        )
      `)
      .eq('estado', estado)
      .eq('eliminado', false)
      .order('fecha_promesa', { ascending: true })

    if (error) {
      throw new Error(`Error al obtener pedidos por estado: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtener pedidos de un grupo
   * @param {string} nombreGrupo
   * @returns {Promise<Array>}
   */
  async obtenerPorGrupo(nombreGrupo) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        clientes (
          nombre,
          telefono
        )
      `)
      .eq('nombre_grupo', nombreGrupo)
      .eq('eliminado', false)
      .order('fecha_creacion', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener pedidos del grupo: ${error.message}`)
    }

    return data || []
  }

  /**
   * Crear nuevo pedido
   * @param {Object} pedido
   * @returns {Promise<Object>}
   */
  async crear(pedido) {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([pedido])
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear pedido: ${error.message}`)
    }

    return data
  }

  /**
   * Crear detalles del pedido
   * @param {Array} detalles
   * @returns {Promise<Array>}
   */
  async crearDetalles(detalles) {
    const { data, error } = await supabase
      .from('detalles_pedido')
      .insert(detalles)
      .select()

    if (error) {
      throw new Error(`Error al crear detalles del pedido: ${error.message}`)
    }

    return data
  }

  /**
   * Actualizar pedido
   * @param {number} id
   * @param {Object} datosActualizados
   * @returns {Promise<Object>}
   */
  async actualizar(id, datosActualizados) {
    const { data, error } = await supabase
      .from('pedidos')
      .update(datosActualizados)
      .eq('id_pedido', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar pedido: ${error.message}`)
    }

    return data
  }

  /**
   * Cambiar estado del pedido
   * @param {number} id
   * @param {string} nuevoEstado
   * @returns {Promise<Object>}
   */
  async cambiarEstado(id, nuevoEstado) {
    return this.actualizar(id, {
      estado: nuevoEstado,
      fecha_ultimo_contacto: new Date().toISOString()
    })
  }

  /**
   * Eliminar pedido (soft delete)
   * @param {number} id
   * @param {Object} datosEliminacion
   * @returns {Promise<Object>}
   */
  async eliminar(id, datosEliminacion) {
    return this.actualizar(id, {
      eliminado: true,
      fecha_eliminacion: new Date().toISOString(),
      motivo_eliminacion: datosEliminacion.motivo,
      eliminado_por: datosEliminacion.usuario_id
    })
  }

  /**
   * Buscar pedidos
   * @param {string} termino
   * @returns {Promise<Array>}
   */
  async buscar(termino) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        clientes (
          nombre,
          telefono
        )
      `)
      .or(`nombre_grupo.ilike.%${termino}%,id_pedido.eq.${parseInt(termino) || 0}`)
      .eq('eliminado', false)
      .order('fecha_creacion', { ascending: false })
      .limit(20)

    if (error) {
      throw new Error(`Error al buscar pedidos: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtener estadísticas de pedidos
   * @returns {Promise<Object>}
   */
  async obtenerEstadisticas() {
    // Total de pedidos activos
    const { count: totalActivos } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('eliminado', false)
      .neq('estado', 'Entregado')

    // Pedidos con saldo pendiente
    const { data: conSaldo } = await supabase
      .from('pedidos')
      .select('saldo_pendiente')
      .eq('eliminado', false)
      .neq('estado', 'Entregado')
      .gt('saldo_pendiente', 0)

    const saldoTotal = conSaldo?.reduce((sum, p) => sum + parseFloat(p.saldo_pendiente), 0) || 0

    // Pedidos vencidos
    const hoy = new Date().toISOString()
    const { count: vencidos } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('eliminado', false)
      .neq('estado', 'Entregado')
      .lt('fecha_promesa', hoy)

    return {
      totalActivos: totalActivos || 0,
      totalConSaldo: conSaldo?.length || 0,
      saldoTotal,
      pedidosVencidos: vencidos || 0
    }
  }
}
