import { Card } from '../../../shared/components/Card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * Tarjeta de estadística del dashboard
 */
export function EstadisticaCard({
    titulo,
    valor,
    icono: Icon,
    color = 'blue',
    subtitulo,
    cambio,
    formato = 'numero'
}) {
    const colores = {
        blue: {
            bg: 'bg-blue-500',
            bgLight: 'bg-blue-50',
            text: 'text-blue-700',
            textDark: 'text-blue-900'
        },
        green: {
            bg: 'bg-green-500',
            bgLight: 'bg-green-50',
            text: 'text-green-700',
            textDark: 'text-green-900'
        },
        yellow: {
            bg: 'bg-yellow-500',
            bgLight: 'bg-yellow-50',
            text: 'text-yellow-700',
            textDark: 'text-yellow-900'
        },
        red: {
            bg: 'bg-red-500',
            bgLight: 'bg-red-50',
            text: 'text-red-700',
            textDark: 'text-red-900'
        },
        purple: {
            bg: 'bg-purple-500',
            bgLight: 'bg-purple-50',
            text: 'text-purple-700',
            textDark: 'text-purple-900'
        },
        primary: {
            bg: 'bg-primary-500',
            bgLight: 'bg-primary-50',
            text: 'text-primary-700',
            textDark: 'text-primary-900'
        }
    }

    const colorClasses = colores[color] || colores.blue

    /**
     * Formatear valor según el tipo
     */
    const formatearValor = () => {
        if (formato === 'moneda') {
            return `$${parseFloat(valor).toLocaleString('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`
        }
        return valor.toLocaleString('es-MX')
    }

    /**
     * Renderizar indicador de cambio
     */
    const renderCambio = () => {
        if (!cambio) return null

        const { valor: valorCambio, tipo } = cambio

        if (tipo === 'aumento') {
            return (
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    <span>+{valorCambio}</span>
                </div>
            )
        }

        if (tipo === 'disminucion') {
            return (
                <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                    <TrendingDown className="w-4 h-4" />
                    <span>-{valorCambio}</span>
                </div>
            )
        }

        return (
            <div className="flex items-center gap-1 text-gray-500 text-sm font-medium">
                <Minus className="w-4 h-4" />
                <span>Sin cambio</span>
            </div>
        )
    }

    return (
        <Card className={`${colorClasses.bgLight} border-l-4 ${colorClasses.bg.replace('bg-', 'border-')} hover:shadow-lg transition-shadow`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className={`text-sm font-medium ${colorClasses.text} mb-1`}>
                        {titulo}
                    </p>
                    <p className={`text-3xl font-bold ${colorClasses.textDark} mb-2`}>
                        {formatearValor()}
                    </p>
                    {subtitulo && (
                        <p className="text-sm text-gray-600">
                            {subtitulo}
                        </p>
                    )}
                    {renderCambio()}
                </div>

                {Icon && (
                    <div className={`${colorClasses.bg} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                )}
            </div>
        </Card>
    )
}