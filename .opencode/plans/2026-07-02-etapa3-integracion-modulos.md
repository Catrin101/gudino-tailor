# Etapa 3: Integración con Módulos Existente — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar las penalizaciones de citas con el sistema de pagos existente y agregar indicador de comportamiento del cliente.

**Architecture:** Se extiende la tabla `penalizaciones_cita` con `id_pedido` para vincular cobros de penalización al saldo pendiente del pedido. Se crea un servicio de penalizaciones en el frontend que consulta directamente Supabase, se agrega una pestaña de "Penalizaciones" en PagosPage, y se integra un badge de comportamiento en TarjetaCliente.

**Tech Stack:** React 18, Supabase (PostgreSQL + Edge Functions), Tailwind CSS, Vite

---

## Archivos a Modificar/Crear

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `supabase/migrations/20260702_add_id_pedido_penalizaciones.sql` | Crear | Agregar FK `id_pedido` a `penalizaciones_cita` |
| `supabase/functions/_shared/cita-service.ts` | Modificar | Aceptar `id_pedido` en `cobrarPenalizacion()` |
| `supabase/functions/cobrar-penalizacion/index.ts` | Modificar | Pasar `id_pedido` al servicio |
| `frontend/src/core/constants/citas.js` | Modificar | Agregar `ETIQUETAS_TIPO_PENALIZACION` |
| `frontend/src/features/citas/services/PenalizacionService.js` | Crear | Consultas de penalizaciones vía Supabase |
| `frontend/src/features/citas/hooks/usePenalizaciones.js` | Crear | Hook de estado para penalizaciones |
| `frontend/src/features/pagos/components/PanelPenalizaciones.jsx` | Crear | Tabla de penalizaciones pendientes |
| `frontend/src/features/pagos/pages/PagosPage.jsx` | Modificar | Agregar pestaña de penalizaciones |
| `frontend/src/features/clientes/components/TarjetaCliente.jsx` | Modificar | Agregar badge de comportamiento |

---

## Task 1: Migración — Agregar `id_pedido` a `penalizaciones_cita`

**Files:**
- Create: `supabase/migrations/20260702_add_id_pedido_penalizaciones.sql`

- [ ] **Step 1: Crear migración para agregar FK**

```sql
-- ============================================================
-- Migración: Agregar id_pedido a penalizaciones_cita
-- Vincula penalizaciones con pedidos para cobro integration
-- Fecha: 2026-07-02
-- ============================================================

-- Agregar columna id_pedido (nullable para penalizaciones históricas)
ALTER TABLE penalizaciones_cita
  ADD COLUMN IF NOT EXISTS id_pedido bigint REFERENCES pedidos(id_pedido);

-- Índice para búsquedas por pedido
CREATE INDEX IF NOT EXISTS idx_penalizaciones_pedido
  ON penalizaciones_cita(id_pedido);

-- Índice compuesto para búsquedas de penalizaciones pendientes por cliente
CREATE INDEX IF NOT EXISTS idx_penalizaciones_estado_cliente
  ON penalizaciones_cita(estado_cobro, id_cliente);
```

- [ ] **Step 2: Verificar que la migración es válida**

