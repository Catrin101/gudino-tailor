import { useState } from 'react'
import { Card } from '../../../shared/components/Card'
import { Button } from '../../../shared/components/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Paso1SeleccionCliente } from './wizard/Paso1SeleccionCliente'
import { Paso2TipoServicio } from './wizard/Paso2TipoServicio'
import { Paso3Medidas } from './wizard/Paso3Medidas'
import { Paso3Compostura } from './wizard/Paso3Compostura'   // CAMBIO: importar nuevo componente
import { Paso3Renta } from './wizard/Paso3Renta'
import { Paso4Detalles } from './wizard/Paso4Detalles'
import { Paso5Pago } from './wizard/Paso5Pago'
import { TIPOS_SERVICIO, ETIQUETAS_TIPO_SERVICIO } from '../../../core/constants/estados'

/**
 * Wizard para crear pedidos paso a paso
 *
 * CAMBIOS:
 * 1. Paso3Remiendo → Paso3Compostura (múltiples prendas con instrucciones)
 * 2. Estado 'descripcion_remiendo' (string) → 'prendas_compostura' (array)
 * 3. Validación del paso 3 actualizada para compostura
 * 4. handleFinalizar genera detalles correctos para compostura
 */
export function WizardPedido({ onGuardar, onCancelar, loading = false }) {
  const [pasoActual, setPasoActual] = useState(1)

  const [datosPedido, setDatosPedido] = useState({
    // Paso 1
    cliente: null,
    // Paso 2
    tipo_servicio: null,
    // Paso 3 — Confección
    medidas_torso: null,
    medidas_pantalon: null,
    // Paso 3 — Compostura (CAMBIO: ahora es un array de { tipo, descripcion })
    prendas_compostura: [],
    // Paso 3 — Renta
    fecha_evento: '',
    fecha_devolucion: '',
    // Paso 4
    prendas: [],
    nombre_grupo: '',
    notas: '',
    fecha_promesa: '',
    // Paso 5
    costo_total: '',
    anticipo: '',
    metodo_pago: 'Efectivo'
  })

  const pasos = [
    { numero: 1, titulo: 'Cliente', descripcion: '¿Quién es?' },
    { numero: 2, titulo: 'Servicio', descripcion: '¿Qué haremos?' },
    { numero: 3, titulo: 'Especificaciones', descripcion: 'Detalles técnicos' },
    { numero: 4, titulo: 'Detalles', descripcion: 'Información del pedido' },
    { numero: 5, titulo: 'Pago', descripcion: 'Cotización y anticipo' }
  ]

  // ─── Actualizar estado global del wizard ─────────────────────────────
  const actualizarDatos = (nuevosDatos) => {
    setDatosPedido(prev => ({ ...prev, ...nuevosDatos }))
  }

  const siguientePaso = () => { if (pasoActual < 5) setPasoActual(p => p + 1) }
  const pasoAnterior = () => { if (pasoActual > 1) setPasoActual(p => p - 1) }

  // ─── Validaciones por paso ────────────────────────────────────────────
  const validarPasoActual = () => {
    switch (pasoActual) {
      case 1:
        return datosPedido.cliente !== null

      case 2:
        return datosPedido.tipo_servicio !== null

      case 3:
        if (datosPedido.tipo_servicio === TIPOS_SERVICIO.CONFECCION) {
          return datosPedido.medidas_torso || datosPedido.medidas_pantalon
        }
        // CAMBIO: Compostura requiere al menos 1 prenda con instrucciones
        if (datosPedido.tipo_servicio === TIPOS_SERVICIO.COMPOSTURA) {
          return datosPedido.prendas_compostura.length > 0
        }
        if (datosPedido.tipo_servicio === TIPOS_SERVICIO.RENTA) {
          return datosPedido.fecha_evento && datosPedido.fecha_devolucion
        }
        return true

      case 4:
        if (datosPedido.tipo_servicio === TIPOS_SERVICIO.CONFECCION) {
          return datosPedido.prendas.length > 0 && datosPedido.fecha_promesa
        }
        return !!datosPedido.fecha_promesa

      case 5:
        return (
          parseFloat(datosPedido.costo_total) > 0 &&
          parseFloat(datosPedido.anticipo) > 0
        )

      default:
        return true
    }
  }

  const handleSiguiente = () => {
    if (validarPasoActual()) {
      siguientePaso()
    } else {
      // Mensajes específicos según el paso y tipo de servicio
      const mensajes = {
        1: 'Selecciona un cliente para continuar.',
        2: 'Selecciona el tipo de servicio para continuar.',
        3: datosPedido.tipo_servicio === TIPOS_SERVICIO.COMPOSTURA
          ? 'Agrega al menos una prenda con sus instrucciones antes de continuar.'
          : datosPedido.tipo_servicio === TIPOS_SERVICIO.RENTA
            ? 'Selecciona la fecha del evento y la fecha de devolución.'
            : 'Selecciona al menos un tipo de medidas para continuar.',
        4: 'Completa todos los campos requeridos (prendas y fecha de entrega).',
        5: 'Ingresa el costo total y el anticipo para finalizar.'
      }
      alert(mensajes[pasoActual] || 'Por favor completa todos los campos requeridos.')
    }
  }

  // ─── Construir y enviar el pedido final ──────────────────────────────
  const handleFinalizar = () => {
    if (!validarPasoActual()) {
      alert('Ingresa el costo total y el anticipo para finalizar.')
      return
    }

    const pedidoFinal = {
      id_cliente: datosPedido.cliente.id_cliente,
      tipo_servicio: datosPedido.tipo_servicio,
      nombre_grupo: datosPedido.nombre_grupo || null,
      costo_total: parseFloat(datosPedido.costo_total),
      anticipo: parseFloat(datosPedido.anticipo),
      fecha_promesa: datosPedido.fecha_promesa,
      metodo_pago: datosPedido.metodo_pago,
      detalles: [],
      notas: datosPedido.notas || null
    }

    // ── Detalles según tipo de servicio ──────────────────────────────
    if (datosPedido.tipo_servicio === TIPOS_SERVICIO.CONFECCION) {
      pedidoFinal.detalles = datosPedido.prendas.map(prenda => ({
        tipo_prenda: prenda.tipo,
        id_medida: prenda.id_medida,
        descripcion: prenda.descripcion || null
      }))
    }

    /**
     * CAMBIO: Compostura ahora genera UN detalle por cada prenda,
     * igual que Confección, en lugar de un único detalle global.
     * Cada detalle tiene:
     *   - tipo_prenda: el tipo seleccionado (Saco, Pantalón, etc.)
     *   - descripcion: las instrucciones específicas de esa prenda
     *   - id_medida:   null (composturas no requieren medidas)
     */
    if (datosPedido.tipo_servicio === TIPOS_SERVICIO.COMPOSTURA) {
      pedidoFinal.detalles = datosPedido.prendas_compostura.map(prenda => ({
        tipo_prenda: prenda.tipo,
        id_medida: null,
        descripcion: prenda.descripcion
      }))
      // Descripcion global (para compatibilidad con validación del servicio)
      pedidoFinal.descripcion = datosPedido.prendas_compostura
        .map(p => `${p.tipo}: ${p.descripcion}`)
        .join('\n')
    }

    if (datosPedido.tipo_servicio === TIPOS_SERVICIO.RENTA) {
      pedidoFinal.fecha_evento = datosPedido.fecha_evento
      pedidoFinal.fecha_devolucion = datosPedido.fecha_devolucion
      pedidoFinal.detalles = datosPedido.prendas.length > 0
        ? datosPedido.prendas.map(prenda => ({
          tipo_prenda: prenda.tipo,
          descripcion: prenda.descripcion || null,
          fecha_evento: datosPedido.fecha_evento,
          fecha_devolucion: datosPedido.fecha_devolucion
        }))
        : [{
          tipo_prenda: 'Renta',
          descripcion: datosPedido.notas || null,
          fecha_evento: datosPedido.fecha_evento,
          fecha_devolucion: datosPedido.fecha_devolucion
        }]
    }

    onGuardar(pedidoFinal)
  }

  // ─── Renderizar paso actual ───────────────────────────────────────────
  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <Paso1SeleccionCliente
            clienteSeleccionado={datosPedido.cliente}
            onSeleccionar={(cliente) => actualizarDatos({ cliente })}
          />
        )

      case 2:
        return (
          <Paso2TipoServicio
            tipoSeleccionado={datosPedido.tipo_servicio}
            onSeleccionar={(tipo) => actualizarDatos({ tipo_servicio: tipo })}
          />
        )

      case 3:
        if (datosPedido.tipo_servicio === TIPOS_SERVICIO.CONFECCION) {
          return (
            <Paso3Medidas
              cliente={datosPedido.cliente}
              medidasTorso={datosPedido.medidas_torso}
              medidasPantalon={datosPedido.medidas_pantalon}
              onActualizar={actualizarDatos}
            />
          )
        }
        // CAMBIO: Compostura usa el nuevo componente con lista de prendas
        if (datosPedido.tipo_servicio === TIPOS_SERVICIO.COMPOSTURA) {
          return (
            <Paso3Compostura
              prendasCompostura={datosPedido.prendas_compostura}
              onActualizar={(prendas) => actualizarDatos({ prendas_compostura: prendas })}
            />
          )
        }
        if (datosPedido.tipo_servicio === TIPOS_SERVICIO.RENTA) {
          return (
            <Paso3Renta
              fechaEvento={datosPedido.fecha_evento}
              fechaDevolucion={datosPedido.fecha_devolucion}
              onActualizar={actualizarDatos}
            />
          )
        }
        return null

      case 4:
        return (
          <Paso4Detalles
            tipoServicio={datosPedido.tipo_servicio}
            prendas={datosPedido.prendas}
            nombreGrupo={datosPedido.nombre_grupo}
            notas={datosPedido.notas}
            fechaPromesa={datosPedido.fecha_promesa}
            medidasTorso={datosPedido.medidas_torso}
            medidasPantalon={datosPedido.medidas_pantalon}
            onActualizar={actualizarDatos}
          />
        )

      case 5:
        return (
          <Paso5Pago
            costoTotal={datosPedido.costo_total}
            anticipo={datosPedido.anticipo}
            metodoPago={datosPedido.metodo_pago}
            onActualizar={actualizarDatos}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Indicador de progreso ────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {pasos.map((paso, index) => (
            <div key={paso.numero} className="flex items-center flex-1">
              <div className="relative flex flex-col items-center">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    font-bold text-lg transition-colors
                    ${pasoActual === paso.numero
                      ? 'bg-primary-600 text-white'
                      : pasoActual > paso.numero
                        ? 'bg-success-500 text-white'
                        : 'bg-gray-200 text-gray-500'}
                  `}
                >
                  {pasoActual > paso.numero ? '✓' : paso.numero}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900">{paso.titulo}</p>
                  <p className="text-xs text-gray-500">{paso.descripcion}</p>
                </div>
              </div>

              {index < pasos.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-4 transition-colors
                    ${pasoActual > paso.numero ? 'bg-success-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Contenido del paso ───────────────────────────────────────── */}
      <Card className="mb-6">
        {renderPaso()}
      </Card>

      {/* ── Botones de navegación ────────────────────────────────────── */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={pasoActual === 1 ? onCancelar : pasoAnterior}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          {pasoActual === 1 ? 'Cancelar' : 'Anterior'}
        </Button>

        {pasoActual < 5 ? (
          <Button
            variant="primary"
            onClick={handleSiguiente}
            disabled={loading}
            className="flex items-center gap-2"
          >
            Siguiente
            <ChevronRight className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={handleFinalizar}
            disabled={loading}
            className="px-8"
          >
            {loading ? 'Guardando...' : '✓ Crear Pedido'}
          </Button>
        )}
      </div>
    </div>
  )
}
