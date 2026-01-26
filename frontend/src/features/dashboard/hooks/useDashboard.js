import { useState, useEffect } from 'react'
import { DashboardService } from '../services/DashboardService'

/**
 * Hook personalizado para gestionar datos del dashboard
 */
export function useDashboard() {
    const [estadisticas, setEstadisticas] = useState(null)
    const [pedidosPorEstado, setPedidosPorEstado] = useState(null)
    const [ingresosSemana, setIngresosSemana] = useState([])
    const [actividades, setActividades] = useState([])
    const [proximosVencimientos, setProximosVencimientos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const service = new DashboardService()

    /**
     * Cargar todos los datos del dashboard
     */
    const cargarDatos = async () => {
        setLoading(true)
        setError(null)

        try {
            const [stats, estados, ingresos, activity, vencimientos] = await Promise.all([
                service.obtenerEstadisticas(),
                service.obtenerPedidosPorEstado(),
                service.obtenerIngresosSemana(),
                service.obtenerActividadReciente(),
                service.obtenerProximosVencimientos()
            ])

            setEstadisticas(stats)
            setPedidosPorEstado(estados)
            setIngresosSemana(ingresos)
            setActividades(activity)
            setProximosVencimientos(vencimientos)
        } catch (err) {
            setError(err.message)
            console.error('Error al cargar dashboard:', err)
        } finally {
            setLoading(false)
        }
    }

    /**
     * Recargar datos
     */
    const recargar = () => {
        cargarDatos()
    }

    // Cargar datos al montar
    useEffect(() => {
        cargarDatos()

        // Recargar cada 5 minutos
        const interval = setInterval(cargarDatos, 5 * 60 * 1000)

        return () => clearInterval(interval)
    }, [])

    return {
        estadisticas,
        pedidosPorEstado,
        ingresosSemana,
        actividades,
        proximosVencimientos,
        loading,
        error,
        recargar
    }
}