Run: Revisar que las referencias FK son correctas (`pedidos(id_pedido)` existe en el esquema).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260702_add_id_pedido_penalizaciones.sql
git commit -m "feat(db): add id_pedido FK to penalizaciones_cita for payment integration"
```

---

## Task 2: Backend — Modificar `cobrarPenalizacion()` para crear pago

**Files:**
- Modify: `supabase/functions/_shared/cita-service.ts:471-495`
- Modify: `supabase/functions/cobrar-penalizacion/index.ts:24-28`

- [ ] **Step 1: Actualizar `cobrarPenalizacion()` en cita-service.ts**

Reemplazar la función `cobrarPenalizacion` existente (líneas 471-495):

```typescript
export async function cobrarPenalizacion(
  supabase: SupabaseClient,
  idPenalizacion: number,
  notas = "",
  idPedido?: number
) {
  // 1. Obtener la penalización completa
  const { data: penalizacion, error: fetchError } = await supabase
    .from("penalizaciones_cita")
    .select("estado_cobro, monto, id_cliente")
    .eq("id_penalizacion", idPenalizacion)
    .single();

  if (fetchError || !penalizacion) throw new Error("Penalización no encontrada");
  if (penalizacion.estado_cobro === "Condonada") {
    throw new Error("No se puede cobrar una penalización condonada");
  }

  // 2. Actualizar estado de la penalización
  const { data, error } = await supabase
    .from("penalizaciones_cita")
    .update({
      estado_cobro: "Cobrada",
      id_pedido: idPedido || null,
      notas_cobro: notas || `Cobrada el ${new Date().toISOString()}`,
    })
    .eq("id_penalizacion", idPenalizacion)
    .select()
    .single();

  if (error) throw new Error(`Error al cobrar penalización: ${error.message}`);

  // 3. Si se proporcionó id_pedido, crear registro de pago
  if (idPedido) {
    const { error: pagoError } = await supabase
      .from("pagos")
      .insert([{
        id_pedido: idPedido,
        monto: penalizacion.monto,
        concepto: "Penalizacion",
        metodo: "Efectivo",
        notas: `Penalización cobrada: ${notas || "Cobro automático"}`,
      }]);

    if (pagoError) {
      console.error("Error al crear pago por penalización:", pagoError);
      // No lanzar error — la penalización ya se marcó como cobrada
    }
  }

  return data;
}
```

- [ ] **Step 2: Actualizar endpoint `cobrar-penalizacion/index.ts`**

Reemplazar el contenido completo:

```typescript
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createSupabaseClient, cobrarPenalizacion } from "../_shared/cita-service.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "PUT") {
    return errorResponse("Método no permitido", 405);
  }

  try {
    const supabase = createSupabaseClient(req);
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const idPenalizacion = pathParts[pathParts.length - 1];

    if (!idPenalizacion || isNaN(Number(idPenalizacion))) {
      return errorResponse("ID de penalización inválido");
    }

    const body = await req.json().catch(() => ({}));

    const resultado = await cobrarPenalizacion(
      supabase,
      Number(idPenalizacion),
      body.notas || "",
      body.id_pedido ? Number(body.id_pedido) : undefined
    );

    return jsonResponse({ data: resultado });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return errorResponse(message, 400);
  }
});
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/_shared/cita-service.ts supabase/functions/cobrar-penalizacion/index.ts
git commit -m "feat(backend): penalización cobrada crea registro de pago en pedido vinculado"
```

---

## Task 3: Frontend — Agregar constante de etiquetas de penalización

**Files:**
- Modify: `frontend/src/core/constants/citas.js:128-135`

- [ ] **Step 1: Agregar `ETIQUETAS_TIPO_PENALIZACION` al final del archivo**

Agregar después de `PENALIZACIONES_DEFAULT`:

```javascript
// ─── ETIQUETAS DE TIPO DE PENALIZACIÓN (para UI) ──────────
export const ETIQUETAS_TIPO_PENALIZACION = {
  [TIPOS_PENALIZACION.CANCELACION_TARDIA]: 'Cancelación tardía',
  [TIPOS_PENALIZACION.NO_SHOW]: 'No Show',
  [TIPOS_PENALIZACION.RETRASO_EXCESIVO]: 'Retraso excesivo'
}

