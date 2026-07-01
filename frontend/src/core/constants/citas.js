/**
 * Constantes del Módulo de Citas — GudiñoTailor
 * Catálogo de razones, estados, colores y opciones de cancelación
 */

// ─── RAZONES DE CITA (Catálogo 4.1) ────────────────────────
export const RAZONES_CITA = {
  PRUEBA_PARCIAL: {
    label: 'Prueba de prenda',
    descripcion: 'Ajuste intermedio de prenda confeccionada',
    duracion: 30,
    aplica: ['Confeccion']
  },
  ENTREGA_PEDIDO: {
    label: 'Entrega y pago final',
    descripcion: 'Entrega de pedido terminado y cobro',
    duracion: 15,
    aplica: ['Confeccion', 'Remiendo', 'Renta']
  },
  TOMA_MEDIDAS: {
    label: 'Toma de medidas',
    descripcion: 'Toma inicial o actualización de medidas',
    duracion: 20,
    aplica: ['Confeccion']
  },
  DEVOLUCION_RENTA: {
    label: 'Devolución de renta',
    descripcion: 'Devolución de prenda rentada',
    duracion: 10,
    aplica: ['Renta']
  },
  REMIENDO_ENTREGA: {
    label: 'Entrega de compostura',
    descripcion: 'Entrega de prenda remendada',
    duracion: 10,
    aplica: ['Remiendo']
  },
  CONSULTA: {
    label: 'Consulta / Presupuesto',
    descripcion: 'Consulta de presupuesto o asesoría sin pedido',
    duracion: 20,
    aplica: []
  },
  OTRO: {
    label: 'Otro',
    descripcion: 'Otro motivo (requiere nota adicional obligatoria)',
    duracion: 15,
    aplica: []
  }
}

// ─── ESTADOS DE LA CITA ─────────────────────────────────────
export const ESTADOS_CITA = {
  AGENDADA: 'Agendada',
  CONFIRMADA: 'Confirmada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  NO_SHOW: 'No Show'
}

/**
 * Ciclo de vida: Agendada → Confirmada → Completada
 *                          → Cancelada
 *                          → No Show
 * Solo puede avanzar, no retroceder (excepto Confirmada → Agendada al mover)
 */
export const FLUJO_ESTADOS_CITA = [
  ESTADOS_CITA.AGENDADA,
  ESTADOS_CITA.CONFIRMADA,
  ESTADOS_CITA.COMPLETADA
]

// ─── COLORES SEMÁNTICOS POR ESTADO ──────────────────────────
export const COLORES_ESTADO_CITA = {
  [ESTADOS_CITA.AGENDADA]: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    badge: 'blue',
    point: 'bg-blue-500'
  },
  [ESTADOS_CITA.CONFIRMADA]: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    badge: 'green',
    point: 'bg-green-500'
  },
  [ESTADOS_CITA.COMPLETADA]: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    badge: 'green',
    point: 'bg-green-500'
  },
  [ESTADOS_CITA.CANCELADA]: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    badge: 'gray',
    point: 'bg-gray-400'
  },
  [ESTADOS_CITA.NO_SHOW]: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    badge: 'red',
    point: 'bg-red-500'
  }
}

// ─── QUIÉN CANCELÓ LA CITA ─────────────────────────────────
export const CANCELADA_POR = {
  CLIENTE: 'Cliente',
  SISTEMA: 'Sistema',
  TALLER: 'Taller'
}

// ─── TIPOS DE PENALIZACIÓN ─────────────────────────────────
export const TIPOS_PENALIZACION = {
  CANCELACION_TARDIA: 'Cancelacion_Tardia',
  NO_SHOW: 'No_Show',
  RETRASO_EXCESIVO: 'Retraso_Excesivo'
}

// ─── ESTADOS DE COBRO DE PENALIZACIÓN ──────────────────────
export const ESTADOS_COBRO = {
  PENDIENTE: 'Pendiente',
  COBRADA: 'Cobrada',
  CONDONADA: 'Condonada'
}

// ─── MONOTOS DEFAULT DE PENALIZACIONES (configurables) ─────
export const PENALIZACIONES_DEFAULT = {
  MOVER_24_48: 50,
  MOVER_MENOS_24: 100,
  CANCELAR_24_48: 75,
  CANCELAR_MENOS_24: 150,
  NO_SHOW: 200
}
