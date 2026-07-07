import { X, User, Phone, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../core/config/supabase'
import { useCitas } from '../../hooks/useCitas'

export function Paso1ClienteCita({ clienteSeleccionado, onSeleccionar }) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [penalizaciones, setPenalizaciones] = useState([])
  const [cargando, setCargando] = useState(false)
  const { obtenerPenalizacionesPendientes } = useCitas()

  useEffect(() => {
    if (busqueda.length < 2) {
      setResultados([])
      return
    }

    const timer = setTimeout(async () => {
      setCargando(true)
      try {
        const { data } = await supabase
          .from('clientes')
          .select('id_cliente, nombre, telefono')
          .ilike('nombre', `%${busqueda}%`)
          .is('deleted_at', null)
          .limit(10)
        setResultados(data || [])
      } catch {
        setResultados([])
      } finally {
        setCargando(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [busqueda])

  const handleSeleccionar = async (cliente) => {
    onSeleccionar(cliente)
    setBusqueda('')
    setResultados([])
    const pen = await obtenerPenalizacionesPendientes(cliente.id_cliente)
    setPenalizaciones(pen)
  }

  return (
    <div className="p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">¿Con quién es la cita?</h3>
      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Busca y selecciona el cliente</p>

      <div className="relative mb-4">
        <input
          type="text"
          value={clienteSeleccionado ? clienteSeleccionado.nombre : busqueda}
          onChange={(e) => {
            if (!clienteSeleccionado) setBusqueda(e.target.value)
          }}
          onFocus={() => {
            if (clienteSeleccionado) {
              onSeleccionar(null)
              setPenalizaciones([])
            }
          }}
          placeholder="Buscar por nombre..."
          disabled={!!clienteSeleccionado}
          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg text-base sm:text-lg
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {cargando && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {resultados.length > 0 && (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-60 overflow-y-auto mb-4">
          {resultados.map(cliente => (
            <button
              key={cliente.id_cliente}
              onClick={() => handleSeleccionar(cliente)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{cliente.nombre}</p>
                {cliente.telefono && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Phone className="w-3.5 h-3.5" />
                    {cliente.telefono}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {clienteSeleccionado && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-green-900 text-lg">{clienteSeleccionado.nombre}</p>
              {clienteSeleccionado.telefono && (
                <p className="text-sm text-green-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {clienteSeleccionado.telefono}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {penalizaciones.length > 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">
                Este cliente tiene ${penalizaciones.reduce((sum, p) => sum + p.monto, 0).toFixed(2)} MXN pendientes de citas anteriores.
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {penalizaciones.length} penalización{penalizaciones.length > 1 ? 'es' : ''} por cobrar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
