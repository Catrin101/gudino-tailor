export const ROLES = {
  ADMIN: 'ADMIN',
  OPERADOR: 'OPERADOR'
}

export const PERMISOS = {
  [ROLES.ADMIN]: {
    clientes: { crear: true, editar: true, eliminar: true, ver: true },
    medidas: { crear: true, editar: true, eliminar: true, ver: true },
    pedidos: { crear: true, editar: true, eliminar: true, ver: true },
    pagos: { registrar: true, editar: true, eliminar: true, ver: true },
    usuarios: { gestionar: true }
  },
  [ROLES.OPERADOR]: {
    clientes: { crear: false, editar: false, eliminar: false, ver: true },
    medidas: { crear: true, editar: true, eliminar: false, ver: true },
    pedidos: { crear: true, editar: true, eliminar: false, ver: true },
    pagos: { registrar: true, editar: false, eliminar: false, ver: true },
    usuarios: { gestionar: false }
  }
}
