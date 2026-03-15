import { PedidoRepository } from './PedidoRepository'
import { TIPOS_SERVICIO, ESTADOS_PEDIDO } from '../../../core/constants/estados'
import { supabase } from '../../../core/config/supabase'

/**
 * Servicio de lógica de negocio para pedidos
 *
 * CAMBIOS:
 * 1. COMPOSTURA: la validación ya no requiere un string 'descripcion' global,
 *    sino al menos 1 elemento en 'detalles' (cada prenda con su descripción).
 * 2. COMPOSTURA en crear(): genera un detalle por prenda igual que Confección,
 *    en lugar de un único detalle global.
 * 3. Uso de ETIQUETAS_TIPO_SERVICIO para mensajes de error legibles.
 */
export class PedidoService {
  constructor() {
    this.repository = new PedidoRepository()
  }

  // ─── Validar datos del pedido ────────────────────────────────────────
  validar(pedido) {
    const errores = {}

    if (!pedido.id_cliente) {
      errores.cliente = 'El cliente es obligatorio'
    }

    if (!pedido.tipo_servicio) {
      errores.tipo_servicio = 'El tipo de servicio es obligatorio'
    } else if (!Object.values(TIPOS_SERVICIO).includes(pedido.tipo_servicio)) {
      errores.tipo_servicio = 'Tipo de servicio inválido'
    }

    if (!pedido.costo_total || pedido.costo_total <= 0) {
      errores.costo_total = 'El costo total debe ser mayor a 0'
    }

    if (pedido.anticipo === undefined || pedido.anticipo <= 0) {
      errores.anticipo = 'El anticipo es obligatorio y debe ser mayor a 0'
    } else if (pedido.anticipo > pedido.costo_total) {
      errores.anticipo = 'El anticipo no puede ser mayor al costo total'
    }

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

    // ── Validaciones por tipo ──────────────────────────────────────────
    if (pedido.tipo_servicio === TIPOS_SERVICIO.CONFECCION) {
      if (!pedido.detalles || pedido.detalles.length === 0) {
        errores.detalles = 'Debe especificar al menos una prenda'
      }
      pedido.detalles?.forEach((detalle, idx) => {
        if (!detalle.id_medida) {
          errores[`detalle_${idx}`] = 'Cada prenda debe tener medidas asociadas'
        }
      })
    }

    /**
     * CAMBIO: Compostura valida que existan detalles (prendas individuales),
     * en lugar de validar el campo 'descripcion' global.
     */
    if (pedido.tipo_servicio === TIPOS_SERVICIO.COMPOSTURA) {
      if (!pedido.detalles || pedido.detalles.length === 0) {
        errores.detalles = 'Debe agregar al menos una prenda con sus instrucciones'
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

  // ─── Crear pedido completo con detalles y pago inicial ───────────────
  async crear(datosPedido) {
    const validacion = this.validar(datosPedido)
    if (!validacion.valido) {
      throw new Error(JSON.stringify(validacion.errores))
    }

    try {
      // 1. UUID de grupo si aplica
      const idGrupo = datosPedido.nombre_grupo ? crypto.randomUUID() : null

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

      // 3. Construir detalles según tipo de servicio
      let detalles = []

      if (datosPedido.tipo_servicio === TIPOS_SERVICIO.CONFECCION) {
        detalles = datosPedido.detalles.map(detalle => ({
          id_pedido: pedido.id_pedido,
          id_medida: detalle.id_medida,
          tipo_prenda: detalle.tipo_prenda,
          descripcion: detalle.descripcion || datosPedido.notas || null
        }))
      }

      /**
       * CAMBIO: Compostura genera UN registro en detalles_pedido por cada
       * prenda agregada en el Paso3Compostura, con sus instrucciones propias.
       * Estructura idéntica a Confección excepto que id_medida = null.
       */
      if (datosPedido.tipo_servicio === TIPOS_SERVICIO.COMPOSTURA) {
        detalles = datosPedido.detalles.map(detalle => ({
          id_pedido: pedido.id_pedido,
          id_medida: null,              // Composturas no usan medidas
          tipo_prenda: detalle.tipo_prenda,
          descripcion: detalle.descripcion // Instrucciones específicas de esa prenda
        }))
      }

      if (datosPedido.tipo_servicio === TIPOS_SERVICIO.RENTA) {
        detalles = datosPedido.detalles.map(detalle => ({
          id_pedido: pedido.id_pedido,
          id_medida: null,
          tipo_prenda: detalle.tipo_prenda,
          descripcion: detalle.descripcion || null,
          fecha_evento: datosPedido.fecha_evento,
          fecha_devolucion: datosPedido.fecha_devolucion
        }))

        // Si no se especificaron prendas, crear detalle genérico
        if (detalles.length === 0) {
          detalles = [{
            id_pedido: pedido.id_pedido,
            id_medida: null,
            tipo_prenda: 'Renta',
            descripcion: datosPedido.notas || null,
            fecha_evento: datosPedido.fecha_evento,
            fecha_devolucion: datosPedido.fecha_devolucion
          }]
        }
      }

      if (detalles.length > 0) {
        await this.repository.crearDetalles(detalles)
      }

      // 4. Registrar anticipo inicial
      const { error: errorPago } = await supabase
        .from('pagos')
        .insert([{
          id_pedido: pedido.id_pedido,
          monto: datosPedido.anticipo,
          concepto: 'Anticipo',
          metodo: datosPedido.metodo_pago || 'Efectivo',
          notas: 'Pago inicial al crear el pedido'
        }])

      if (errorPago) {
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

  // ─── Actualizar pedido ───────────────────────────────────────────────
  async actualizar(id, datosActualizados) {
    const pedido = await this.repository.obtenerPorId(id)
    if (!pedido) throw new Error('Pedido no encontrado')
    if (pedido.estado === ESTADOS_PEDIDO.ENTREGADO) {
      throw new Error('No se puede editar un pedido ya entregado')
    }
    return await this.repository.actualizar(id, datosActualizados)
  }

  // ─── Cambiar estado con validaciones ────────────────────────────────
  async cambiarEstado(id, nuevoEstado) {
    const pedido = await this.repository.obtenerPorId(id)
    if (!pedido) throw new Error('Pedido no encontrado')

    if (nuevoEstado === ESTADOS_PEDIDO.ENTREGADO && pedido.saldo_pendiente > 0) {
      throw new Error(
        `No se puede entregar el pedido. Saldo pendiente: $${parseFloat(pedido.saldo_pendiente).toFixed(2)}`
      )
    }

    return await this.repository.cambiarEstado(id, nuevoEstado)
  }

  // ─── Métodos delegados al repositorio ───────────────────────────────
  async obtenerTodos() { return await this.repository.obtenerTodos() }
  async obtenerPorId(id) { return await this.repository.obtenerPorId(id) }
  async obtenerPorCliente(idCliente) { return await this.repository.obtenerPorCliente(idCliente) }
  async obtenerPorEstado(estado) { return await this.repository.obtenerPorEstado(estado) }
  async buscar(termino) { return await this.repository.buscar(termino) }
  async obtenerEstadisticas() { return await this.repository.obtenerEstadisticas() }

  async eliminar(id, datosEliminacion) {
    const pedido = await this.repository.obtenerPorId(id)
    if (!pedido) throw new Error('Pedido no encontrado')
    if (pedido.estado === ESTADOS_PEDIDO.ENTREGADO) {
      throw new Error('No se pueden eliminar pedidos ya entregados')
    }
    return await this.repository.eliminar(id, datosEliminacion)
  }
}
