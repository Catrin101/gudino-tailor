-- Migración: Crear tabla de configuración del taller
-- Almacena horario de atención, montos de penalización y duraciones por tipo de cita
-- Se usa un solo registro (id=1) porque es configuración global

CREATE TABLE IF NOT EXISTS configuracion_taller (
  id bigint PRIMARY KEY DEFAULT 1,

  -- Horario de atención
  hora_apertura time NOT NULL DEFAULT '09:00',
  hora_cierre time NOT NULL DEFAULT '19:00',
  dias_atencion int[] NOT NULL DEFAULT '{1,2,3,4,5,6}', -- 0=Dom,1=Lun,2=Mar,3=Mié,4=Jue,5=Vie,6=Sáb

  -- Montos de penalización (MXN)
  penalizacion_mover_24_48 decimal(10,2) NOT NULL DEFAULT 50,
  penalizacion_mover_menos_24 decimal(10,2) NOT NULL DEFAULT 100,
  penalizacion_cancelar_24_48 decimal(10,2) NOT NULL DEFAULT 75,
  penalizacion_cancelar_menos_24 decimal(10,2) NOT NULL DEFAULT 150,
  penalizacion_no_show decimal(10,2) NOT NULL DEFAULT 200,

  -- Duración default por tipo de cita (minutos)
  duracion_prueba_parcial int NOT NULL DEFAULT 30,
  duracion_entrega_pedido int NOT NULL DEFAULT 15,
  duracion_toma_medidas int NOT NULL DEFAULT 20,
  duracion_devolucion_renta int NOT NULL DEFAULT 10,
  duracion_remiendo_entrega int NOT NULL DEFAULT 10,
  duracion_consulta int NOT NULL DEFAULT 20,
  duracion_otro int NOT NULL DEFAULT 15,

  -- Metadata
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT chk_dias_atencion CHECK (dias_atencion <@ '{0,1,2,3,4,5,6}'),
  CONSTRAINT chk_horario_valido CHECK (hora_apertura < hora_cierre),
  CONSTRAINT chk_penalizaciones_positivas CHECK (
    penalizacion_mover_24_48 >= 0 AND
    penalizacion_mover_menos_24 >= 0 AND
    penalizacion_cancelar_24_48 >= 0 AND
    penalizacion_cancelar_menos_24 >= 0 AND
    penalizacion_no_show >= 0
  ),
  CONSTRAINT chk_duraciones_positivas CHECK (
    duracion_prueba_parcial > 0 AND
    duracion_entrega_pedido > 0 AND
    duracion_toma_medidas > 0 AND
    duracion_devolucion_renta > 0 AND
    duracion_remiendo_entrega > 0 AND
    duracion_consulta > 0 AND
    duracion_otro > 0
  )
);

-- Insertar registro default
INSERT INTO configuracion_taller (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_configuracion_taller_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_configuracion_updated_at ON configuracion_taller;
CREATE TRIGGER trg_configuracion_updated_at
  BEFORE UPDATE ON configuracion_taller
  FOR EACH ROW
  EXECUTE FUNCTION update_configuracion_taller_updated_at();

-- RLS
ALTER TABLE configuracion_taller ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_select_auth" ON configuracion_taller
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "config_update_auth" ON configuracion_taller
  FOR UPDATE USING (auth.role() = 'authenticated');
