import { supabase } from '../../../core/config/supabase'

/**
 * Servicio para obtener estadísticas del dashboard
 */
export class DashboardService {
    /**
     * Obtener estadísticas generales del negocio
     */
    async obtenerEstadisticas() {
        try {
            // 1. Total de pedidos activos (no entregados, no eliminados)
            const { count: totalActivos } = await supabase
                .from('pedidos')
                .select('*', { count: 'exact', head: true })
                .eq('eliminado', false)
                .neq('estado', 'Entregado')

            // 2. Total de clientes activos
            const { count: totalClientes } = await supabase
                .from('clientes')
                .select('*', { count: 'exact', head: true })
                .eq('activo', true)

            // 3. Saldo total pendiente
            const { data: pedidosConSaldo } = await supabase
                .from('pedidos')
                .select('saldo_pendiente')
                .eq('eliminado', false)
                .neq('estado', 'Entregado')
                .gt('saldo_pendiente', 0)

            const saldoTotal = pedidosConSaldo?.reduce(
                (sum, p) => sum + parseFloat(p.saldo_pendiente),
                0
            ) || 0

            // 4. Pedidos urgentes (fecha promesa <= hoy)
            const hoy = new Date()
            hoy.setHours(23, 59, 59, 999)

            const { data: pedidosUrgentes } = await supabase
                .from('pedidos')
                .select('id_pedido, fecha_promesa, clientes(nombre)')
                .eq('eliminado', false)
                .neq('estado', 'Entregado')
                .lte('fecha_promesa', hoy.toISOString())
                .order('fecha_promesa', { ascending: true })
                .limit(10)

            // 5. Ingresos del mes actual
            const inicioMes = new Date()
            inicioMes.setDate(1)
            inicioMes.setHours(0, 0, 0, 0)

            const { data: pagosDelMes } = await supabase
                .from('pagos')
                .select('monto')
                .gte('fecha_pago', inicioMes.toISOString())

            const ingresosMes = pagosDelMes?.reduce(
                (sum, p) => sum + parseFloat(p.monto),
                0
            ) || 0

            return {
                totalActivos: totalActivos || 0,
                totalClientes: totalClientes || 0,
                saldoPendiente: saldoTotal,
                pedidosUrgentes: pedidosUrgentes || [],
                ingresosMes
            }
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`)
        }
    }

    /**
     * Obtener pedidos por estado para el resumen
     */
    async obtenerPedidosPorEstado() {
        try {
            const { data: pedidos } = await supabase
                .from('pedidos')
                .select('estado')
                .eq('eliminado', false)
                .neq('estado', 'Entregado')

            const conteo = {
                'En Espera': 0,
                'En Proceso': 0,
                'Prueba': 0,
                'Terminado': 0
            }

            pedidos?.forEach(p => {
                if (conteo[p.estado] !== undefined) {
                    conteo[p.estado]++
                }
            })

            return conteo
        } catch (error) {
            throw new Error(`Error al obtener pedidos por estado: ${error.message}`)
        }
    }

    /**
     * Obtener ingresos de los últimos 7 días
     */
    async obtenerIngresosSemana() {
        try {
            const hace7Dias = new Date()
            hace7Dias.setDate(hace7Dias.getDate() - 7)
            hace7Dias.setHours(0, 0, 0, 0)

            const { data: pagos } = await supabase
                .from('pagos')
                .select('monto, fecha_pago')
                .gte('fecha_pago', hace7Dias.toISOString())
                .order('fecha_pago', { ascending: true })

            // Agrupar por día
            const ingresosPorDia = {}
            const hoy = new Date()

            for (let i = 6; i >= 0; i--) {
                const fecha = new Date()
                fecha.setDate(hoy.getDate() - i)
                const key = fecha.toISOString().split('T')[0]
                ingresosPorDia[key] = 0
            }

            pagos?.forEach(pago => {
                const fecha = pago.fecha_pago.split('T')[0]
                if (ingresosPorDia[fecha] !== undefined) {
                    ingresosPorDia[fecha] += parseFloat(pago.monto)
                }
            })

            return Object.entries(ingresosPorDia).map(([fecha, monto]) => ({
                fecha: new Date(fecha).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short'
                }),
                monto: parseFloat(monto.toFixed(2))
            }))
        } catch (error) {
            throw new Error(`Error al obtener ingresos de la semana: ${error.message}`)
        }
    }

    /**
     * Obtener actividad reciente (últimos cambios)
     */
    async obtenerActividadReciente() {
        try {
            // Últimos 10 pedidos creados
            const { data: pedidosRecientes } = await supabase
                .from('pedidos')
                .select(`
          id_pedido,
          tipo_servicio,
          estado,
          fecha_creacion,
          clientes(nombre)
        `)
                .eq('eliminado', false)
                .order('fecha_creacion', { ascending: false })
                .limit(5)

            // Últimos 5 pagos
            const { data: pagosRecientes } = await supabase
                .from('pagos')
                .select(`
          id_pago,
          monto,
          concepto,
          fecha_pago,
          pedidos(
            id_pedido,
            clientes(nombre)
          )
        `)
                .order('fecha_pago', { ascending: false })
                .limit(5)

            const actividades = []

            // Combinar pedidos
            pedidosRecientes?.forEach(pedido => {
                actividades.push({
                    tipo: 'pedido',
                    titulo: `Nuevo pedido #${pedido.id_pedido}`,
                    descripcion: `${pedido.tipo_servicio} - ${pedido.clientes?.nombre || 'Cliente sin nombre'}`,
                    fecha: pedido.fecha_creacion,
                    icono: 'package'
                })
            })

            // Combinar pagos
            pagosRecientes?.forEach(pago => {
                actividades.push({
                    tipo: 'pago',
                    titulo: `Pago recibido`,
                    descripcion: `$${parseFloat(pago.monto).toFixed(2)} - ${pago.concepto} (Pedido #${pago.pedidos?.id_pedido})`,
                    fecha: pago.fecha_pago,
                    icono: 'dollar'
                })
            })

            // Ordenar por fecha
            actividades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

            return actividades.slice(0, 10)
        } catch (error) {
            throw new Error(`Error al obtener actividad reciente: ${error.message}`)
        }
    }

    /**
     * Obtener próximos pedidos a entregar
     */
    async obtenerProximosVencimientos() {
        try {
            const hoy = new Date()
            const en7Dias = new Date()
            en7Dias.setDate(hoy.getDate() + 7)

            const { data: pedidos } = await supabase
                .from('pedidos')
                .select(`
          id_pedido,
          fecha_promesa,
          tipo_servicio,
          estado,
          saldo_pendiente,
          clientes(nombre, telefono)
        `)
                .eq('eliminado', false)
                .neq('estado', 'Entregado')
                .gte('fecha_promesa', hoy.toISOString())
                .lte('fecha_promesa', en7Dias.toISOString())
                .order('fecha_promesa', { ascending: true })
                .limit(5)

            return pedidos || []
        } catch (error) {
            throw new Error(`Error al obtener próximos vencimientos: ${error.message}`)
        }
    }
}