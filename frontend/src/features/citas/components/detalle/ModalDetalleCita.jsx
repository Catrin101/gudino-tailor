import { useState, useEffect } from 'react'
import { useCitas } from '../../hooks/useCitas'
import { COLORES_ESTADO_CITA, RAZONES_CITA } from '../../../../core/constants/citas'
import { ModalConfirmarCancelacion } from '../modales/ModalConfirmarCancelacion'
import { ModalCondonarPenalizacion } from '../modales/ModalCondonarPenalizacion'
import { X, Clock, User, Phone, FileText, Package, Calendar, AlertTriangle } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { useNavigate } from 'react-router-dom'

export function ModalDetalleCita({ cita: citaInicial, onCerrar, onActualizar }) {
  const [cita, setCita] = useState(citaInicial)
  const [mostrarCancelar, setMostrarCancelar] = useState(false)
  const [mostrarNoShow, setMostrarNoShow] = useState(false)
  const [mostrarCondonar, setMostrarCondonar] = useState(false)
  const [penalizacionActual, setPenalizacionActual] = useState(null)
  const [accionPendiente, setAccionPendiente] = useState(null)
  const { cancelarCita, marcarNoShow, completarCita, confirmarCita, loading } = useCitas()
  const navigate = useNavigate()

  const colores = COLORES_ESTADO_CITA[cita.estado] || COLORES_ESTADO_CITA['Agendada']
  const razonInfo = RAZONES_CITA[cita.razon]
  const fechaInicio = new Date(cita.fecha_hora_inicio)
  const fechaFin = new Date(cita.fecha_hora_fin)
  const yaPaso = fechaFin < new Date()
  const esCancelable = ['Agendada', 'Confirmada'].includes(cita.estado)
  const esMovible = esCancelable && cita.veces_movida < 2

  const handleCancelar = async (canceladaPor) => {
    try {
      const resultado = await cancelarCita(cita.id_cita, canceladaPor)
      if (resultado?.penalizacion) {
        setPenalizacionActual(resultado.penalizacion)
        setMostrarCancelar(false)
        if (resultado.penalizacion.monto > 0) {
          setAccionPendiente(null)
        }
      }
      const actualizada = { ...cita, estado: 'Cancelada', cancelada_por: canceladaPor }
      setCita(actualizada)
      setMostrarCancelar(false)
      onActualizar()
    } catch {}
  }

  const handleCondonar = async (motivo) => {
    if (penalizacionActual) {
      await cancelarCita(cita.id_cita, 'Cliente', true, motivo)
    }
    setMostrarCondonar(false)
    setCita({ ...cita, estado: 'Cancelada', cancelada_por: 'Cliente' })
    setMostrarCancelar(false)
    onActualizar()
  }

  const handleNoShow = async () => {
    try {
      await marcarNoShow(cita.id_cita)
      setCita({ ...cita, estado: 'No Show' })
      setMostrarNoShow(false)
      onActualizar()
    } catch {}
  }

  const handleCompletar = async () => {
    try {
      await completarCita(cita.id_cita)
      setCita({ ...cita, estado: 'Completada' })
      onActualizar()
    } catch {}
  }

  const handleConfirmar = async () => {
    try {
      await confirmarCita(cita.id_cita)
      setCita({ ...cita, estado: 'Confirmada' })
      onActualizar()
    } catch {}
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${colores.point}`} />
            <h2 className="text-xl font-bold text-gray-900">Detalle de Cita</h2>
          </div>
          <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Estado */}
        <div className="px-6 pt-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${colores.bg} ${colores.text}`}>
            {cita.estado}
          </span>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Cliente */}
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="font-bold text-gray-900 text-lg">{cita.clientes?.nombre}</p>
              {cita.clientes?.telefono && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {cita.clientes.telefono}
                </p>
              )}
            </div>
          </div>

          {/* Razón */}
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Razón</p>
              <p className="font-bold text-gray-900">{razonInfo?.label || cita.razon}</p>
              <p className="text-sm text-gray-600">~{razonInfo?.duracion || 30} minutos</p>
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Fecha y hora</p>
              <p className="font-bold text-gray-900">
                {fechaInicio.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {fechaInicio.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                {' — '}
                {fechaFin.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Pedido vinculado */}
          {cita.pedidos && (
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Pedido vinculado</p>
                <button
                  onClick={() => {
                    onCerrar()
                    navigate('/pedidos')
                  }}
                  className="font-bold text-primary-600 hover:text-primary-700"
                >
                  #{String(cita.pedidos.id_pedido).slice(-4)} — {cita.pedidos.tipo_servicio}
                </button>
              </div>
            </div>
          )}

          {/* Notas */}
          {cita.notas_adicionales && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Notas</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{cita.notas_adicionales}</p>
              </div>
            </div>
          )}

          {/* Movimientos */}
          {cita.veces_movida > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              Movida {cita.veces_movida} {cita.veces_movida === 1 ? 'vez' : 'veces'}
              {cita.veces_movida >= 2 && ' — Límite alcanzado'}
            </div>
          )}

          {/* Penalizaciones */}
          {cita.penalizaciones_cita?.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Penalizaciones</p>
              {cita.penalizaciones_cita.map(p => (
                <div key={p.id_penalizacion} className={`p-3 rounded-lg mb-2 ${
                  p.estado_cobro === 'Pendiente' ? 'bg-red-50 border border-red-200' :
                  p.estado_cobro === 'Condonada' ? 'bg-gray-50 border border-gray-200' :
                  'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">${p.monto.toFixed(2)} MXN</p>
                      <p className="text-xs text-gray-600">
                        {p.tipo === 'Cancelacion_Tardia' ? 'Cancelación tardía' :
                         p.tipo === 'No_Show' ? 'No Show' : p.tipo}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      p.estado_cobro === 'Pendiente' ? 'bg-red-100 text-red-700' :
                      p.estado_cobro === 'Condonada' ? 'bg-gray-100 text-gray-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {p.estado_cobro}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
          <div className="grid grid-cols-2 gap-2">
            {esMovible && (
              <Button
                variant="outline"
                onClick={() => {
                  onCerrar()
                  navigate('/calendario')
                }}
                className="text-sm"
              >
                ✏️ Mover Cita
              </Button>
            )}

            {esCancelable && (
              <Button
                variant="danger"
                onClick={() => {
                  const calc = { monto: 0 }
                  const horasAntes = (fechaInicio - new Date()) / (1000 * 60 * 60)
                  if (horasAntes < 24) calc.monto = 150
                  else if (horasAntes < 48) calc.monto = 75
                  setPenalizacionActual(calc.monto > 0 ? calc : null)
                  setMostrarCancelar(true)
                }}
                className="text-sm"
              >
                ❌ Cancelar
              </Button>
            )}

            {yaPaso && esCancelable && (
              <>
                <Button variant="success" onClick={handleCompletar} className="text-sm">
                  ✅ Completada
                </Button>
                <Button variant="danger" onClick={() => setMostrarNoShow(true)} className="text-sm">
                  🚫 No Show
                </Button>
              </>
            )}

            {cita.estado === 'Agendada' && !yaPaso && (
              <Button variant="success" onClick={handleConfirmar} className="text-sm col-span-2">
                ✓ Confirmar Cita
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modales de acción */}
      {mostrarCancelar && (
        <ModalConfirmarCancelacion
          cita={cita}
          penalizacion={penalizacionActual}
          onConfirmar={handleCancelar}
          onCondonar={() => {
            setMostrarCondonar(true)
          }}
          onCerrar={() => setMostrarCancelar(false)}
          loading={loading}
        />
      )}

      {mostrarNoShow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900">¿Marcar como No Show?</h3>
              <p className="text-gray-600 mt-2">
                Se generará una penalización de <strong>$200.00 MXN</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setMostrarNoShow(false)} disabled={loading} className="flex-1">
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleNoShow} disabled={loading} className="flex-1">
                {loading ? 'Marcando...' : 'Confirmar No Show'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {mostrarCondonar && penalizacionActual && (
        <ModalCondonarPenalizacion
          penalizacion={penalizacionActual}
          onConfirmar={handleCondonar}
          onCerrar={() => setMostrarCondonar(false)}
          loading={loading}
        />
      )}
    </div>
  )
}
