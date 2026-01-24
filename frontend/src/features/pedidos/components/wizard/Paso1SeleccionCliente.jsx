import { useState } from 'react'
import { useClientes } from '../../../clientes/hooks/useClientes'
import { Search, User, Phone } from 'lucide-react'

/**
 * Paso 1: Selección de cliente
 */
export function Paso1SeleccionCliente({ clienteSeleccionado, onSeleccionar }) {
  const { clientes } = useClientes()
  const [busqueda, setBusqueda] = useState('')

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.telefono.includes(busqueda)
  )

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Selecciona el Cliente</h2>
      <p className="text-gray-600 mb-6">
        ¿Para quién es este pedido?
      </p>

      {/* Barra de búsqueda */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-lg
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Cliente seleccionado */}
      {clienteSeleccionado && (
        <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm text-primary-600 font-medium mb-1">Cliente Seleccionado:</p>
          <p className="text-lg font-bold text-primary-900">{clienteSeleccionado.nombre}</p>
          <p className="text-sm text-primary-700">{clienteSeleccionado.telefono}</p>
        </div>
      )}

      {/* Lista de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {clientesFiltrados.map(cliente => (
          <button
            key={cliente.id_cliente}
            onClick={() => onSeleccionar(cliente)}
            className={`
              text-left p-4 rounded-lg border-2 transition-all
              ${clienteSeleccionado?.id_cliente === cliente.id_cliente
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{cliente.nombre}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Phone className="w-3 h-3" />
                  <span>{cliente.telefono}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {clientesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron clientes</p>
        </div>
      )}
    </div>
  )
}
