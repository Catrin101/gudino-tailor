import { PedidoRepository } from './PedidoRepository'
import { TIPOS_SERVICIO, ESTADOS_PEDIDO } from '../../../core/constants/estados'
import { supabase } from '../../../core/config/supabase'
/**
 * Servicio de lógica de negocio para pedidos
 */
export class PedidoService {
  constructor() {
    this.repository = new PedidoRepository()
  }

  /**
   * Validar datos del pedido
   * @param {Object} pedido
   * @returns {Object} { valido: boolean, errores: Object }
   */
  validar(pedido) {
    const errores = {}

    // Validar cliente
    if (!pedido.id_cliente) {
      errores.cliente = 'El cliente es obligatorio'
    }

    // Validar tipo de servicio
    if (!pedido.tipo_servicio) {
      errores.tipo_servicio = 'El tipo de servicio es obligatorio'
    } else if (!Object.values(TIPOS_SERVICIO).includes(pedido.tipo_servicio)) {
      errores.tipo_servicio = 'Tipo de servicio inválido'
    }

    // Validar costo total
    if (!pedido.costo_total || pedido.costo_total <= 0) {
      errores.costo_total = 'El costo total debe ser mayor a 0'
    }

    // Validar anticipo
    if (pedido.anticipo === undefined || pedido.anticipo <= 0) {
      errores.anticipo = 'El anticipo es obligatorio y debe ser mayor a 0'
    } else if (pedido.anticipo > pedido.costo_total) {
      errores.anticipo = 'El anticipo no puede ser mayor al costo total'
    }

    // Validar fecha promesa
    if (!pedido.fecha_promesa) {
      errores.fecha_promesa = 'La fecha de entrega es obligatoria'
    } else {
      const fechaPromesa = new Date(pedido.fecha_promesa)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      
      if (fechaPromesa < hoy) {
        errores.fecha_promesa = 'La fecha de entrega no puede ser en el pasado'
      }
    }

    // Validaciones específicas por tipo de servicio
    if (pedido.tipo_servicio === TIPOS_SERVICIO.CONFECCION) {
      if (!pedido.detalles || pedido.detalles.length === 0) {
        errores.detalles = 'Debe especificar al menos una prenda'
      }
      
      // Verificar que cada detalle tenga medidas
      if (pedido.detalles) {
        pedido.detalles.forEach((detalle, idx) => {
          if (!detalle.id_medida) {
            errores[`detalle_${idx}`] = 'Cada prenda debe tener medidas asociadas'
          }
        })
      }
    }

    if (pedido.tipo_servicio === TIPOS_SERVICIO.REMIENDO) {
      if (!pedido.descripcion || pedido.descripcion.trim() === '') {
        errores.descripcion = 'Debe especificar las instrucciones del remiendo'
      }
    }

    if (pedido.tipo_servicio === TIPOS_SERVICIO.RENTA) {
      if (!pedido.fecha_evento) {
        errores.fecha_evento = 'La fecha del evento es obligatoria'
      }
      if (!pedido.fecha_devolucion) {
        errores.fecha_devolucion = 'La fecha de devolución es obligatoria'
      }
      
      if (pedido.fecha_evento && pedido.fecha_devolucion) {
        if (new Date(pedido.fecha_devolucion) <= new Date(pedido.fecha_evento)) {
          errores.fecha_devolucion = 'La devolución debe ser posterior al evento'
        }
      }
    }

    return {
      valido: Object.keys(errores).length === 0,
      errores
    }
  }

