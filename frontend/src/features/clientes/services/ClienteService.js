import { ClienteRepository } from './ClienteRepository'

/**
 * Servicio de lógica de negocio para clientes
 * Maneja validaciones y reglas de negocio
 */
export class ClienteService {
  constructor() {
    this.repository = new ClienteRepository()
  }

  /**
   * Validar datos del cliente
   * @param {Object} cliente
   * @returns {Object} { valido: boolean, errores: Array }
   */
  validar(cliente) {
    const errores = {}

    // Validar nombre
    if (!cliente.nombre || cliente.nombre.trim() === '') {
      errores.nombre = 'El nombre es obligatorio'
    } else if (cliente.nombre.trim().length < 3) {
      errores.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    // Validar teléfono
    if (!cliente.telefono || cliente.telefono.trim() === '') {
      errores.telefono = 'El teléfono es obligatorio'
    } else {
      // Limpiar teléfono (solo números)
      const telefonoLimpio = cliente.telefono.replace(/\D/g, '')
      
      if (telefonoLimpio.length !== 10) {
        errores.telefono = 'El teléfono debe tener 10 dígitos'
      }
    }

    return {
      valido: Object.keys(errores).length === 0,
      errores
    }
  }

  /**
   * Formatear número de teléfono a 10 dígitos
   * @param {string} telefono
   * @returns {string}
   */
  formatearTelefono(telefono) {
    if (!telefono) return ''
    
    // Eliminar todo excepto números
    const limpio = telefono.replace(/\D/g, '')
    
    // Tomar solo los primeros 10 dígitos
    return limpio.substring(0, 10)
  }

  /**
   * Limpiar datos del cliente antes de guardar
   * @param {Object} cliente
   * @returns {Object}
   */
  limpiarDatos(cliente) {
    return {
      nombre: cliente.nombre?.trim() || '',
      telefono: this.formatearTelefono(cliente.telefono),
      notas_generales: cliente.notas_generales?.trim() || null,
      deuda_historica: parseFloat(cliente.deuda_historica) || 0
    }
  }

  /**
   * Crear nuevo cliente
   * @param {Object} cliente
   * @returns {Promise<Object>}
   */
  async crear(cliente) {
    // Validar datos
    const validacion = this.validar(cliente)
    if (!validacion.valido) {
      throw new Error(JSON.stringify(validacion.errores))
    }

    // Limpiar y crear
    const clienteLimpio = this.limpiarDatos(cliente)
    return await this.repository.crear(clienteLimpio)
  }

  /**
   * Actualizar cliente
   * @param {number} id
   * @param {Object} datosActualizados
   * @returns {Promise<Object>}
   */
  async actualizar(id, datosActualizados) {
    // Validar datos
    const validacion = this.validar(datosActualizados)
    if (!validacion.valido) {
      throw new Error(JSON.stringify(validacion.errores))
    }

    // Limpiar y actualizar
    const datosLimpios = this.limpiarDatos(datosActualizados)
    return await this.repository.actualizar(id, datosLimpios)
  }

  /**
   * Desactivar cliente (con validación de pedidos activos)
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async desactivar(id) {
    // Verificar si tiene pedidos activos con saldo
    const tienePedidos = await this.repository.tienePedidosActivos(id)
    
    if (tienePedidos) {
      throw new Error('No se puede desactivar un cliente con pedidos activos y saldo pendiente')
    }

    return await this.repository.desactivar(id)
  }

  /**
   * Obtener todos los clientes
   * @param {boolean} incluirInactivos
   * @returns {Promise<Array>}
   */
  async obtenerTodos(incluirInactivos = false) {
    return await this.repository.obtenerTodos(incluirInactivos)
  }

  /**
   * Buscar clientes
   * @param {string} termino
   * @returns {Promise<Array>}
   */
  async buscar(termino) {
    return await this.repository.buscar(termino)
  }

  /**
   * Obtener cliente por ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async obtenerPorId(id) {
    return await this.repository.obtenerPorId(id)
  }

  /**
   * Reactivar cliente
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async reactivar(id) {
    return await this.repository.reactivar(id)
  }

  /**
   * Obtener estadísticas del cliente
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async obtenerEstadisticas(id) {
    return await this.repository.obtenerEstadisticas(id)
  }
}
