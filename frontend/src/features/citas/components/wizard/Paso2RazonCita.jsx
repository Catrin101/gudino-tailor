import { useState, useEffect } from 'react'
import { RAZONES_CITA } from '../../../../core/constants/citas'
import { ESTADOS_PEDIDO } from '../../../../core/constants/estados'
import { supabase } from '../../../../core/config/supabase'
import { Scissors, Truck, Ruler, RotateCcw, Package, MessageCircle, HelpCircle } from 'lucide-react'

const ICONOS_RAZON = {
  PRUEBA_PARCIAL: Scissors,
  ENTREGA_PEDIDO: Package,
  TOMA_MEDIDAS: Ruler,
  DEVOLUCION_RENTA: RotateCcw,
  REMIENDO_ENTREGA: Truck,
  CONSULTA: HelpCircle,
  OTRO: MessageCircle
}

export function Paso2RazonCita({ razonSeleccionada, notas, pedidoVinculado, clienteId, onActualizar }) {
  const [pedidos, setPedidos] = useState([])

  useEffect(() => {
    if (!clienteId) return
    const cargar = async () => {
      const { data } = await supabase
        .from('pedidos')
        .select('id_pedido, tipo_servicio, estado, nombre_grupo')
        .eq('id_cliente', clienteId)
        .in('estado', [ESTADOS_PEDIDO.EN_ESPERA, ESTADOS_PEDIDO.EN_PROCESO, ESTADOS_PEDIDO.PRUEBA])
      setPedidos(data || [])
    }
    cargar()
  }, [clienteId])

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">¿Para qué es la cita?</h3>
      <p className="text-gray-600 mb-6">Selecciona el motivo</p>

      {/* Selector de razón */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {Object.entries(RAZONES_CITA).map(([clave, razon]) => {
          const Icono = ICONOS_RAZON[clave] || HelpCircle
          const seleccionada = razonSeleccionada === clave
          return (
            <button
              key={clave}
              onClick={() => onActualizar({ razon: clave })}
              className={`
                p-4 rounded-xl border-2 transition-all text-left
                ${seleccionada
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
              `}
            >
              <Icono className={`w-6 h-6 mb-2 ${seleccionada ? 'text-primary-600' : 'text-gray-400'}`} />
              <p className={`font-semibold text-sm ${seleccionada ? 'text-primary-700' : 'text-gray-900'}`}>
                {razon.label}
              </p>
              <p className="text-xs text-gray-500 mt-1">{razon.descripcion}</p>
              <p className="text-xs text-gray-400 mt-1">~{razon.duracion} min</p>
            </button>
          )
        })}
      </div>

      {/* Notas adicionales */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas adicionales {razonSeleccionada === 'OTRO' && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={notas || ''}
          onChange={(e) => onActualizar({ notas_adicionales: e.target.value })}
          placeholder="Detalles específicos de la cita..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Pedido vinculado */}
      {pedidos.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vincular a pedido (opcional)
          </label>
          <select
            value={pedidoVinculado || ''}
            onChange={(e) => onActualizar({ id_pedido: e.target.value || null })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Sin pedido vinculado</option>
            {pedidos.map(p => (
              <option key={p.id_pedido} value={p.id_pedido}>
                #{String(p.id_pedido).slice(-4)} — {p.tipo_servicio} ({p.estado})
                {p.nombre_grupo ? ` — ${p.nombre_grupo}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
