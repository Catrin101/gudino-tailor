import { useDashboard } from '../features/dashboard/hooks/useDashboard'
import { EstadisticaCard } from '../features/dashboard/components/EstadisticaCard'
import { GraficaIngresos } from '../features/dashboard/components/GraficaIngresos'
import { ListaActividad } from '../features/dashboard/components/ListaActividad'
import { ProximosVencimientos } from '../features/dashboard/components/ProximosVencimientos'
import { Package, Users, DollarSign, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '../shared/components/Button'

/**
 * Página principal del dashboard
 * Muestra resumen de estadísticas en tiempo real
 */
export function DashboardPage() {
  const {
    estadisticas,
    pedidosPorEstado,
    ingresosSemana,
    actividades,
    proximosVencimientos,
    loading,
    error,
    recargar
  } = useDashboard()

  /**
   * Manejar clic en pedido próximo
   */
  const handlePedidoClick = (pedido) => {
    // Navegar a la página de pedidos
    window.location.href = '/pedidos'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Resumen de tu negocio - {new Date().toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={recargar}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-danger-50 text-danger-700 border border-danger-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Error al cargar datos: {error}</span>
          </div>
        </div>
      )}

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <EstadisticaCard
          titulo="Pedidos Activos"
          valor={estadisticas?.totalActivos || 0}
          icono={Package}
          color="blue"
          subtitulo="No entregados"
        />

        <EstadisticaCard
          titulo="Clientes"
          valor={estadisticas?.totalClientes || 0}
          icono={Users}
          color="green"
          subtitulo="Registrados activos"
        />

        <EstadisticaCard
          titulo="Saldo Pendiente"
          valor={estadisticas?.saldoPendiente || 0}
          icono={DollarSign}
          color="yellow"
          formato="moneda"
          subtitulo="Por cobrar"
        />

        <EstadisticaCard
          titulo="Pedidos Urgentes"
          valor={estadisticas?.pedidosUrgentes?.length || 0}
          icono={AlertCircle}
          color="red"
          subtitulo="Vencen hoy o vencidos"
        />
      </div>

      {/* Estadísticas por estado */}
      {pedidosPorEstado && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <EstadisticaCard
            titulo="En Espera"
            valor={pedidosPorEstado['En Espera'] || 0}
            color="primary"
          />
          <EstadisticaCard
            titulo="En Proceso"
            valor={pedidosPorEstado['En Proceso'] || 0}
            color="blue"
          />
          <EstadisticaCard
            titulo="En Prueba"
            valor={pedidosPorEstado['Prueba'] || 0}
            color="yellow"
          />
          <EstadisticaCard
            titulo="Terminados"
            valor={pedidosPorEstado['Terminado'] || 0}
            color="green"
          />
        </div>
      )}

      {/* Gráfica de ingresos */}
      <div className="mb-8">
        <GraficaIngresos
          datos={ingresosSemana}
          loading={loading}
        />
      </div>

      {/* Ingresos del mes */}
      {estadisticas && (
        <div className="mb-8">
          <EstadisticaCard
            titulo="Ingresos del Mes Actual"
            valor={estadisticas.ingresosMes || 0}
            icono={DollarSign}
            color="green"
            formato="moneda"
            subtitulo={`${new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`}
          />
        </div>
      )}

      {/* Secciones adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos vencimientos */}
        <ProximosVencimientos
          pedidos={proximosVencimientos}
          loading={loading}
          onPedidoClick={handlePedidoClick}
        />

        {/* Actividad reciente */}
        <ListaActividad
          actividades={actividades}
          loading={loading}
        />
      </div>

      {/* Información adicional */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">💡 Datos en tiempo real</p>
            <p>
              Los datos se actualizan automáticamente cada 5 minutos.
              Puedes actualizar manualmente usando el botón "Actualizar" en cualquier momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
