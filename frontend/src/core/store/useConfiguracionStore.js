import { create } from 'zustand'
import { ConfiguracionService, CONFIG_DEFAULTS } from '../../features/configuracion/services/ConfiguracionService'

const service = new ConfiguracionService()

/**
 * Store de Zustand para la configuración del taller
 * Se carga una vez al login y permanece en memoria
 */
export const useConfiguracionStore = create((set, get) => ({
  configuracion: { ...CONFIG_DEFAULTS },
  loading: false,
  error: null,
  loaded: false,

  cargar: async () => {
    if (get().loaded) return
    set({ loading: true, error: null })
    try {
      const config = await service.obtener()
      set({ configuracion: config, loading: false, loaded: true })
    } catch (err) {
      set({ error: err.message, loading: false })
      set({ configuracion: { ...CONFIG_DEFAULTS } })
    }
  },

  guardar: async (datos) => {
    set({ loading: true, error: null })
    try {
      const config = await service.actualizar(datos)
      set({ configuracion: config, loading: false })
      return config
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  restablecer: async () => {
    set({ loading: true, error: null })
    try {
      const config = await service.restablecer()
      set({ configuracion: config, loading: false })
      return config
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  // Helpers para acceder a valores específicos
  getHorario: () => {
    const c = get().configuracion
    return {
      apertura: c.hora_apertura,
      cierre: c.hora_cierre,
      dias: c.dias_atencion
    }
  },

  getPenalizaciones: () => {
    const c = get().configuracion
    return {
      MOVER_24_48: c.penalizacion_mover_24_48,
      MOVER_MENOS_24: c.penalizacion_mover_menos_24,
      CANCELAR_24_48: c.penalizacion_cancelar_24_48,
      CANCELAR_MENOS_24: c.penalizacion_cancelar_menos_24,
      NO_SHOW: c.penalizacion_no_show
    }
  },

  getDuraciones: () => {
    const c = get().configuracion
    return {
      PRUEBA_PARCIAL: c.duracion_prueba_parcial,
      ENTREGA_PEDIDO: c.duracion_entrega_pedido,
      TOMA_MEDIDAS: c.duracion_toma_medidas,
      DEVOLUCION_RENTA: c.duracion_devolucion_renta,
      REMIENDO_ENTREGA: c.duracion_remiendo_entrega,
      CONSULTA: c.duracion_consulta,
      OTRO: c.duracion_otro
    }
  },

  getHoraApertura: () => {
    const [h, m] = get().configuracion.hora_apertura.split(':').map(Number)
    return h + m / 60
  },

  getHoraCierre: () => {
    const [h, m] = get().configuracion.hora_cierre.split(':').map(Number)
    return h + m / 60
  },

  getDiasAtencion: () => get().configuracion.dias_atencion
}))
