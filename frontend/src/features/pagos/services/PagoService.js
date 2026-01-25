import { PagoRepository } from './PagoRepository'
import { supabase } from '../../../core/config/supabase'

/**
 * Servicio de lógica de negocio para pagos
 */
export class PagoService {
  constructor() {
    this.repository = new PagoRepository()
  }

  /**
   * Validar datos del pago
   * @param {Object} pago
   * @param {Object} pedido
   * @returns {Object} { valido: boolean, errores: Object, advertencias: Array }
   */
  async validar(pago, pedido) {
    const errores = {}
    const advertencias = []

    // Validar monto
    if (!pago.monto || pago.monto <= 0) {
      errores.monto = 'El monto debe ser mayor a 0'
    }

    // Validar concepto
    if (!pago.concepto) {
      errores.concepto = 'El concepto es obligatorio'
    }

    // Validar método
    if (!pago.metodo) {
      errores.metodo = 'El método de pago es obligatorio'
    }

    // Detectar sobrepago
    if (pago.monto && pedido) {
      const totalPagado = await this.repository.obtenerTotalPagado(pedido.id_pedido)
      const nuevoTotal = totalPagado + parseFloat(pago.monto)
      
      if (nuevoTotal > parseFloat(pedido.costo_total)) {
        const excedente = nuevoTotal - parseFloat(pedido.costo_total)
        advertencias.push({
          tipo: 'sobrepago',
          mensaje: `El cliente pagaría $${excedente.toFixed(2)} de más`,
          excedente: excedente,
          detalles: {
            costoTotal: parseFloat(pedido.costo_total),
            totalPagado: totalPagado,
            nuevoPago: parseFloat(pago.monto),
            nuevoTotal: nuevoTotal
          }
        })
      }
    }

    return {
      valido: Object.keys(errores).length === 0,
      errores,
      advertencias
    }
  }

  /**
   * Registrar nuevo pago
   * @param {Object} datoPago
   * @returns {Promise<Object>}
   */
  async registrar(datoPago) {
    // Obtener información del pedido
    const { data: pedido, error: errorPedido } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id_pedido', datoPago.id_pedido)
      .single()

    if (errorPedido || !pedido) {
      throw new Error('Pedido no encontrado')
    }

    // Validar
    const validacion = await this.validar(datoPago, pedido)
    if (!validacion.valido) {
      throw new Error(JSON.stringify(validacion.errores))
    }

    // Si hay advertencias de sobrepago, el servicio las retorna
    // La UI debe manejar la confirmación
    if (validacion.advertencias.length > 0) {
      const sobrepago = validacion.advertencias.find(a => a.tipo === 'sobrepago')
      if (sobrepago && !datoPago.confirmarSobrepago) {
        const error = new Error('Sobrepago detectado')
        error.advertencias = validacion.advertencias
        throw error
      }
    }

    // Registrar el pago
    const nuevoPago = await this.repository.crear(datoPago)

    // El trigger de la BD actualizará automáticamente el saldo_pendiente
    // Retornar el pago creado
    return nuevoPago
  }

  /**
   * Obtener pagos por pedido
   * @param {number} idPedido
   * @returns {Promise<Array>}
   */
  async obtenerPorPedido(idPedido) {
    return await this.repository.obtenerPorPedido(idPedido)
  }

  /**
   * Obtener pagos por cliente
   * @param {number} idCliente
   * @returns {Promise<Array>}
   */
  async obtenerPorCliente(idCliente) {
    return await this.repository.obtenerPorCliente(idCliente)
  }

  /**
   * Obtener pagos por rango de fechas
   * @param {string} fechaInicio
   * @param {string} fechaFin
   * @returns {Promise<Array>}
   */
  async obtenerPorRangoFechas(fechaInicio, fechaFin) {
    return await this.repository.obtenerPorRangoFechas(fechaInicio, fechaFin)
  }

  /**
   * Actualizar pago (Solo Admin)
   * @param {number} id
   * @param {Object} datosActualizados
   * @returns {Promise<Object>}
   */
  async actualizar(id, datosActualizados) {
    return await this.repository.actualizar(id, datosActualizados)
  }

  /**
   * Eliminar pago (Solo Admin)
   * @param {number} id
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    return await this.repository.eliminar(id)
  }

  /**
   * Obtener resumen del día
   * @returns {Promise<Object>}
   */
  async obtenerResumenDia() {
    return await this.repository.obtenerResumenDia()
  }

  /**
   * Obtener total pagado de un pedido
   * @param {number} idPedido
   * @returns {Promise<number>}
   */
  async obtenerTotalPagado(idPedido) {
    return await this.repository.obtenerTotalPagado(idPedido)
  }
}
