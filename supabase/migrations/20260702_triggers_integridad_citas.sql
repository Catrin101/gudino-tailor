-- ============================================================
-- Migración: Triggers de integridad para CITAS
-- Módulo: Agenda y Gestión de Citas
-- Fecha: 2026-07-02
-- ============================================================

-- ─── TRIGGER: Auto-actualizar fecha_ultima_modificacion ─────
CREATE OR REPLACE FUNCTION update_citas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_ultima_modificacion = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_citas_updated_at
  BEFORE UPDATE ON citas
  FOR EACH ROW
  EXECUTE FUNCTION update_citas_timestamp();

-- ─── TRIGGER: Validar que el pedido vinculado esté activo ───
-- R-CITA-04: Solo se pueden vincular citas a pedidos en
-- 'En Espera', 'En Proceso' o 'Prueba'
CREATE OR REPLACE FUNCTION validar_pedido_activo_cita()
RETURNS TRIGGER AS $$
DECLARE
  estado_pedido text;
BEGIN
  IF NEW.id_pedido IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT estado INTO estado_pedido
  FROM pedidos
  WHERE id_pedido = NEW.id_pedido;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido % no encontrado', NEW.id_pedido;
  END IF;

  IF estado_pedido NOT IN ('En Espera', 'En Proceso', 'Prueba') THEN
    RAISE EXCEPTION 'No se puede vincular cita a un pedido en estado "%"', estado_pedido;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_pedido_activo
  BEFORE INSERT OR UPDATE OF id_pedido ON citas
  FOR EACH ROW
  EXECUTE FUNCTION validar_pedido_activo_cita();

-- ─── TRIGGER: Limitar movimientos de cita (R-MOVER-04) ─────
-- Una cita solo puede moverse máximo 2 veces
CREATE OR REPLACE FUNCTION limitar_movimientos_cita()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.veces_movida > 2 THEN
    RAISE EXCEPTION 'Una cita solo puede moverse máximo 2 veces. Cancéela y cree una nueva.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_limitar_movimientos
  BEFORE UPDATE OF veces_movida ON citas
  FOR EACH ROW
  EXECUTE FUNCTION limitar_movimientos_cita();
