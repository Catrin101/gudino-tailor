/**
 * Constantes de estados y tipos de servicio para GudiñoTailor
 * CAMBIO: REMIENDO renombrado a COMPOSTURA (valor interno preservado para compatibilidad con BD)
 */

// ─── ESTADOS DEL PEDIDO ────────────────────────────────────────────────────
export const ESTADOS_PEDIDO = {
  EN_ESPERA: 'En Espera',
  EN_PROCESO: 'En Proceso',
  PRUEBA: 'Prueba',
  TERMINADO: 'Terminado',
  ENTREGADO: 'Entregado',
  ABANDONADO: 'Abandonado'
}

/**
 * Flujo lineal de estados (usado para avanzar con flechas)
 * Prueba solo aplica a Confeccion pero se incluye en el flujo general
 */
export const FLUJO_ESTADOS = [
  ESTADOS_PEDIDO.EN_ESPERA,
  ESTADOS_PEDIDO.EN_PROCESO,
  ESTADOS_PEDIDO.PRUEBA,
  ESTADOS_PEDIDO.TERMINADO,
  ESTADOS_PEDIDO.ENTREGADO
]

// ─── TIPOS DE SERVICIO ─────────────────────────────────────────────────────
/**
 * NOTA IMPORTANTE:
 * El valor interno de COMPOSTURA sigue siendo 'Remiendo' para mantener
 * compatibilidad con registros existentes en la base de datos.
 * Solo la etiqueta visual al usuario cambia a "Compostura".
 *
 * Si en el futuro se requiere migrar los datos históricos en BD,
 * ejecutar: UPDATE pedidos SET tipo_servicio = 'Compostura' WHERE tipo_servicio = 'Remiendo'
 */
export const TIPOS_SERVICIO = {
  CONFECCION: 'Confeccion',
  COMPOSTURA: 'Remiendo',   // Valor interno en BD = 'Remiendo' — etiqueta UI = 'Compostura'
  RENTA: 'Renta'
}

/**
 * Etiquetas de visualización para el usuario final
 * Usar este mapa en TODOS los lugares donde se muestra el tipo al usuario
 */
export const ETIQUETAS_TIPO_SERVICIO = {
  [TIPOS_SERVICIO.CONFECCION]: 'Confección',
  [TIPOS_SERVICIO.COMPOSTURA]: 'Compostura',   // ← Cambio de "Remiendo" a "Compostura"
  [TIPOS_SERVICIO.RENTA]: 'Renta'
}

// ─── MÉTODOS DE PAGO ───────────────────────────────────────────────────────
export const METODOS_PAGO = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia'
}

// ─── CONCEPTOS DE PAGO ─────────────────────────────────────────────────────
export const CONCEPTOS_PAGO = {
  ANTICIPO: 'Anticipo',
  ABONO: 'Abono',
  LIQUIDACION: 'Liquidacion'
}

// ─── COLORES SEMÁNTICOS POR ESTADO ─────────────────────────────────────────
export const COLORES_ESTADO = {
  [ESTADOS_PEDIDO.EN_ESPERA]: { bg: 'bg-gray-100', text: 'text-gray-700', badge: 'gray' },
  [ESTADOS_PEDIDO.EN_PROCESO]: { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'blue' },
  [ESTADOS_PEDIDO.PRUEBA]: { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'yellow' },
  [ESTADOS_PEDIDO.TERMINADO]: { bg: 'bg-green-100', text: 'text-green-700', badge: 'green' },
  [ESTADOS_PEDIDO.ENTREGADO]: { bg: 'bg-success-100', text: 'text-success-700', badge: 'success' },
  [ESTADOS_PEDIDO.ABANDONADO]: { bg: 'bg-red-100', text: 'text-red-700', badge: 'red' }
}

// ─── COLORES SEMÁNTICOS POR TIPO DE SERVICIO ───────────────────────────────
export const COLORES_TIPO_SERVICIO = {
  [TIPOS_SERVICIO.CONFECCION]: { bg: 'bg-blue-100', text: 'text-blue-700' },
  [TIPOS_SERVICIO.COMPOSTURA]: { bg: 'bg-green-100', text: 'text-green-700' },
  [TIPOS_SERVICIO.RENTA]: { bg: 'bg-purple-100', text: 'text-purple-700' }
}
