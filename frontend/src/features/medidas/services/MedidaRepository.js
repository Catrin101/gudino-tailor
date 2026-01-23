import { supabase } from '../../../core/config/supabase'

/**
 * Repositorio para operaciones CRUD de medidas en Supabase
 * Maneja toda la comunicación con la base de datos
 */
export class MedidaRepository {
    /**
     * Crear nueva medida
     * @param {Object} medida
     * @returns {Promise<Object>}
     */
    async crear(medida) {
        const { data, error } = await supabase
            .from('medidas')
            .insert([{
                id_cliente: medida.id_cliente,
                tipo_medida: medida.tipo_medida,
                valores: medida.valores, // JSONB
                etiqueta: medida.etiqueta,
                fecha_toma: new Date().toISOString(),
                activo: true
            }])
            .select()
            .single()

        if (error) {
            throw new Error(`Error al crear medida: ${error.message}`)
        }

        return data
    }

    /**
     * Obtener medidas por cliente (solo activas)
     * @param {number} idCliente
     * @returns {Promise<Array>}
     */
    async obtenerPorCliente(idCliente) {
        const { data, error } = await supabase
            .from('medidas')
            .select('*')
            .eq('id_cliente', idCliente)
            .eq('activo', true)
            .order('fecha_toma', { ascending: false })

        if (error) {
            throw new Error(`Error al obtener medidas del cliente: ${error.message}`)
        }

        return data || []
    }

    /**
     * Obtener última medida activa por tipo
     * @param {number} idCliente
     * @param {string} tipoMedida
     * @returns {Promise<Object|null>}
     */
    async obtenerUltimasPorTipo(idCliente, tipoMedida) {
        const { data, error } = await supabase
            .from('medidas')
            .select('*')
            .eq('id_cliente', idCliente)
            .eq('tipo_medida', tipoMedida)
            .eq('activo', true)
            .order('fecha_toma', { ascending: false })
            .limit(1)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null // No encontrado
            }
            throw new Error(`Error al obtener última medida: ${error.message}`)
        }

        return data
    }

    /**
     * Obtener medida por ID
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    async obtenerPorId(id) {
        const { data, error } = await supabase
            .from('medidas')
            .select('*')
            .eq('id_medida', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw new Error(`Error al obtener medida: ${error.message}`)
        }

        return data
    }

    /**
     * Marcar medida como inactiva (para versionado)
     * @param {number} id
     * @returns {Promise<void>}
     */
    async marcarComoInactiva(id) {
        const { error } = await supabase
            .from('medidas')
            .update({ activo: false })
            .eq('id_medida', id)

        if (error) {
            throw new Error(`Error al desactivar medida anterior: ${error.message}`)
        }
    }

    /**
     * Obtener historial completo (incluyendo inactivas)
     * @param {number} idCliente
     * @returns {Promise<Array>}
     */
    async obtenerHistorialCompleto(idCliente) {
        const { data, error } = await supabase
            .from('medidas')
            .select('*')
            .eq('id_cliente', idCliente)
            .order('fecha_toma', { ascending: false })

        if (error) {
            throw new Error(`Error al obtener historial: ${error.message}`)
        }

        return data || []
    }

    /**
     * Buscar por etiqueta
     * @param {number} idCliente
     * @param {string} etiqueta
     * @returns {Promise<Array>}
     */
    async buscarPorEtiqueta(idCliente, etiqueta) {
        const terminoBusqueda = `%${etiqueta}%`

        const { data, error } = await supabase
            .from('medidas')
            .select('*')
            .eq('id_cliente', idCliente)
            .ilike('etiqueta', terminoBusqueda)
            .order('fecha_toma', { ascending: false })

        if (error) {
            throw new Error(`Error al buscar medidas: ${error.message}`)
        }

        return data || []
    }

    /**
     * Eliminar medida (Hard delete)
     * @param {number} id
     * @returns {Promise<void>}
     */
    async eliminar(id) {
        const { error } = await supabase
            .from('medidas')
            .delete()
            .eq('id_medida', id)

        if (error) {
            throw new Error(`Error al eliminar medida: ${error.message}`)
        }
    }
}
