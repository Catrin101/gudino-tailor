import { CitaRepository } from './CitaRepository'
import {
  RAZONES_CITA,
  ESTADOS_CITA,
  CANCELADA_POR,
  TIPOS_PENALIZACION,
  PENALIZACIONES_DEFAULT
} from '../../../core/constants/citas'
import { ESTADOS_PEDIDO } from '../../../core/constants/estados'

/**
 * Servicio de lógica de negocio para citas
 * Implementa las reglas R-CITA, R-MOVER, R-CANCEL del módulo
 */
export class CitaService {
  constructor() {
    this.repository = new CitaRepository()
  }

  // ─── Validaciones de creación ──────────────────────────────────────────

  /**
   * R-CITA-01: Verificar anticipación mínima de 2 horas
   * @param {string} fechaHoraInicio
   * @param {boolean} creadaEnTaller
   * @returns {Object} { valido, mensaje }
   */
  verificarAnticipacion(fechaHoraInicio, creadaEnTaller = false) {
    if (creadaEnTaller) {
      return { valido: true, mensaje: null }
    }

    const ahora = new Date()
    const inicio = new Date(fechaHoraInicio)
    const dosHorasDespues = new Date(ahora.getTime() + 2 * 60 * 60 * 1000)

    if (inicio < dosHorasDespues) {
      return {
        valido: false,
        mensaje: 'La cita debe ser al menos 2 horas en el futuro'
      }
    }

    return { valido: true, mensaje: null }
  }

  /**
   * R-CITA-03: Verificar horario de atención del taller
   * Default: Lunes a Sábado, 9:00 a.m. — 7:00 p.m.
   * @param {string} fechaHoraInicio
   * @param {string} fechaHoraFin
   * @returns {Object} { valido, mensaje }
   */
  verificarHorarioTaller(fechaHoraInicio, fechaHoraFin) {
    const inicio = new Date(fechaHoraInicio)
    const fin = new Date(fechaHoraFin)
    const diaSemana = inicio.getDay()

    // 0 = Domingo, 6 = Sábado
    if (diaSemana === 0) {
      return {
        valido: false,
        mensaje: 'El taller no abre los domingos'
      }
    }

    const horaInicio = inicio.getHours() + inicio.getMinutes() / 60
    const horaFin = fin.getHours() + fin.getMinutes() / 60

    // 9:00 a.m. = 9, 7:00 p.m. = 19
    if (horaInicio < 9 || horaFin > 19) {
      return {
        valido: false,
        mensaje: 'El horario de atención es de 9:00 a.m. a 7:00 p.m.'
      }
    }

    return { valido: true, mensaje: null }
  }

  /**
   * R-CITA-02: Verificar que no haya traslape con otra cita
   * @param {string} fechaHoraInicio
   * @param {string} fechaHoraFin
   * @param {string|null} excluirId
   * @returns {Promise<Object>} { valido, mensaje, citasConflicto }
   */
  async verificarDisponibilidad(fechaHoraInicio, fechaHoraFin, excluirId = null) {
    const citasConflicto = await this.repository.verificarTraslape(
      fechaHoraInicio,
      fechaHoraFin,
      excluirId
    )

    if (citasConflicto.length > 0) {
      return {
        valido: false,
        mensaje: 'Hay otra cita en ese horario',
        citasConflicto
      }
    }

    return { valido: true, mensaje: null, citasConflicto: [] }
  }

  /**
   * R-CITA-04: Verificar que el pedido vinculado esté en estado válido
   * @param {string} idPedido
   * @returns {Promise<Object>} { valido, mensaje, pedido }
   */
  async verificarPedidoActivo(idPedido) {
    const { data: pedido, error } = await await import('../../../core/config/supabase')
      .then(mod => mod.supabase
        .from('pedidos')
        .select('id_pedido, estado, tipo_servicio')
        .eq('id_pedido', idPedido)
        .single()
      )

    if (error || !pedido) {
      return { valido: false, mensaje: 'Pedido no encontrado', pedido: null }
    }

    const estadosValidos = [
      ESTADOS_PEDIDO.EN_ESPERA,
      ESTADOS_PEDIDO.EN_PROCESO,
      ESTADOS_PEDIDO.PRUEBA
    ]

    if (!estadosValidos.includes(pedido.estado)) {
      return {
        valido: false,
        mensaje: `No se puede vincular cita a un pedido en estado "${pedido.estado}"`,
        pedido
      }
    }

    return { valido: true, mensaje: null, pedido }
  }

