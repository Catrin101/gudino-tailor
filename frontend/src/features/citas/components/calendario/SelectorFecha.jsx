import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'

export function SelectorFecha({ fechaActual, vista, onAnterior, onSiguiente, onHoy, onToggleVista }) {
  const formatearTitulo = () => {
    if (vista === 'semanal') {
      const lunes = new Date(fechaActual)
      lunes.setDate(fechaActual.getDate() - ((fechaActual.getDay() + 6) % 7))
      const domingo = new Date(lunes)
      domingo.setDate(lunes.getDate() + 6)

      const mesLunes = lunes.toLocaleDateString('es-MX', { month: 'short' })
      const mesDom = domingo.toLocaleDateString('es-MX', { month: 'short' })
      const anio = domingo.getFullYear()

      if (lunes.getMonth() === domingo.getMonth()) {
        return `${lunes.getDate()} - ${domingo.getDate()} de ${mesLunes} ${anio}`
      }
      return `${lunes.getDate()} ${mesLunes} - ${domingo.getDate()} ${mesDom} ${anio}`
    }

    return fechaActual.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onAnterior}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 min-w-[280px] text-center capitalize">
          {formatearTitulo()}
        </h2>

        <button
          onClick={onSiguiente}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        <Button variant="outline" size="sm" onClick={onHoy}>
          Hoy
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={onToggleVista} className="flex items-center gap-2">
        <CalendarDays className="w-4 h-4" />
        {vista === 'semanal' ? 'Vista Diaria' : 'Vista Semanal'}
      </Button>
    </div>
  )
}
