import { supabase } from '../../../core/config/supabase'

/**
 * Repositorio para operaciones CRUD de citas en Supabase
 * Maneja toda la comunicación con la base de datos
 */
export class CitaRepository {
  /**
   * Obtener todas las citas con información del cliente y pedido
   * @param {Object} filtros - Filtros opcionales
   * @returns {Promise<Array>}
   */
  async obtenerTodas(filtros = {}) {
    let query = supabase
      .from('citas')
      .select(`
        *,
        clientes (
          id_cliente,
          nombre,
          telefono
        ),
        pedidos (
          id_pedido,
          tipo_servicio,
          estado,
          costo_total
        )
      `)
      .order('fecha_hora_inicio', { ascending: true })

    if (filtros.estado) {
      query = query.eq('estado', filtros.estado)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener citas: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtener cita por ID con relaciones completas
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async obtenerPorId(id) {
    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        clientes (
          id_cliente,
          nombre,
          telefono,
          notas_generales
        ),
        pedidos (
          id_pedido,
          tipo_servicio,
          estado,
          costo_total,
          saldo_pendiente
        ),
        penalizaciones_cita (
          *
        )
      `)
      .eq('id_cita', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al obtener cita: ${error.message}`)
    }

    return data
  }

  /**
   * Obtener citas por cliente
   * @param {string} idCliente
   * @returns {Promise<Array>}
   */
  async obtenerPorCliente(idCliente) {
    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        pedidos (
          id_pedido,
          tipo_servicio,
          estado
        )
      `)
      .eq('id_cliente', idCliente)
      .order('fecha_hora_inicio', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener citas del cliente: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtener citas de un día específico
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Array>}
   */
  async obtenerPorFecha(fecha) {
    const inicio = `${fecha}T00:00:00`
    const fin = `${fecha}T23:59:59`

    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        clientes (
          id_cliente,
          nombre,
          telefono
        ),
        pedidos (
          id_pedido,
          tipo_servicio,
          estado
        )
      `)
      .gte('fecha_hora_inicio', inicio)
      .lte('fecha_hora_inicio', fin)
      .order('fecha_hora_inicio', { ascending: true })

    if (error) {
      throw new Error(`Error al obtener citas del día: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtener citas en un rango de fechas (para vista calendario)
   * @param {string} inicio - Fecha/hora inicio ISO
   * @param {string} fin - Fecha/hora fin ISO
   * @returns {Promise<Array>}
   */
  async obtenerPorRangoFechas(inicio, fin) {
    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        clientes (
          id_cliente,
          nombre,
          telefono
        ),
        pedidos (
          id_pedido,
          tipo_servicio,
          estado
        )
      `)
      .gte('fecha_hora_inicio', inicio)
      .lte('fecha_hora_inicio', fin)
      .order('fecha_hora_inicio', { ascending: true })

    if (error) {
      throw new Error(`Error al obtener citas por rango: ${error.message}`)
    }

    return data || []
  }

  /**
   * Verificar traslape de horarios (R-CITA-02)
   * @param {string} fechaInicio
   * @param {string} fechaFin
   * @param {string|null} excluirId - ID de cita a excluir (para reprogramar)
   * @returns {Promise<Array>} Citas que se traslapan
   */
  async verificarTraslape(fechaInicio, fechaFin, excluirId = null) {
    let query = supabase
      .from('citas')
      .select('id_cita, fecha_hora_inicio, fecha_hora_fin, razon, clientes(nombre)')
      .not('estado', 'in', '("Cancelada","No Show")')
      .lt('fecha_hora_inicio', fechaFin)
      .gt('fecha_hora_fin', fechaInicio)

    if (excluirId) {
      query = query.neq('id_cita', excluirId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al verificar traslape: ${error.message}`)
    }

    return data || []
  }

  /**
   * Crear nueva cita
   * @param {Object} cita
   * @returns {Promise<Object>}
   */
  async crear(cita) {
    const { data, error } = await supabase
      .from('citas')
      .insert([cita])
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear cita: ${error.message}`)
    }

    return data
  }

  /**
   * Actualizar cita
   * @param {string} id
   * @param {Object} datosActualizados
   * @returns {Promise<Object>}
   */
  async actualizar(id, datosActualizados) {
    const { data, error } = await supabase
      .from('citas')
      .update({
        ...datosActualizados,
        fecha_ultima_modificacion: new Date().toISOString()
      })
      .eq('id_cita', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar cita: ${error.message}`)
    }

    return data
  }

  /**
   * Crear penalización
   * @param {Object} penalizacion
   * @returns {Promise<Object>}
   */
  async crearPenalizacion(penalizacion) {
    const { data, error } = await supabase
      .from('penalizaciones_cita')
      .insert([penalizacion])
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear penalización: ${error.message}`)
    }

    return data
  }

  /**
   * Actualizar penalización (cobrar o condonar)
   * @param {string} id
   * @param {Object} datos
   * @returns {Promise<Object>}
   */
  async actualizarPenalizacion(id, datos) {
    const { data, error } = await supabase
      .from('penalizaciones_cita')
      .update(datos)
      .eq('id_penalizacion', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar penalización: ${error.message}`)
    }

    return data
  }

  /**
   * Obtener penalizaciones pendientes de un cliente
   * @param {string} idCliente
   * @returns {Promise<Array>}
   */
  async obtenerPenalizacionesPendientes(idCliente) {
    const { data, error } = await supabase
      .from('penalizaciones_cita')
      .select(`
        *,
        citas (
          id_cita,
          razon,
          fecha_hora_inicio
        )
      `)
      .eq('id_cliente', idCliente)
      .eq('estado_cobro', 'Pendiente')
      .order('fecha_aplicacion', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener penalizaciones: ${error.message}`)
    }

    return data || []
  }
}