  /**
   * Crear pedido completo con detalles y pago inicial
   * @param {Object} datosPedido
   * @returns {Promise<Object>}
   */
  async crear(datosPedido) {
    // Validar datos
    const validacion = this.validar(datosPedido)
    if (!validacion.valido) {
      throw new Error(JSON.stringify(validacion.errores))
    }

    try {
      // 1. Generar UUID de grupo si aplica
      const idGrupo = datosPedido.nombre_grupo 
        ? crypto.randomUUID() 
        : null

      // 2. Crear el pedido principal
      const pedido = await this.repository.crear({
        id_cliente: datosPedido.id_cliente,
        tipo_servicio: datosPedido.tipo_servicio,
        nombre_grupo: datosPedido.nombre_grupo || null,
        id_grupo: idGrupo,
        estado: ESTADOS_PEDIDO.EN_ESPERA,
        costo_total: datosPedido.costo_total,
        saldo_pendiente: datosPedido.costo_total - datosPedido.anticipo,
        fecha_promesa: datosPedido.fecha_promesa
      })

      // 3. Crear detalles según el tipo de servicio
      if (datosPedido.detalles && datosPedido.detalles.length > 0) {
        const detalles = datosPedido.detalles.map(detalle => ({
          id_pedido: pedido.id_pedido,
          id_medida: detalle.id_medida || null,
          tipo_prenda: detalle.tipo_prenda,
          descripcion: detalle.descripcion || null,
          fecha_evento: datosPedido.fecha_evento || null,
          fecha_devolucion: datosPedido.fecha_devolucion || null
        }))

        await this.repository.crearDetalles(detalles)
      }

      // 4. Registrar el pago inicial (anticipo)
      const { data: pago, error: errorPago } = await supabase
        .from('pagos')
        .insert([{
          id_pedido: pedido.id_pedido,
          monto: datosPedido.anticipo,
          concepto: 'Anticipo',
          metodo: datosPedido.metodo_pago || 'Efectivo',
          notas: 'Pago inicial al crear el pedido'
        }])
        .select()
        .single()

      if (errorPago) {
        // Si falla el pago, eliminar el pedido
        await this.repository.eliminar(pedido.id_pedido, {
          motivo: 'Error al registrar pago inicial',
          usuario_id: null
        })
        throw new Error(`Error al registrar pago inicial: ${errorPago.message}`)
      }

      // 5. Retornar pedido completo
      return await this.repository.obtenerPorId(pedido.id_pedido)
    } catch (error) {
      throw new Error(`Error al crear pedido: ${error.message}`)
    }
  }

  /**
   * Actualizar pedido
   * @param {number} id
   * @param {Object} datosActualizados
   * @returns {Promise<Object>}
   */
  async actualizar(id, datosActualizados) {
    // Verificar que no esté entregado
    const pedido = await this.repository.obtenerPorId(id)
    
    if (!pedido) {
      throw new Error('Pedido no encontrado')
    }

    if (pedido.estado === ESTADOS_PEDIDO.ENTREGADO) {
      throw new Error('No se puede editar un pedido ya entregado')
    }

    return await this.repository.actualizar(id, datosActualizados)
  }

  /**
   * Cambiar estado del pedido con validaciones
   * @param {number} id
   * @param {string} nuevoEstado
   * @returns {Promise<Object>}
   */
  async cambiarEstado(id, nuevoEstado) {
    const pedido = await this.repository.obtenerPorId(id)

    if (!pedido) {
      throw new Error('Pedido no encontrado')
    }

    // Validación crítica: no entregar con saldo pendiente
    if (nuevoEstado === ESTADOS_PEDIDO.ENTREGADO && pedido.saldo_pendiente > 0) {
      throw new Error(
        `No se puede entregar el pedido. Saldo pendiente: $${pedido.saldo_pendiente.toFixed(2)}`
      )
    }

    return await this.repository.cambiarEstado(id, nuevoEstado)
  }

  /**
   * Obtener todos los pedidos
   * @returns {Promise<Array>}
   */
  async obtenerTodos() {
    return await this.repository.obtenerTodos()
  }

  /**
   * Obtener por ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async obtenerPorId(id) {
    return await this.repository.obtenerPorId(id)
  }

  /**
   * Obtener por cliente
   * @param {number} idCliente
   * @returns {Promise<Array>}
   */
  async obtenerPorCliente(idCliente) {
    return await this.repository.obtenerPorCliente(idCliente)
  }

  /**
   * Obtener por estado
   * @param {string} estado
   * @returns {Promise<Array>}
   */
  async obtenerPorEstado(estado) {
    return await this.repository.obtenerPorEstado(estado)
  }

  /**
   * Buscar pedidos
   * @param {string} termino
   * @returns {Promise<Array>}
   */
  async buscar(termino) {
    return await this.repository.buscar(termino)
  }

  /**
   * Eliminar pedido
   * @param {number} id
   * @param {Object} datosEliminacion
   * @returns {Promise<Object>}
   */
  async eliminar(id, datosEliminacion) {
    const pedido = await this.repository.obtenerPorId(id)

    if (!pedido) {
      throw new Error('Pedido no encontrado')
    }

    if (pedido.estado === ESTADOS_PEDIDO.ENTREGADO) {
      throw new Error('No se pueden eliminar pedidos ya entregados')
    }

    return await this.repository.eliminar(id, datosEliminacion)
  }

  /**
   * Obtener estadísticas
   * @returns {Promise<Object>}
   */
  async obtenerEstadisticas() {
    return await this.repository.obtenerEstadisticas()
  }
}
