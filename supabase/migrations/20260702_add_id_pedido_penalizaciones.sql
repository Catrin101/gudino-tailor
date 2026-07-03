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
