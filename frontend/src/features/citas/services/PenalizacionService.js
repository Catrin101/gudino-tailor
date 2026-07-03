import { supabase } from '../../../core/config/supabase'

/**
 * Servicio para consultar y gestionar penalizaciones de citas
 * Consulta directamente Supabase (sin Edge Function para listados)
 */
export class PenalizacionService {
  /**
   * Obtener penalizaciones pendientes de un cliente
   * @param {number} idCliente
   * @returns {Promise<Array>}
   */
  async obtenerPendientesPorCliente(idCliente) {
    const { data, error } = await supabase
      .from('penalizaciones_cita')
      .select(`
        *,
        citas (
          id_cita,
          razon,
          fecha_hora_inicio
        ),
        pedidos (
          id_pedido,
          tipo_servicio,
          estado
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

  /**
   * Obtener todas las penalizaciones pendientes (para vista de Pagos)
   * @returns {Promise<Array>}
   */
  async obtenerTodasPendientes() {
    const { data, error } = await supabase
      .from('penalizaciones_cita')
      .select(`
        *,
        clientes (
          id_cliente,
          nombre,
          telefono
        ),
        citas (
          id_cita,
          razon,
          fecha_hora_inicio
        ),
        pedidos (
          id_pedido,
          tipo_servicio,
          estado,
          costo_total,
          saldo_pendiente
        )
      `)
      .eq('estado_cobro', 'Pendiente')
      .order('fecha_aplicacion', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener penalizaciones pendientes: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtener historial de penalizaciones de un cliente (todos los estados)
   * @param {number} idCliente
   * @returns {Promise<Array>}
   */
  async obtenerHistorialPorCliente(idCliente) {
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
      .order('fecha_aplicacion', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener historial de penalizaciones: ${error.message}`)
    }

    return data || []
  }

  /**
   * Cobrar penalización (llama a Edge Function)
   * @param {number} idPenalizacion
   * @param {number|null} idPedido - Pedido al que vincular el cobro
   * @param {string} notas
   * @returns {Promise<Object>}
   */
  async cobrar(idPenalizacion, idPedido = null, notas = '') {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    const response = await fetch(
      `${supabaseUrl}/functions/v1/cobrar-penalizacion/${idPenalizacion}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ id_pedido: idPedido, notas })
      }
    )

    const resultado = await response.json()

    if (!response.ok) {
      throw new Error(resultado.error || 'Error al cobrar penalización')
    }

    return resultado.data
  }

  /**
   * Condonar penalización (llama a Edge Function)
   * @param {number} idPenalizacion
   * @param {string} motivo
   * @returns {Promise<Object>}
   */
  async condonar(idPenalizacion, motivo) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    const response = await fetch(
      `${supabaseUrl}/functions/v1/condonar-penalizacion/${idPenalizacion}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ motivo })
      }
    )

    const resultado = await response.json()

    if (!response.ok) {
      throw new Error(resultado.error || 'Error al condonar penalización')
    }

    return resultado.data
  }

  /**
   * Calcular score de comportamiento del cliente
   * @param {Array} penalizaciones - Historial completo de penalizaciones
   * @returns {Object} { score, nivel, label, color }
   */
  calcularComportamiento(penalizaciones) {
    const pendientes = penalizaciones.filter(p => p.estado_cobro === 'Pendiente')
    const totalPendiente = pendientes.reduce((sum, p) => sum + parseFloat(p.monto), 0)
    const noShows = penalizaciones.filter(p => p.tipo === 'No_Show').length
    const cancelaciones = penalizaciones.filter(p => p.tipo === 'Cancelacion_Tardia').length
    const totalPenalizaciones = penalizaciones.length

    let score = 0
    score += totalPenalizaciones * 10
    score += noShows * 15
    score += totalPendiente > 0 ? 20 : 0

    score = Math.min(score, 100)

    let nivel, label, color
    if (score === 0) {
      nivel = 'excelente'
      label = 'Excelente'
      color = 'success'
    } else if (score <= 25) {
      nivel = 'bueno'
      label = 'Bueno'
      color = 'green'
    } else if (score <= 50) {
      nivel = 'regular'
      label = 'Regular'
      color = 'warning'
    } else {
      nivel = 'alerta'
      label = 'Alerta'
      color = 'danger'
    }

    return {
      score,
      nivel,
      label,
      color,
      detalles: {
        totalPenalizaciones,
        pendientes: pendientes.length,
        totalPendiente,
        noShows,
        cancelaciones
      }
    }
  }
}
