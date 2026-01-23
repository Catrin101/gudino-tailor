import { MedidaRepository } from './MedidaRepository'
import { TOLERANCIA_AJUSTE } from '../../../core/constants/medidas'

/**
 * Servicio de lógica de negocio para medidas
 * Maneja validaciones, comparaciones y reglas de negocio
 */
export class MedidaService {
  constructor() {
    this.repository = new MedidaRepository()
  }

  /**
   * Validar valores de medidas
   * @param {Object} valores - Objeto JSON con las medidas
   * @param {string} tipoMedida - 'Torso' | 'Pantalon'
   * @returns {Object} { valido: boolean, errores: Object }
   */
  validar(valores, tipoMedida) {
    const errores = {}

    if (!valores || typeof valores !== 'object') {
      return {
        valido: false,
        errores: { general: 'Los valores de medidas son obligatorios' }
      }
    }

    // Validar que todos los valores sean números positivos
    Object.entries(valores).forEach(([campo, valor]) => {
      const numero = parseFloat(valor)

      if (isNaN(numero) || numero <= 0) {
        errores[campo] = 'Debe ser un número positivo'
      } else if (numero > 300) {
        errores[campo] = 'Valor demasiado grande (máximo 300 cm)'
      } else if (!/^\d+(\.\d{1,2})?$/.test(valor.toString())) {
        errores[campo] = 'Máximo 2 decimales permitidos'
      }
    })

    return {
      valido: Object.keys(errores).length === 0,
      errores
    }
  }

  /**
   * Comparar medidas actuales con anteriores
   * Detecta cambios extremos fuera de tolerancia
   * @param {Object} medidasNuevas
   * @param {Object} medidasAnteriores
   * @returns {Object} { cambiosExtremos: Array, diferencias: Object }
   */
  compararMedidas(medidasNuevas, medidasAnteriores) {
    const cambiosExtremos = []
    const diferencias = {}

    if (!medidasAnteriores) {
      return { cambiosExtremos: [], diferencias: {} }
    }

    Object.entries(medidasNuevas).forEach(([campo, valorNuevo]) => {
      const valorAnterior = medidasAnteriores[campo]

      if (valorAnterior !== undefined) {
        const diferencia = Math.abs(parseFloat(valorNuevo) - parseFloat(valorAnterior))
        diferencias[campo] = {
          anterior: parseFloat(valorAnterior),
          nuevo: parseFloat(valorNuevo),
          diferencia: diferencia,
          aumento: parseFloat(valorNuevo) > parseFloat(valorAnterior)
        }

        // Verificar si excede la tolerancia
        const tolerancia = TOLERANCIA_AJUSTE[campo] || 5 // Default 5cm
        if (diferencia > tolerancia) {
          cambiosExtremos.push({
            campo,
            valorAnterior: parseFloat(valorAnterior),
            valorNuevo: parseFloat(valorNuevo),
            diferencia,
            tolerancia,
            porcentaje: ((diferencia / parseFloat(valorAnterior)) * 100).toFixed(1)
          })
        }
      }
    })

    return { cambiosExtremos, diferencias }
  }

  /**
   * Crear nueva medida con validación
   * @param {Object} medida
   * @returns {Promise<Object>}
   */
  async crear(medida) {
    // Validar valores
    const validacion = this.validar(medida.valores, medida.tipo_medida)
    if (!validacion.valido) {
      throw new Error(JSON.stringify(validacion.errores))
    }

    // Obtener medidas anteriores del mismo tipo (si falla, asumimos que no hay)
    let medidasAnteriores = null
    try {
      medidasAnteriores = await this.repository.obtenerUltimasPorTipo(
        medida.id_cliente,
        medida.tipo_medida
      )
    } catch (error) {
      console.warn('No se pudieron obtener medidas anteriores:', error)
      // Continuamos sin comparación
    }

    // Comparar si existen medidas anteriores
    if (medidasAnteriores) {
      const { cambiosExtremos } = this.compararMedidas(
        medida.valores,
        medidasAnteriores.valores
      )

      // Si hay cambios extremos, agregar información a la medida
      if (cambiosExtremos.length > 0) {
        medida.tiene_cambios_extremos = true
        medida.cambios_detectados = cambiosExtremos
      }
    }

    // Crear la medida
    return await this.repository.crear(medida)
  }

  /**
   * Actualizar medida (crea nueva versión en lugar de sobrescribir)
   * @param {number} idMedidaAnterior
   * @param {Object} nuevosValores
   * @returns {Promise<Object>}
   */
  async actualizarCreandoVersion(idMedidaAnterior, nuevosValores) {
    // Obtener medida anterior
    const medidaAnterior = await this.repository.obtenerPorId(idMedidaAnterior)

    if (!medidaAnterior) {
      throw new Error('Medida anterior no encontrada')
    }

    // Marcar la anterior como inactiva
    await this.repository.marcarComoInactiva(idMedidaAnterior)

    // Crear nueva versión
    return await this.crear({
      id_cliente: medidaAnterior.id_cliente,
      tipo_medida: medidaAnterior.tipo_medida,
      valores: nuevosValores,
      etiqueta: `${medidaAnterior.etiqueta || 'Medida'} (Actualizada)`
    })
  }

  /**
   * Obtener medidas por cliente
   * @param {number} idCliente
   * @returns {Promise<Array>}
   */
  async obtenerPorCliente(idCliente) {
    return await this.repository.obtenerPorCliente(idCliente)
  }

  /**
   * Obtener últimas medidas activas por tipo
   * @param {number} idCliente
   * @param {string} tipoMedida
   * @returns {Promise<Object|null>}
   */
  async obtenerUltimasPorTipo(idCliente, tipoMedida) {
    return await this.repository.obtenerUltimasPorTipo(idCliente, tipoMedida)
  }

  /**
   * Obtener medida por ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async obtenerPorId(id) {
    return await this.repository.obtenerPorId(id)
  }

  /**
   * Obtener historial completo
   * @param {number} idCliente
   * @returns {Promise<Array>}
   */
  async obtenerHistorial(idCliente) {
    return await this.repository.obtenerHistorialCompleto(idCliente)
  }

  /**
   * Buscar por etiqueta
   * @param {number} idCliente
   * @param {string} etiqueta
   * @returns {Promise<Array>}
   */
  async buscarPorEtiqueta(idCliente, etiqueta) {
    return await this.repository.buscarPorEtiqueta(idCliente, etiqueta)
  }

  /**
   * Eliminar medida
   * @param {number} id
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    return await this.repository.eliminar(id)
  }
}