  /**
   * Validar datos completos de una cita
   * @param {Object} datos
   * @returns {Object} { valido, errores }
   */
  validar(datos) {
    const errores = {}

    if (!datos.id_cliente) {
      errores.cliente = 'El cliente es obligatorio'
    }

    if (!datos.razon) {
      errores.razon = 'La razón de la cita es obligatoria'
    } else if (!RAZONES_CITA[datos.razon]) {
      errores.razon = 'Razón de cita inválida'
    }

    // R-OTRO: Si razón es OTRO, notas son obligatorias
    if (datos.razon === 'OTRO' && (!datos.notas_adicionales || datos.notas_adicionales.trim() === '')) {
      errores.notas_adicionales = 'Si la razón es "Otro", las notas son obligatorias'
    }

    if (!datos.fecha_hora_inicio) {
      errores.fecha_hora_inicio = 'La fecha y hora de inicio es obligatoria'
    }

    if (!datos.fecha_hora_fin) {
      errores.fecha_hora_fin = 'La fecha y hora de fin es obligatoria'
    }

    if (datos.fecha_hora_inicio && datos.fecha_hora_fin) {
      if (new Date(datos.fecha_hora_fin) <= new Date(datos.fecha_hora_inicio)) {
        errores.fecha_fin = 'La fecha de fin debe ser posterior al inicio'
      }
    }

    return {
      valido: Object.keys(errores).length === 0,
      errores
    }
  }

  // ─── Crear cita ───────────────────────────────────────────────────────

  /**
   * Crear una nueva cita con todas las validaciones
   * @param {Object} datos - Datos de la cita
   * @returns {Promise<Object>} Cita creada
   */
  async crear(datos) {
    const validacion = this.validar(datos)
    if (!validacion.valido) {
      throw new Error(JSON.stringify(validacion.errores))
    }

    // R-CITA-01: Verificar anticipación
    const anticipacion = this.verificarAnticipacion(
      datos.fecha_hora_inicio,
      datos.creada_en_taller
    )
    if (!anticipacion.valido) {
      throw new Error(anticipacion.mensaje)
    }

    // R-CITA-03: Verificar horario del taller
    const horario = this.verificarHorarioTaller(datos.fecha_hora_inicio, datos.fecha_hora_fin)
    if (!horario.valido) {
      throw new Error(horario.mensaje)
    }

    // R-CITA-02: Verificar disponibilidad (sin traslape)
    const disponibilidad = await this.verificarDisponibilidad(
      datos.fecha_hora_inicio,
      datos.fecha_hora_fin
    )
    if (!disponibilidad.valido) {
      throw new Error(disponibilidad.mensaje)
    }

    // R-CITA-04: Verificar pedido activo si se vincula
    if (datos.id_pedido) {
      const pedidoValidacion = await this.verificarPedidoActivo(datos.id_pedido)
      if (!pedidoValidacion.valido) {
        throw new Error(pedidoValidacion.mensaje)
      }
    }

    // Calcular duración basada en la razón si no se especifica fin
    const razonInfo = RAZONES_CITA[datos.razon]
    let fechaFin = datos.fecha_hora_fin
    if (!datos.fecha_hora_fin && datos.fecha_hora_inicio && razonInfo) {
      const inicio = new Date(datos.fecha_hora_inicio)
      fechaFin = new Date(inicio.getTime() + razonInfo.duracion * 60 * 1000).toISOString()
    }

    const cita = await this.repository.crear({
      id_cliente: datos.id_cliente,
      id_pedido: datos.id_pedido || null,
      razon: datos.razon,
      notas_adicionales: datos.notas_adicionales || null,
      fecha_hora_inicio: datos.fecha_hora_inicio,
      fecha_hora_fin: fechaFin,
      estado: ESTADOS_CITA.AGENDADA,
      veces_movida: 0,
      cancelada_por: null,
      creada_en_taller: datos.creada_en_taller || false
    })

    return await this.repository.obtenerPorId(cita.id_cita)
  }

