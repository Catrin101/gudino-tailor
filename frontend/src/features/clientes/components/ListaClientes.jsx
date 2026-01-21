import { useState } from 'react'
import { Search, UserPlus, Filter } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { TarjetaCliente } from './TarjetaCliente'

/**
 * Componente para listar y buscar clientes
 * Incluye barra de búsqueda y filtros
 */
export function ListaClientes({ 
  clientes, 
  onClienteClick, 
  onNuevoCliente,
  onBuscar,
  loading 
}) {
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [mostrarInactivos, setMostrarInactivos] = useState(false)

  /**
   * Manejar cambio en el input de búsqueda
   */
  const handleBusquedaChange = (e) => {
    const valor = e.target.value
    setTerminoBusqueda(valor)
    onBuscar(valor)
  }

  /**
   * Limpiar búsqueda
   */
  const limpiarBusqueda = () => {
    setTerminoBusqueda('')
    onBuscar('')
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón nuevo */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Barra de búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={terminoBusqueda}
            onChange={handleBusquedaChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-lg
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {terminoBusqueda && (
            <button
              onClick={limpiarBusqueda}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 
                       text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Botón nuevo cliente */}
        <Button
          variant="primary"
          onClick={onNuevoCliente}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={mostrarInactivos}
            onChange={(e) => setMostrarInactivos(e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Mostrar clientes inactivos</span>
        </label>

        <div className="flex-1"></div>

        {/* Contador */}
        <div className="text-sm text-gray-600">
          {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lista de clientes */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Cargando clientes...</p>
        </div>
      ) : clientes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {terminoBusqueda 
              ? 'No se encontraron clientes con ese criterio' 
              : 'No hay clientes registrados aún'}
          </p>
          {!terminoBusqueda && (
            <Button
              variant="primary"
              onClick={onNuevoCliente}
              className="mt-4"
            >
              Crear Primer Cliente
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientes
            .filter(c => mostrarInactivos || c.activo)
            .map(cliente => (
              <TarjetaCliente
                key={cliente.id_cliente}
                cliente={cliente}
                onClick={onClienteClick}
              />
            ))}
        </div>
      )}
    </div>
  )
}
