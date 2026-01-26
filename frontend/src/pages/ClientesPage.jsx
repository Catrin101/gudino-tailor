import { useState } from 'react'
import { useClientes } from '../features/clientes/hooks/useClientes'
import { useNotification } from '../shared/context/NotificationContext'
import { ListaClientes } from '../features/clientes/components/ListaClientes'
import { FormularioCliente } from '../features/clientes/components/FormularioCliente'
import { ModalCliente } from '../features/clientes/components/ModalCliente'
import { Card } from '../shared/components/Card'

/**
 * Página principal del módulo de clientes
 * Maneja el estado y la lógica de navegación
 */
export function ClientesPage() {
  const {
    clientes,
    loading,
    error,
    buscarClientes,
    crearCliente,
    actualizarCliente,
    desactivarCliente
  } = useClientes()

  const [vistaActual, setVistaActual] = useState('lista') // 'lista' | 'formulario'
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const notification = useNotification()

  /**
   * Manejar creación de nuevo cliente
   */
  const handleNuevoCliente = () => {
    setClienteSeleccionado(null)
    setVistaActual('formulario')
  }

  /**
   * Manejar clic en tarjeta de cliente
   */
  const handleClienteClick = (cliente) => {
    setClienteSeleccionado(cliente)
    setMostrarModal(true)
  }

  /**
   * Manejar edición de cliente
   */
  const handleEditar = (cliente) => {
    setMostrarModal(false)
    setClienteSeleccionado(cliente)
    setVistaActual('formulario')
  }

  /**
   * Manejar guardado (crear o actualizar)
   */
  const handleGuardar = async (datosCliente) => {
    try {
      if (clienteSeleccionado) {
        // Actualizar
        await actualizarCliente(clienteSeleccionado.id_cliente, datosCliente)
        notification.success('Cliente actualizado correctamente')
      } else {
        // Crear
        await crearCliente(datosCliente)
        notification.success('Cliente creado correctamente')
      }
      setVistaActual('lista')
      setClienteSeleccionado(null)
    } catch (err) {
      notification.error(err.message)
    }
  }

  /**
   * Manejar desactivación
   */
  const handleDesactivar = async (cliente) => {
    const confirmado = await notification.showConfirm({
      title: 'Desactivar Cliente',
      message: `¿Estás seguro de desactivar a ${cliente.nombre}?`,
      type: 'danger',
      confirmText: 'Sí, desactivar',
      cancelText: 'Cancelar'
    })

    if (!confirmado) return

    try {
      await desactivarCliente(cliente.id_cliente)
      notification.success('Cliente desactivado correctamente')
      setMostrarModal(false)
    } catch (err) {
      notification.error(err.message)
    }
  }

  /**
   * Cancelar formulario
   */
  const handleCancelar = () => {
    setVistaActual('lista')
    setClienteSeleccionado(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Gestión de Clientes</h1>
        <p className="text-gray-600 mt-2">
          Administra la información de tus clientes
        </p>
      </div>

      {/* Error global */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-danger-50 text-danger-700 border border-danger-200">
          ⚠️ {error}
        </div>
      )}

      {/* Contenido principal */}
      {vistaActual === 'lista' ? (
        <ListaClientes
          clientes={clientes}
          onClienteClick={handleClienteClick}
          onNuevoCliente={handleNuevoCliente}
          onBuscar={buscarClientes}
          loading={loading}
        />
      ) : (
        <Card className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            {clienteSeleccionado ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <FormularioCliente
            cliente={clienteSeleccionado}
            onGuardar={handleGuardar}
            onCancelar={handleCancelar}
            loading={loading}
          />
        </Card>
      )}

      {/* Modal de detalles */}
      {mostrarModal && clienteSeleccionado && (
        <ModalCliente
          cliente={clienteSeleccionado}
          onCerrar={() => setMostrarModal(false)}
          onEditar={handleEditar}
          onDesactivar={handleDesactivar}
        />
      )}
    </div>
  )
}