  // ─── Mover cita ───────────────────────────────────────────────────────

  /**
   * R-MOVER: Calcular penalización por movimiento
   * @param {string} fechaHoraOriginal - Fecha/hora original de la cita
   * @returns {Promise<Object>} { tipoPenalizacion, monto, mensaje }
   */
  async calcularPenalizacionMovimiento(fechaHoraOriginal) {
    const ahora = new Date()
    const original = new Date(fechaHoraOriginal)
    const horasAntes = (original - ahora) / (1000 * 60 * 60)

    if (horasAntes > 48) {
      return { tipoPenalizacion: null, monto: 0, mensaje: 'Sin penalización' }
    }

    if (horasAntes >= 24) {
      // R-MOVER-02: 24-48 horas — verificar si es 1ª vez en el mes
      // Se debe verificar en el momento del movimiento real
      return {
        tipoPenalizacion: TIPOS_PENALIZACION.RETRASO_EXCESIVO,
        monto: PENALIZACIONES_DEFAULT.MOVER_24_48,
        requiereVerificacion: true,
        mensaje: 'Penalización de $50 MXN (verificar historial del mes)'
      }
    }

    // R-MOVER-03: Menos de 24 horas
    return {
      tipoPenalizacion: TIPOS_PENALIZACION.RETRASO_EXCESIVO,
      monto: PENALIZACIONES_DEFAULT.MOVER_MENOS_24,
      requiereVerificacion: false,
      mensaje: 'Penalización de $100 MXN'
    }
  }

  /**
   * Mover una cita a nueva fecha/hora
   * @param {string} idCita
   * @param {string} nuevaFechaInicio
   * @param {string} nuevaFechaFin
   * @returns {Promise<Object>} { cita, penalizacion }
   */
  async mover(idCita, nuevaFechaInicio, nuevaFechaFin) {
    const cita = await this.repository.obtenerPorId(idCita)
    if (!cita) throw new Error('Cita no encontrada')

    // R-MOVER-04: Verificar límite de movimientos
    if (cita.veces_movida >= 2) {
      throw new Error(
        'Esta cita alcanzó el límite de 2 movimientos. Cancélala y crea una nueva.'
      )
    }

    // Verificar que la cita esté en estado válido para mover
    if (![ESTADOS_CITA.AGENDADA, ESTADOS_CITA.CONFIRMADA].includes(cita.estado)) {
      throw new Error('Solo se pueden mover citas en estado Agendada o Confirmada')
    }

    // R-MOVER-05: Verificar que la nueva fecha cumpla todas las reglas
    const horario = this.verificarHorarioTaller(nuevaFechaInicio, nuevaFechaFin)
    if (!horario.valido) {
      throw new Error(horario.mensaje)
    }

    const disponibilidad = await this.verificarDisponibilidad(
      nuevaFechaInicio,
      nuevaFechaFin,
      idCita
    )
    if (!disponibilidad.valido) {
      throw new Error(disponibilidad.mensaje)
    }

    // Calcular penalización
    const penalizacion = await this.calcularPenalizacionMovimiento(cita.fecha_hora_inicio)

    // Actualizar la cita
    const citaActualizada = await this.repository.actualizar(idCita, {
      fecha_hora_inicio: nuevaFechaInicio,
      fecha_hora_fin: nuevaFechaFin,
      veces_movida: cita.veces_movida + 1
    })

    return {
      cita: citaActualizada,
      penalizacion
    }
  }

  // ─── Cancelar cita ────────────────────────────────────────────────────

