-- ============================================================
-- Migración: Crear tablas CITAS y PENALIZACIONES_CITA
-- Módulo: Agenda y Gestión de Citas
-- Fecha: 2026-06-30
-- ============================================================

-- ─── TABLA CITAS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citas (
  id_cita bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_cliente bigint NOT NULL REFERENCES clientes(id_cliente),
  id_pedido bigint REFERENCES pedidos(id_pedido),
  razon text NOT NULL,
  notas_adicionales text,
  fecha_hora_inicio timestamptz NOT NULL,
  fecha_hora_fin timestamptz NOT NULL,
  estado text NOT NULL DEFAULT 'Agendada',
  veces_movida int NOT NULL DEFAULT 0,
  cancelada_por text,
  creada_en_taller boolean DEFAULT false,
  fecha_creacion timestamptz DEFAULT now(),
  fecha_ultima_modificacion timestamptz DEFAULT now(),

  -- Razones válidas según catálogo 4.1
  CONSTRAINT chk_citas_razon CHECK (razon IN (
    'PRUEBA_PARCIAL',
    'ENTREGA_PEDIDO',
    'TOMA_MEDIDAS',
    'DEVOLUCION_RENTA',
    'REMIENDO_ENTREGA',
    'CONSULTA',
    'OTRO'
  )),

  -- Estados del ciclo de vida de la cita
  CONSTRAINT chk_citas_estado CHECK (estado IN (
    'Agendada',
    'Confirmada',
    'Completada',
    'Cancelada',
    'No Show'
  )),

  -- Quién canceló (solo aplica cuando estado = Cancelada)
  CONSTRAINT chk_citas_cancelada_por CHECK (
    cancelada_por IN ('Cliente', 'Sistema', 'Taller')
    OR cancelada_por IS NULL
  ),

  -- La fecha de fin debe ser posterior al inicio
  CONSTRAINT chk_citas_fecha_fin CHECK (fecha_hora_fin > fecha_hora_inicio)
);

-- ─── TABLA PENALIZACIONES_CITA ─────────────────────────────
CREATE TABLE IF NOT EXISTS penalizaciones_cita (
  id_penalizacion bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_cita bigint NOT NULL REFERENCES citas(id_cita),
  id_cliente bigint NOT NULL REFERENCES clientes(id_cliente),
  tipo text NOT NULL,
  monto decimal(10,2) NOT NULL,
  estado_cobro text NOT NULL DEFAULT 'Pendiente',
  fecha_aplicacion timestamptz DEFAULT now(),
  notas_cobro text,

  -- Tipos de penalización
  CONSTRAINT chk_penalizacion_tipo CHECK (tipo IN (
    'Cancelacion_Tardia',
    'No_Show',
    'Retraso_Excesivo'
  )),

  -- Estados de cobro
  CONSTRAINT chk_penalizacion_estado_cobro CHECK (estado_cobro IN (
    'Pendiente',
    'Cobrada',
    'Condonada'
  )),

  -- Monto no puede ser negativo
  CONSTRAINT chk_penalizacion_monto CHECK (monto >= 0)
);

-- ─── ÍNDICES ────────────────────────────────────────────────
-- Citas: búsquedas por cliente, estado, rango de fechas y pedido
CREATE INDEX idx_citas_cliente ON citas(id_cliente);
CREATE INDEX idx_citas_estado ON citas(estado);
CREATE INDEX idx_citas_fecha ON citas(fecha_hora_inicio);
CREATE INDEX idx_citas_pedido ON citas(id_pedido);

-- Penalizaciones: búsquedas por cita y cliente
CREATE INDEX idx_penalizaciones_cita ON penalizaciones_cita(id_cita);
CREATE INDEX idx_penalizaciones_cliente ON penalizaciones_cita(id_cliente);

-- ─── ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalizaciones_cita ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios autenticados pueden leer
CREATE POLICY "citas_select_auth" ON citas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "penalizaciones_select_auth" ON penalizaciones_cita
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas: usuarios autenticados pueden insertar
CREATE POLICY "citas_insert_auth" ON citas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "penalizaciones_insert_auth" ON penalizaciones_cita
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas: usuarios autenticados pueden actualizar
CREATE POLICY "citas_update_auth" ON citas
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "penalizaciones_update_auth" ON penalizaciones_cita
  FOR UPDATE USING (auth.role() = 'authenticated');
