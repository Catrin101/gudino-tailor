import { supabase } from '../../../core/config/supabase'

/**
 * Repositorio para operaciones CRUD de pagos en Supabase
 */
export class PagoRepository {
  /**
   * Obtener todos los pagos de un pedido
   * @param {number} idPedido
   * @returns {Promise<Array>}
   */
  async obtenerPorPedido(idPedido) {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('id_pedido', idPedido)
      .order('fecha_pago', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener pagos: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtener pagos de un cliente (a través de sus pedidos)
   * @param {number} idCliente
   * @returns {Promise<Array>}
   */
  async obtenerPorCliente(idCliente) {
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        pedidos!inner (
          id_cliente,
          id_pedido,
          tipo_servicio
        )
      `)
      .eq('pedidos.id_cliente', idCliente)
      .order('fecha_pago', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener pagos del cliente: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtener pagos por rango de fechas
   * @param {string} fechaInicio
   * @param {string} fechaFin
   * @returns {Promise<Array>}
   */
  async obtenerPorRangoFechas(fechaInicio, fechaFin) {
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        pedidos (
          id_pedido,
          tipo_servicio,
          clientes (
            nombre
          )
        )
      `)
      .gte('fecha_pago', fechaInicio)
      .lte('fecha_pago', fechaFin)
      .order('fecha_pago', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener pagos por fecha: ${error.message}`)
    }

    return data || []
  }

  /**
   * Registrar nuevo pago
   * @param {Object} pago
   * @returns {Promise<Object>}
   */
  async crear(pago) {
    const { data, error } = await supabase
      .from('pagos')
      .insert([{
        id_pedido: pago.id_pedido,
        monto: pago.monto,
        concepto: pago.concepto,
        metodo: pago.metodo,
        notas: pago.notas || null,
        registrado_por: pago.registrado_por || null
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Error al registrar pago: ${error.message}`)
    }

    return data
  }

  /**
   * Obtener pago por ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async obtenerPorId(id) {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('id_pago', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al obtener pago: ${error.message}`)
    }

    return data
  }

  /**
   * Actualizar pago
   * @param {number} id
   * @param {Object} datosActualizados
   * @returns {Promise<Object>}
   */
  async actualizar(id, datosActualizados) {
    const { data, error } = await supabase
      .from('pagos')
      .update(datosActualizados)
      .eq('id_pago', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar pago: ${error.message}`)
    }

    return data
  }

  /**
   * Eliminar pago
   * @param {number} id
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    const { error } = await supabase
      .from('pagos')
      .delete()
      .eq('id_pago', id)

    if (error) {
      throw new Error(`Error al eliminar pago: ${error.message}`)
    }
  }

  /**
   * Obtener resumen de pagos del día
   * @returns {Promise<Object>}
   */
  async obtenerResumenDia() {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const manana = new Date(hoy)
    manana.setDate(manana.getDate() + 1)

    const { data, error } = await supabase
      .from('pagos')
      .select('monto, metodo, concepto')
      .gte('fecha_pago', hoy.toISOString())
      .lt('fecha_pago', manana.toISOString())

    if (error) {
      throw new Error(`Error al obtener resumen del día: ${error.message}`)
    }

    const totalEfectivo = data
      ?.filter(p => p.metodo === 'Efectivo')
      .reduce((sum, p) => sum + parseFloat(p.monto), 0) || 0

    const totalTarjeta = data
      ?.filter(p => p.metodo === 'Tarjeta')
      .reduce((sum, p) => sum + parseFloat(p.monto), 0) || 0

    const totalTransferencia = data
      ?.filter(p => p.metodo === 'Transferencia')
      .reduce((sum, p) => sum + parseFloat(p.monto), 0) || 0

    const anticipos = data?.filter(p => p.concepto === 'Anticipo').length || 0
    const abonos = data?.filter(p => p.concepto === 'Abono').length || 0
    const liquidaciones = data?.filter(p => p.concepto === 'Liquidacion').length || 0

    return {
      totalEfectivo,
      totalTarjeta,
      totalTransferencia,
      totalGeneral: totalEfectivo + totalTarjeta + totalTransferencia,
      cantidadTransacciones: data?.length || 0,
      anticipos,
      abonos,
      liquidaciones
    }
  }

  /**
   * Obtener total pagado de un pedido
   * @param {number} idPedido
   * @returns {Promise<number>}
   */
  async obtenerTotalPagado(idPedido) {
    const { data, error } = await supabase
      .from('pagos')
      .select('monto')
      .eq('id_pedido', idPedido)

    if (error) {
      throw new Error(`Error al calcular total pagado: ${error.message}`)
    }

    return data?.reduce((sum, p) => sum + parseFloat(p.monto), 0) || 0
  }
}