  /**
   * R-CANCEL: Calcular penalización por cancelación
   * @param {string} fechaHoraCita
   * @returns {Object} { tipoPenalizacion, monto, mensaje }
   */
  calcularPenalizacionCancelacion(fechaHoraCita) {
    const ahora = new Date()
    const cita = new Date(fechaHoraCita)
    const horasAntes = (cita - ahora) / (1000 * 60 * 60)

    if (horasAntes > 48) {
      return { tipoPenalizacion: null, monto: 0, mensaje: 'Sin penalización' }
    }

    if (horasAntes >= 24) {
      // R-CANCEL-02
      return {
        tipoPenalizacion: TIPOS_PENALIZACION.CANCELACION_TARDIA,
        monto: PENALIZACIONES_DEFAULT.CANCELAR_24_48,
        mensaje: 'Penalización de $75 MXN por cancelación tardía'
      }
    }

    // R-CANCEL-03: Menos de 24 horas
    return {
      tipoPenalizacion: TIPOS_PENALIZACION.CANCELACION_TARDIA,
      monto: PENALIZACIONES_DEFAULT.CANCELAR_MENOS_24,
      mensaje: 'Penalización de $150 MXN por cancelación de último momento'
    }
  }

  /**
   * Cancelar una cita
   * @param {string} idCita
   * @param {string} canceladaPor - 'Cliente' | 'Taller' | 'Sistema'
   * @param {boolean} condonarPenalizacion
   * @param {string} motivoCondonacion
   * @returns {Promise<Object>} { cita, penalizacion }
   */
  async cancelar(idCita, canceladaPor = 'Cliente', condonarPenalizacion = false, motivoCondonacion = '') {
    const cita = await this.repository.obtenerPorId(idCita)
    if (!cita) throw new Error('Cita no encontrada')

    // Verificar que la cita se pueda cancelar
    if (cita.estado === ESTADOS_CITA.COMPLETADA) {
      throw new Error('No se puede cancelar una cita ya completada')
    }
    if (cita.estado === ESTADOS_CITA.CANCELADA) {
      throw new Error('La cita ya está cancelada')
    }

    let penalizacion = null

    // R-CANCEL-05: Cancelación del taller no genera penalización
    if (canceladaPor !== CANCELADA_POR.TALLER) {
      const calcPenalizacion = this.calcularPenalizacionCancelacion(cita.fecha_hora_inicio)

      if (calcPenalizacion.monto > 0) {
        // Registrar penalización
        penalizacion = await this.repository.crearPenalizacion({
          id_cita: idCita,
          id_cliente: cita.id_cliente,
          tipo: calcPenalizacion.tipoPenalizacion,
          monto: calcPenalizacion.monto,
          estado_cobro: condonarPenalizacion ? 'Condonada' : 'Pendiente',
          notas_cobro: condonarPenalizacion ? `Condonada: ${motivoCondonacion}` : null
        })
      }
    }

    // Actualizar estado de la cita
    const citaActualizada = await this.repository.actualizar(idCita, {
      estado: ESTADOS_CITA.CANCELADA,
      cancelada_por: canceladaPor
    })

    return {
      cita: citaActualizada,
      penalizacion
    }
  }

  // ─── No Show ──────────────────────────────────────────────────────────

  /**
   * R-CANCEL-04: Marcar como No Show
   * @param {string} idCita
   * @returns {Promise<Object>} { cita, penalizacion }
   */
  async marcarNoShow(idCita) {
    const cita = await this.repository.obtenerPorId(idCita)
    if (!cita) throw new Error('Cita no encontrada')

    if (![ESTADOS_CITA.AGENDADA, ESTADOS_CITA.CONFIRMADA].includes(cita.estado)) {
      throw new Error('Solo se puede marcar como No Show citas Agendadas o Confirmadas')
    }

    // Generar penalización automática de $200 MXN
    const penalizacion = await this.repository.crearPenalizacion({
      id_cita: idCita,
      id_cliente: cita.id_cliente,
      tipo: TIPOS_PENALIZACION.NO_SHOW,
      monto: PENALIZACIONES_DEFAULT.NO_SHOW,
      estado_cobro: 'Pendiente',
      notas_cobro: null
    })

    // Actualizar estado
    const citaActualizada = await this.repository.actualizar(idCita, {
      estado: ESTADOS_CITA.NO_SHOW
    })

    return {
      cita: citaActualizada,
      penalizacion
    }
  }