// ─── COLORES POR ESTADO DE COBRO ──────────────────────────
export const COLORES_ESTADO_COBRO = {
  [ESTADOS_COBRO.PENDIENTE]: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  [ESTADOS_COBRO.COBRADA]: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  [ESTADOS_COBRO.CONDONADA]: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/core/constants/citas.js
git commit -m "feat(constants): add penalty type labels and status colors"
```

---

## Task 4: Frontend — Crear `PenalizacionService`

**Files:**
- Create: `frontend/src/features/citas/services/PenalizacionService.js`

- [ ] **Step 1: Crear el servicio**

```javascript
import { supabase } from '../../../core/config/supabase'

/**
 * Servicio para consultar y gestionar penalizaciones de citas
 * Consulta directamente Supabase (sin Edge Function para listados)
 */
export class PenalizacionService {
  /**
   * Obtener penalizaciones pendientes de un cliente
   * @param {number} idCliente
   * @returns {Promise<Array>}
   */
  async obtenerPendientesPorCliente(idCliente) {
    const { data, error } = await supabase
      .from('penalizaciones_cita')
      .select(`
        *,
        citas (
          id_cita,
          razon,
          fecha_hora_inicio
        ),
        pedidos (
          id_pedido,
          tipo_servicio,
          estado
        )
      `)
      .eq('id_cliente', idCliente)
      .eq('estado_cobro', 'Pendiente')
      .order('fecha_aplicacion', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener penalizaciones: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtener todas las penalizaciones pendientes (para vista de Pagos)
   * @returns {Promise<Array>}
   */
  async obtenerTodasPendientes() {
    const { data, error } = await supabase
      .from('penalizaciones_cita')
      .select(`
        *,
        clientes (
          id_cliente,
          nombre,
          telefono
        ),
        citas (
          id_cita,
          razon,
          fecha_hora_inicio
        ),
        pedidos (
          id_pedido,
          tipo_servicio,
          estado,
          costo_total,
          saldo_pendiente
        )
      `)
      .eq('estado_cobro', 'Pendiente')
      .order('fecha_aplicacion', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener penalizaciones pendientes: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtener historial de penalizaciones de un cliente (todos los estados)
   * @param {number} idCliente
   * @returns {Promise<Array>}
   */
  async obtenerHistorialPorCliente(idCliente) {
    const { data, error } = await supabase
      .from('penalizaciones_cita')
      .select(`
        *,
        citas (
          id_cita,
          razon,
          fecha_hora_inicio
        )
      `)
      .eq('id_cliente', idCliente)
      .order('fecha_aplicacion', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener historial de penalizaciones: ${error.message}`)
    }

    return data || []
  }

  /**
   * Cobrar penalización (llama a Edge Function)
   * @param {number} idPenalizacion
   * @param {number|null} idPedido - Pedido al que vincular el cobro
   * @param {string} notas
   * @returns {Promise<Object>}
   */
  async cobrar(idPenalizacion, idPedido = null, notas = '') {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    const response = await fetch(
      `${supabaseUrl}/functions/v1/cobrar-penalizacion/${idPenalizacion}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ id_pedido: idPedido, notas })
      }
    )

    const resultado = await response.json()

    if (!response.ok) {
      throw new Error(resultado.error || 'Error al cobrar penalización')
    }

    return resultado.data
  }

  /**
   * Condonar penalización (llama a Edge Function)
   * @param {number} idPenalizacion
   * @param {string} motivo
   * @returns {Promise<Object>}
   */
  async condonar(idPenalizacion, motivo) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    const response = await fetch(
      `${supabaseUrl}/functions/v1/condonar-penalizacion/${idPenalizacion}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ motivo })
      }
    )

    const resultado = await response.json()

    if (!response.ok) {
      throw new Error(resultado.error || 'Error al condonar penalización')
    }

    return resultado.data
  }

  /**
   * Calcular score de comportamiento del cliente
   * @param {Array} penalizaciones - Historial completo de penalizaciones
   * @returns {Object} { score, nivel, label, color }
   */
  calcularComportamiento(penalizaciones) {
    const pendientes = penalizaciones.filter(p => p.estado_cobro === 'Pendiente')
    const totalPendiente = pendientes.reduce((sum, p) => sum + parseFloat(p.monto), 0)
    const noShows = penalizaciones.filter(p => p.tipo === 'No_Show').length
    const cancelaciones = penalizaciones.filter(p => p.tipo === 'Cancelacion_Tardia').length
    const totalPenalizaciones = penalizaciones.length

    // Score: 0 = excelente, 100 = muy mal
    let score = 0
    score += totalPenalizaciones * 10
    score += noShows * 15  // No show pesa más
    score += totalPendiente > 0 ? 20 : 0

    // Limitar a 100
    score = Math.min(score, 100)

    let nivel, label, color
    if (score === 0) {
      nivel = 'excelente'
      label = 'Excelente'
      color = 'success'
    } else if (score <= 25) {
      nivel = 'bueno'
      label = 'Bueno'
      color = 'green'
    } else if (score <= 50) {
      nivel = 'regular'
      label = 'Regular'
      color = 'warning'
    } else {
      nivel = 'alerta'
      label = 'Alerta'
      color = 'danger'
    }

    return {
      score,
      nivel,
      label,
      color,
      detalles: {
        totalPenalizaciones,
        pendientes: pendientes.length,
        totalPendiente,
        noShows,
        cancelaciones
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/features/citas/services/PenalizacionService.js
git commit -m "feat(citas): add PenalizacionService for queries and behavior scoring"
```

---

## Task 5: Frontend — Crear `usePenalizaciones` hook

**Files:**
- Create: `frontend/src/features/citas/hooks/usePenalizaciones.js`

- [ ] **Step 1: Crear el hook**

```javascript
import { useState } from 'react'
import { PenalizacionService } from '../services/PenalizacionService'

/**
 * Hook para gestión de penalizaciones
 */
export function usePenalizaciones() {
  const [penalizaciones, setPenalizaciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [comportamiento, setComportamiento] = useState(null)

  const service = new PenalizacionService()

  /**
   * Cargar penalizaciones pendientes (vista de Pagos)
   */
  const cargarPendientes = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await service.obtenerTodasPendientes()
      setPenalizaciones(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cargar penalizaciones pendientes de un cliente
   */
  const cargarPendientesCliente = async (idCliente) => {
    setLoading(true)
    setError(null)
    try {
      const data = await service.obtenerPendientesPorCliente(idCliente)
      setPenalizaciones(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cargar historial de comportamiento de un cliente
   */
  const cargarComportamiento = async (idCliente) => {
    setLoading(true)
    setError(null)
    try {
      const historial = await service.obtenerHistorialPorCliente(idCliente)
      const calc = service.calcularComportamiento(historial)
      setComportamiento(calc)
      return calc
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cobrar una penalización
   */
  const cobrar = async (idPenalizacion, idPedido = null, notas = '') => {
    setLoading(true)
    setError(null)
    try {
      const resultado = await service.cobrar(idPenalizacion, idPedido, notas)
      await cargarPendientes()
      return resultado
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Condonar una penalización
   */
  const condonar = async (idPenalizacion, motivo) => {
    setLoading(true)
    setError(null)
    try {
      const resultado = await service.condonar(idPenalizacion, motivo)
      await cargarPendientes()
      return resultado
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    penalizaciones,
    loading,
    error,
    comportamiento,
    cargarPendientes,
    cargarPendientesCliente,
    cargarComportamiento,
    cobrar,
    condonar
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/features/citas/hooks/usePenalizaciones.js
git commit -m "feat(citas): add usePenalizaciones hook"
```

---

## Task 6: Frontend — Crear `PanelPenalizaciones` componente

**Files:**
- Create: `frontend/src/features/pagos/components/PanelPenalizaciones.jsx`

- [ ] **Step 1: Crear el componente**

```jsx
import { useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { useNotification } from '../../../shared/context/NotificationContext'
import { ModalCondonarPenalizacion } from '../../citas/components/modales/ModalCondonarPenalizacion'
import {
  ETIQUETAS_TIPO_PENALIZACION,
  COLORES_ESTADO_COBRO
} from '../../../core/constants/citas'

/**
 * Panel de penalizaciones pendientes en la sección de Pagos
 */
export function PanelPenalizaciones({ penalizaciones, loading, onCobrar, onCondonar }) {
  const [penalizacionSeleccionada, setPenalizacionSeleccionada] = useState(null)
  const [mostrarModalCondonar, setMostrarModalCondonar] = useState(false)
  const [filtroCliente, setFiltroCliente] = useState('')
  const notification = useNotification()

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleCobrar = async (penalizacion) => {
    try {
      await onCobrar(penalizacion.id_penalizacion, penalizacion.id_pedido, 'Cobro desde Panel de Pagos')
      notification.success(`Penalización de $${penalizacion.monto.toFixed(2)} cobrada correctamente`)
    } catch (err) {
      notification.error(err.message)
    }
  }

  const handleCondonar = async (motivo) => {
    try {
      await onCondonar(penalizacionSeleccionada.id_penalizacion, motivo)
      notification.success('Penalización condonada')
      setMostrarModalCondonar(false)
      setPenalizacionSeleccionada(null)
    } catch (err) {
      notification.error(err.message)
    }
  }

  const penalizacionesFiltradas = penalizaciones.filter(p => {
    if (!filtroCliente.trim()) return true
    const nombre = p.clientes?.nombre?.toLowerCase() || ''
    return nombre.includes(filtroCliente.toLowerCase())
  })

  const totalPendiente = penalizacionesFiltradas.reduce(
    (sum, p) => sum + parseFloat(p.monto), 0
  )

  return (
    <div>
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-danger-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-danger-600" />
            <div>
              <p className="text-sm text-danger-600 font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-danger-900">
                {penalizacionesFiltradas.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-warning-50">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-warning-600" />
            <div>
              <p className="text-sm text-warning-600 font-medium">Total por Cobrar</p>
              <p className="text-2xl font-bold text-warning-900">
                ${totalPendiente.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-sm text-gray-600 font-medium mb-2">Filtrar por cliente</p>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </Card>
      </div>

      {/* Tabla de penalizaciones */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Penalizaciones Pendientes</h2>
          <span className="text-sm text-gray-500">
            {penalizacionesFiltradas.length} registro{penalizacionesFiltradas.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Cargando penalizaciones...</p>
          </div>
        ) : penalizacionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-success-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              {filtroCliente
                ? 'No hay penalizaciones pendientes para este cliente'
                : 'No hay penalizaciones pendientes'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Pedido
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {penalizacionesFiltradas.map(penalizacion => (
                  <tr key={penalizacion.id_penalizacion} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {penalizacion.clientes?.nombre || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {penalizacion.clientes?.telefono || ''}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {ETIQUETAS_TIPO_PENALIZACION[penalizacion.tipo] || penalizacion.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-lg font-bold text-danger-700">
                        ${parseFloat(penalizacion.monto).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatearFecha(penalizacion.fecha_aplicacion)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {penalizacion.pedidos ? (
                        <span className="text-gray-900">
                          #{penalizacion.pedidos.id_pedido}
                        </span>
                      ) : (
                        <span className="text-gray-400">Sin vincular</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleCobrar(penalizacion)}
                          className="flex items-center gap-1"
                        >
                          <DollarSign className="w-3 h-3" />
                          Cobrar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPenalizacionSeleccionada(penalizacion)
                            setMostrarModalCondonar(true)
                          }}
                          className="flex items-center gap-1 text-gray-600"
                        >
                          <XCircle className="w-3 h-3" />
                          Condonar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de condonación */}
      {mostrarModalCondonar && penalizacionSeleccionada && (
        <ModalCondonarPenalizacion
          penalizacion={penalizacionSeleccionada}
          onConfirmar={handleCondonar}
          onCerrar={() => {
            setMostrarModalCondonar(false)
            setPenalizacionSeleccionada(null)
          }}
          loading={loading}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/features/pagos/components/PanelPenalizaciones.jsx
git commit -m "feat(pagos): add PanelPenalizaciones component for pending penalties"
```

---

## Task 7: Frontend — Integrar pestaña de Penalizaciones en PagosPage

**Files:**
- Modify: `frontend/src/pages/PagosPage.jsx`

- [ ] **Step 1: Agregar imports y hook**

Al inicio del archivo, agregar imports (después de las importaciones existentes):

```javascript
import { usePenalizaciones } from '../features/citas/hooks/usePenalizaciones'
import { PanelPenalizaciones } from '../features/pagos/components/PanelPenalizaciones'
```

Dentro del componente `PagosPage`, agregar el hook después de los hooks existentes:

```javascript
const {
  penalizaciones,
  loading: loadingPenalizaciones,
  cargarPendientes,
  cobrar: cobrarPenalizacion,
  condonar: condonarPenalizacion
} = usePenalizaciones()
```

- [ ] **Step 2: Cargar penalizaciones al montar**

En el `useEffect` existente, agregar la carga:

```javascript
useEffect(() => {
  cargarResumenDia()
  cargarPagosPorFechas(filtros.fechaInicio, filtros.fechaFin)
  cargarPedidosCompletos()
  cargarPendientes() // <-- Agregar esta línea
}, [])
```

- [ ] **Step 3: Agregar pestaña de penalizaciones**

Reemplazar el bloque de pestañas existente con:

```jsx
{/* Pestañas */}
{vistaActual !== 'registrar' && (
  <div className="mt-6 flex gap-2 border-b border-gray-200">
    <button
      onClick={() => setVistaActual('resumen')}
      className={`px-4 py-2 font-medium transition-colors ${vistaActual === 'resumen'
        ? 'text-primary-700 border-b-2 border-primary-700'
        : 'text-gray-600 hover:text-gray-900'
        }`}
    >
      Resumen del Día
    </button>
    <button
      onClick={() => setVistaActual('historial')}
      className={`px-4 py-2 font-medium transition-colors ${vistaActual === 'historial'
        ? 'text-primary-700 border-b-2 border-primary-700'
        : 'text-gray-600 hover:text-gray-900'
        }`}
    >
      Historial de Pagos
    </button>
    <button
      onClick={() => setVistaActual('penalizaciones')}
      className={`px-4 py-2 font-medium transition-colors relative ${vistaActual === 'penalizaciones'
        ? 'text-primary-700 border-b-2 border-primary-700'
        : 'text-gray-600 hover:text-gray-900'
        }`}
    >
      Penalizaciones
      {penalizaciones.length > 0 && (
        <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-danger-100 text-danger-700 rounded-full">
          {penalizaciones.length}
        </span>
      )}
    </button>
  </div>
)}
```

- [ ] **Step 4: Agregar vista de penalizaciones**

Agregar antes del cierre del return del componente:

```jsx
{/* VISTA: Penalizaciones */}
{vistaActual === 'penalizaciones' && (
  <PanelPenalizaciones
    penalizaciones={penalizaciones}
    loading={loadingPenalizaciones}
    onCobrar={cobrarPenalizacion}
    onCondonar={condonarPenalizacion}
  />
)}
```

- [ ] **Step 5: Verificar que el componente compile**

Run: `cd frontend && npm run build`
Expected: Build exitoso sin errores

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/PagosPage.jsx
git commit -m "feat(pagos): integrate penalties tab in PagosPage"
```

---

## Task 8: Frontend — Integrar badge de comportamiento en TarjetaCliente

**Files:**
- Modify: `frontend/src/features/clientes/components/TarjetaCliente.jsx`

- [ ] **Step 1: Agregar imports**

Al inicio del archivo, agregar `useEffect` a los imports de react:

```javascript
import { useEffect } from 'react'
```

Y agregar import del hook:

```javascript
import { usePenalizaciones } from '../../citas/hooks/usePenalizaciones'
```

- [ ] **Step 2: Agregar hook y lógica de comportamiento**

Dentro del componente `TarjetaCliente`, agregar después de las funciones de formato:

```javascript
const { comportamiento, cargarComportamiento } = usePenalizaciones()

useEffect(() => {
  if (cliente?.id_cliente) {
    cargarComportamiento(cliente.id_cliente)
  }
}, [cliente?.id_cliente])
```

- [ ] **Step 3: Agregar badge de comportamiento**

Reemplazar el bloque de indicador de deuda histórica existente (líneas 59-66) con:

```jsx
{/* Indicador de comportamiento */}
{comportamiento && comportamiento.detalles.totalPenalizaciones > 0 && (
  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
    comportamiento.color === 'success' ? 'bg-success-50 text-success-700' :
    comportamiento.color === 'green' ? 'bg-green-50 text-green-700' :
    comportamiento.color === 'warning' ? 'bg-warning-50 text-warning-700' :
    'bg-danger-50 text-danger-700'
  }`}>
    <AlertCircle className="w-4 h-4" />
    <span>{comportamiento.label}</span>
    {comportamiento.detalles.pendientes > 0 && (
      <span className="ml-1 px-1.5 py-0.5 text-xs bg-white rounded-full">
        ${comportamiento.detalles.totalPendiente.toFixed(0)}
      </span>
    )}
  </div>
)}

{/* Indicador de deuda histórica (existente, solo si no hay comportamiento) */}
{cliente.deuda_historica > 0 && !comportamiento?.detalles?.totalPenalizaciones && (
  <div className="flex items-center gap-1 px-3 py-1 bg-warning-50 text-warning-700 rounded-full text-sm">
    <AlertCircle className="w-4 h-4" />
    <span className="font-medium">
      ${cliente.deuda_historica.toFixed(2)}
    </span>
  </div>
)}
```

- [ ] **Step 4: Verificar que el componente compile**

Run: `cd frontend && npm run build`
Expected: Build exitoso sin errores

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/clientes/components/TarjetaCliente.jsx
git commit -m "feat(clientes): add behavior badge to TarjetaCliente"
```

---

## Task 9: Verificación final

- [ ] **Step 1: Build completo del frontend**

Run: `cd frontend && npm run build`
Expected: Build exitoso, sin errores de compilación

- [ ] **Step 2: Verificar que las migraciones son válidas**

Revisar que la migración SQL es sintácticamente correcta y las FK apuntan a tablas existentes.

- [ ] **Step 3: Actualizar tareas_modulo_citas.md**

Marcar las tareas de Etapa 3 como completadas en `tareas_modulo_citas.md`:

```markdown
## Etapa 3: Integración con módulos existentes

- [x] Conectar penalizaciones al `saldo_pendiente` del pedido vinculado
- [x] Mostrar penalizaciones pendientes en la sección de Pagos/Cuentas
- [x] Integrar indicador de comportamiento del cliente (badge de alertas)
```

- [ ] **Step 4: Commit final**

```bash
git add tareas_modulo_citas.md
git commit -m "docs: mark Etapa 3 tasks as completed"
```
