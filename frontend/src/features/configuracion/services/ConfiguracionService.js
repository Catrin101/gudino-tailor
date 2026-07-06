import { supabase } from '../../../core/config/supabase'

/**
 * Valores por defecto de la configuración del taller
 * Usados como fallback si la BD no tiene registros
 */
export const CONFIG_DEFAULTS = {
  id: 1,
  hora_apertura: '09:00',
  hora_cierre: '19:00',
  dias_atencion: [1, 2, 3, 4, 5, 6],

  penalizacion_mover_24_48: 50,
  penalizacion_mover_menos_24: 100,
  penalizacion_cancelar_24_48: 75,
  penalizacion_cancelar_menos_24: 150,
  penalizacion_no_show: 200,

  duracion_prueba_parcial: 30,
  duracion_entrega_pedido: 15,
  duracion_toma_medidas: 20,
  duracion_devolucion_renta: 10,
  duracion_remiendo_entrega: 10,
  duracion_consulta: 20,
  duracion_otro: 15
}

/**
 * Servicio para CRUD de configuración del taller
 */
export class ConfiguracionService {
  async obtener() {
    const { data, error } = await supabase
      .from('configuracion_taller')
      .select('*')
      .eq('id', 1)
      .single()

    if (error || !data) {
      return { ...CONFIG_DEFAULTS }
    }

    return data
  }

  async actualizar(datos) {
    const { data, error } = await supabase
      .from('configuracion_taller')
      .update(datos)
      .eq('id', 1)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al guardar configuración: ${error.message}`)
    }

    return data
  }

  async restablecer() {
    const defaults = { ...CONFIG_DEFAULTS }
    delete defaults.id

    const { data, error } = await supabase
      .from('configuracion_taller')
      .update(defaults)
      .eq('id', 1)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al restablecer configuración: ${error.message}`)
    }

    return data
  }
}