  // ─── Confirmar cita ───────────────────────────────────────────────────

  /**
   * Cambiar estado a Confirmada
   * @param {string} idCita
   * @returns {Promise<Object>}
   */
  async confirmar(idCita) {
    const cita = await this.repository.obtenerPorId(idCita)
    if (!cita) throw new Error('Cita no encontrada')

    if (cita.estado !== ESTADOS_CITA.AGENDADA) {
      throw new Error('Solo se pueden confirmar citas en estado Agendada')
    }

    return await this.repository.actualizar(idCita, {
      estado: ESTADOS_CITA.CONFIRMADA
    })
  }

  // ─── Completar cita ───────────────────────────────────────────────────

  /**
   * Cambiar estado a Completada
   * @param {string} idCita
   * @returns {Promise<Object>}
   */
  async completar(idCita) {
    const cita = await this.repository.obtenerPorId(idCita)
    if (!cita) throw new Error('Cita no encontrada')

    if (![ESTADOS_CITA.AGENDADA, ESTADOS_CITA.CONFIRMADA].includes(cita.estado)) {
      throw new Error('Solo se pueden completar citas Agendadas o Confirmadas')
    }

    return await this.repository.actualizar(idCita, {
      estado: ESTADOS_CITA.COMPLETADA
    })
  }

  // ─── Condonar penalización ────────────────────────────────────────────

  /**
   * R-COBRO-03: Condonar una penalización
   * @param {string} idPenalizacion
   * @param {string} motivo - Motivo obligatorio
   * @returns {Promise<Object>}
   */
  async condonarPenalizacion(idPenalizacion, motivo) {
    if (!motivo || motivo.trim() === '') {
      throw new Error('El motivo de condonación es obligatorio')
    }

    const { data: penalizacion, error } = await await import('../../../core/config/supabase')
      .then(mod => mod.supabase
        .from('penalizaciones_cita')
        .select('estado_cobro')
        .eq('id_penalizacion', idPenalizacion)
        .single()
      )

    if (error || !penalizacion) {
      throw new Error('Penalización no encontrada')
    }

    if (penalizacion.estado_cobro === 'Cobrada') {
      throw new Error('No se puede condonar una penalización ya cobrada')
    }

    return await this.repository.actualizarPenalizacion(idPenalizacion, {
      estado_cobro: 'Condonada',
      notas_cobro: `Condonada: ${motivo}`
    })
  }

  // ─── Cobrar penalización ──────────────────────────────────────────────

  /**
   * Marcar penalización como cobrada
   * @param {string} idPenalizacion
   * @param {string} notas
   * @returns {Promise<Object>}
   */
  async cobrarPenalizacion(idPenalizacion, notas = '') {
    const { data: penalizacion, error } = await await import('../../../core/config/supabase')
      .then(mod => mod.supabase
        .from('penalizaciones_cita')
        .select('estado_cobro')
        .eq('id_penalizacion', idPenalizacion)
        .single()
      )

    if (error || !penalizacion) {
      throw new Error('Penalización no encontrada')
    }

    if (penalizacion.estado_cobro === 'Condonada') {
      throw new Error('No se puede cobrar una penalización condonada')
    }

    return await this.repository.actualizarPenalizacion(idPenalizacion, {
      estado_cobro: 'Cobrada',
      notas_cobro: notas || `Cobrada el ${new Date().toISOString()}`
    })
  }

  // ─── Consultas ────────────────────────────────────────────────────────

  async obtenerTodas(filtros) { return await this.repository.obtenerTodas(filtros) }
  async obtenerPorId(id) { return await this.repository.obtenerPorId(id) }
  async obtenerPorCliente(idCliente) { return await this.repository.obtenerPorCliente(idCliente) }
  async obtenerPorFecha(fecha) { return await this.repository.obtenerPorFecha(fecha) }
  async obtenerPorRangoFechas(inicio, fin) { return await this.repository.obtenerPorRangoFechas(inicio, fin) }
  async obtenerPenalizacionesPendientes(idCliente) { return await this.repository.obtenerPenalizacionesPendientes(idCliente) }
}
