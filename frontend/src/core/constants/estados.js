export const ESTADOS_PEDIDO = {
  EN_ESPERA: 'En Espera',
  EN_PROCESO: 'En Proceso',
  PRUEBA: 'Prueba',
  TERMINADO: 'Terminado',
  ENTREGADO: 'Entregado',
  ABANDONADO: 'Abandonado'
}

export const FLUJO_ESTADOS = [
  ESTADOS_PEDIDO.EN_ESPERA,
  ESTADOS_PEDIDO.EN_PROCESO,
  ESTADOS_PEDIDO.PRUEBA,
  ESTADOS_PEDIDO.TERMINADO,
  ESTADOS_PEDIDO.ENTREGADO
]

export const COLORES_ESTADO = {
  [ESTADOS_PEDIDO.EN_ESPERA]: 'bg-gray-100 text-gray-800',
  [ESTADOS_PEDIDO.EN_PROCESO]: 'bg-blue-100 text-blue-800',
  [ESTADOS_PEDIDO.PRUEBA]: 'bg-yellow-100 text-yellow-800',
  [ESTADOS_PEDIDO.TERMINADO]: 'bg-green-100 text-green-800',
  [ESTADOS_PEDIDO.ENTREGADO]: 'bg-success-100 text-success-800',
  [ESTADOS_PEDIDO.ABANDONADO]: 'bg-red-100 text-red-800'
}

export const TIPOS_SERVICIO = {
  CONFECCION: 'Confeccion',
  REMIENDO: 'Remiendo',
  RENTA: 'Renta'
}

export const METODOS_PAGO = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia'
}

export const CONCEPTOS_PAGO = {
  ANTICIPO: 'Anticipo',
  ABONO: 'Abono',
  LIQUIDACION: 'Liquidacion'
}
