# Fases y Tareas — Módulo de Citas

## Etapa 1: Base de datos y lógica de negocio (Backend)

- [x] Crear tabla `CITAS` con todos sus campos
- [x] Crear tabla `PENALIZACIONES_CITA`
- [x] Implementar restricciones de integridad (FK, estados válidos, triggers)
  - CHECK constraints en migración original (razón, estado, cancelada_por, fecha_fin)
  - Trigger `trg_citas_updated_at` — auto-actualiza `fecha_ultima_modificacion`
  - Trigger `trg_validar_pedido_activo` — valida estado del pedido vinculado (R-CITA-04)
  - Trigger `trg_limitar_movimientos` — bloquea más de 2 movimientos (R-MOVER-04)
- [x] Implementar servicio `GestorCitas` (CitaService) con:
  - Verificación de disponibilidad (R-CITA-02)
  - Verificación de anticipación y cálculo de penalización (R-CITA-01, R-MOVER, R-CANCEL)
  - Validación de horarios de taller (R-CITA-03)
- [x] Endpoints REST (Supabase Edge Functions):
  - `POST /citas` — crear-cita → `supabase/functions/crear-cita/index.ts`
  - `GET /citas?fecha=YYYY-MM-DD` — listar-citas-dia → `supabase/functions/listar-citas-dia/index.ts`
  - `GET /citas/cliente/:id` — historial-citas-cliente → `supabase/functions/historial-citas-cliente/index.ts`
  - `PUT /citas/:id/mover` — mover-cita → `supabase/functions/mover-cita/index.ts`
  - `PUT /citas/:id/cancelar` — cancelar-cita → `supabase/functions/cancelar-cita/index.ts`
  - `PUT /citas/:id/no-show` — marcar-no-show → `supabase/functions/marcar-no-show/index.ts`
  - `PUT /penalizaciones/:id/condonar` — condonar-penalizacion → `supabase/functions/condonar-penalizacion/index.ts`
  - `PUT /penalizaciones/:id/cobrar` — cobrar-penalizacion → `supabase/functions/cobrar-penalizacion/index.ts`

---

## Etapa 2: Interfaz de usuario (Frontend)

- [x] Vista de Calendario (semanal y diario)
- [x] Panel lateral "Agenda de Hoy" en el Tablero
- [x] Wizard de Nueva Cita (4 pasos)
- [x] Tarjeta de detalle de cita con botones de acción
- [x] Sección de Historial de Citas en el perfil del cliente
- [x] Modal de confirmación con monto de penalización
- [x] Modal de condonación con campo de motivo obligatorio

---

## Etapa 3: Integración con módulos existentes

- [x] Conectar penalizaciones al `saldo_pendiente` del pedido vinculado
- [x] Mostrar penalizaciones pendientes en la sección de Pagos/Cuentas
- [x] Integrar indicador de comportamiento del cliente (badge de alertas)

---

## Etapa 4: Configuración y ajustes

- [ ] Pantalla de Ajustes: Horario de atención del taller
- [ ] Pantalla de Ajustes: Montos de penalización (editables)
- [ ] Pantalla de Ajustes: Duración default por tipo de cita
