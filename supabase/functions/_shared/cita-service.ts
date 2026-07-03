import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Constantes (replicadas de frontend/src/core/constants/citas.js) ────

export const RAZONES_CITA: Record<string, { label: string; duracion: number }> = {
  PRUEBA_PARCIAL: { label: "Prueba de prenda", duracion: 30 },
  ENTREGA_PEDIDO: { label: "Entrega y pago final", duracion: 15 },
  TOMA_MEDIDAS: { label: "Toma de medidas", duracion: 20 },
  DEVOLUCION_RENTA: { label: "Devolución de renta", duracion: 10 },
  REMIENDO_ENTREGA: { label: "Entrega de compostura", duracion: 10 },
  CONSULTA: { label: "Consulta / Presupuesto", duracion: 20 },
  OTRO: { label: "Otro", duracion: 15 },
};

export const ESTADOS_CITA = {
  AGENDADA: "Agendada",
  CONFIRMADA: "Confirmada",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  NO_SHOW: "No Show",
} as const;

export const CANCELADA_POR = {
  CLIENTE: "Cliente",
  SISTEMA: "Sistema",
  TALLER: "Taller",
} as const;

export const TIPOS_PENALIZACION = {
  CANCELACION_TARDIA: "Cancelacion_Tardia",
  NO_SHOW: "No_Show",
  RETRASO_EXCESIVO: "Retraso_Excesivo",
} as const;

export const PENALIZACIONES_DEFAULT = {
  MOVER_24_48: 50,
  MOVER_MENOS_24: 100,
  CANCELAR_24_48: 75,
  CANCELAR_MENOS_24: 150,
  NO_SHOW: 200,
};

const ESTADOS_PEDIDO_VALIDOS = ["En Espera", "En Proceso", "Prueba"];

// ─── Cliente Supabase para Edge Functions ──────────────────────────────

export function createSupabaseClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get("Authorization")!;

  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );
}

// ─── Validaciones ─────────────────────────────────────────────────────

export function validar(datos: Record<string, unknown>): { valido: boolean; errores: Record<string, string> } {
  const errores: Record<string, string> = {};

  if (!datos.id_cliente) {
    errores.cliente = "El cliente es obligatorio";
  }

  if (!datos.razon) {
    errores.razon = "La razón de la cita es obligatoria";
  } else if (!RAZONES_CITA[datos.razon as string]) {
    errores.razon = "Razón de cita inválida";
  }

  if (datos.razon === "OTRO" && (!datos.notas_adicionales || (datos.notas_adicionales as string).trim() === "")) {
    errores.notas_adicionales = 'Si la razón es "Otro", las notas son obligatorias';
  }

  if (!datos.fecha_hora_inicio) {
    errores.fecha_hora_inicio = "La fecha y hora de inicio es obligatoria";
  }

  if (!datos.fecha_hora_fin) {
    errores.fecha_hora_fin = "La fecha y hora de fin es obligatoria";
  }

  if (datos.fecha_hora_inicio && datos.fecha_hora_fin) {
    if (new Date(datos.fecha_hora_fin as string) <= new Date(datos.fecha_hora_inicio as string)) {
      errores.fecha_fin = "La fecha de fin debe ser posterior al inicio";
    }
  }

  return { valido: Object.keys(errores).length === 0, errores };
}

export function verificarAnticipacion(fechaHoraInicio: string, creadaEnTaller = false): { valido: boolean; mensaje: string | null } {
  if (creadaEnTaller) return { valido: true, mensaje: null };

  const ahora = new Date();
  const inicio = new Date(fechaHoraInicio);
  const dosHorasDespues = new Date(ahora.getTime() + 2 * 60 * 60 * 1000);

  if (inicio < dosHorasDespues) {
    return { valido: false, mensaje: "La cita debe ser al menos 2 horas en el futuro" };
  }

  return { valido: true, mensaje: null };
}

export function verificarHorarioTaller(fechaHoraInicio: string, fechaHoraFin: string): { valido: boolean; mensaje: string | null } {
  const inicio = new Date(fechaHoraInicio);
  const fin = new Date(fechaHoraFin);

  if (inicio.getDay() === 0) {
    return { valido: false, mensaje: "El taller no abre los domingos" };
  }

  const horaInicio = inicio.getHours() + inicio.getMinutes() / 60;
  const horaFin = fin.getHours() + fin.getMinutes() / 60;

  if (horaInicio < 9 || horaFin > 19) {
    return { valido: false, mensaje: "El horario de atención es de 9:00 a.m. a 7:00 p.m." };
  }

  return { valido: true, mensaje: null };
}

export async function verificarDisponibilidad(
  supabase: SupabaseClient,
  fechaHoraInicio: string,
  fechaHoraFin: string,
  excluirId: number | null = null
): Promise<{ valido: boolean; mensaje: string | null; citasConflicto: unknown[] }> {
  let query = supabase
    .from("citas")
    .select("id_cita, fecha_hora_inicio, fecha_hora_fin, razon, clientes(nombre)")
    .not("estado", "in", '("Cancelada","No Show")')
    .lt("fecha_hora_inicio", fechaHoraFin)
    .gt("fecha_hora_fin", fechaHoraInicio);

  if (excluirId) {
    query = query.neq("id_cita", excluirId);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Error al verificar traslape: ${error.message}`);

  if (data && data.length > 0) {
    return { valido: false, mensaje: "Hay otra cita en ese horario", citasConflicto: data };
  }

  return { valido: true, mensaje: null, citasConflicto: [] };
}

export async function verificarPedidoActivo(
  supabase: SupabaseClient,
  idPedido: number
): Promise<{ valido: boolean; mensaje: string; pedido: unknown | null }> {
  const { data: pedido, error } = await supabase
    .from("pedidos")
    .select("id_pedido, estado, tipo_servicio")
    .eq("id_pedido", idPedido)
    .single();

  if (error || !pedido) {
    return { valido: false, mensaje: "Pedido no encontrado", pedido: null };
  }

  if (!ESTADOS_PEDIDO_VALIDOS.includes(pedido.estado)) {
    return {
      valido: false,
      mensaje: `No se puede vincular cita a un pedido en estado "${pedido.estado}"`,
      pedido,
    };
  }

  return { valido: true, mensaje: "", pedido };
}

// ─── Penalizaciones ───────────────────────────────────────────────────

export function calcularPenalizacionMovimiento(fechaHoraOriginal: string) {
  const ahora = new Date();
  const original = new Date(fechaHoraOriginal);
  const horasAntes = (original.getTime() - ahora.getTime()) / (1000 * 60 * 60);

  if (horasAntes > 48) {
    return { tipoPenalizacion: null, monto: 0, mensaje: "Sin penalización" };
  }

  if (horasAntes >= 24) {
    return {
      tipoPenalizacion: TIPOS_PENALIZACION.RETRASO_EXCESIVO,
      monto: PENALIZACIONES_DEFAULT.MOVER_24_48,
      requiereVerificacion: true,
      mensaje: "Penalización de $50 MXN (verificar historial del mes)",
    };
  }

  return {
    tipoPenalizacion: TIPOS_PENALIZACION.RETRASO_EXCESIVO,
    monto: PENALIZACIONES_DEFAULT.MOVER_MENOS_24,
    requiereVerificacion: false,
    mensaje: "Penalización de $100 MXN",
  };
}

export function calcularPenalizacionCancelacion(fechaHoraCita: string) {
  const ahora = new Date();
  const cita = new Date(fechaHoraCita);
  const horasAntes = (cita.getTime() - ahora.getTime()) / (1000 * 60 * 60);

  if (horasAntes > 48) {
    return { tipoPenalizacion: null, monto: 0, mensaje: "Sin penalización" };
  }

  if (horasAntes >= 24) {
    return {
      tipoPenalizacion: TIPOS_PENALIZACION.CANCELACION_TARDIA,
      monto: PENALIZACIONES_DEFAULT.CANCELAR_24_48,
      mensaje: "Penalización de $75 MXN por cancelación tardía",
    };
  }

  return {
    tipoPenalizacion: TIPOS_PENALIZACION.CANCELACION_TARDIA,
    monto: PENALIZACIONES_DEFAULT.CANCELAR_MENOS_24,
    mensaje: "Penalización de $150 MXN por cancelación de último momento",
  };
}

// ─── Operaciones CRUD ─────────────────────────────────────────────────

export async function crearCita(supabase: SupabaseClient, datos: Record<string, unknown>) {
  const validacion = validar(datos);
  if (!validacion.valido) {
    throw new Error(JSON.stringify(validacion.errores));
  }

  const anticipacion = verificarAnticipacion(
    datos.fecha_hora_inicio as string,
    datos.creada_en_taller as boolean
  );
  if (!anticipacion.valido) throw new Error(anticipacion.mensaje!);

  const horario = verificarHorarioTaller(
    datos.fecha_hora_inicio as string,
    datos.fecha_hora_fin as string
  );
  if (!horario.valido) throw new Error(horario.mensaje!);

  const disponibilidad = await verificarDisponibilidad(
    supabase,
    datos.fecha_hora_inicio as string,
    datos.fecha_hora_fin as string
  );
  if (!disponibilidad.valido) throw new Error(disponibilidad.mensaje!);

  if (datos.id_pedido) {
    const pedidoVal = await verificarPedidoActivo(supabase, datos.id_pedido as number);
    if (!pedidoVal.valido) throw new Error(pedidoVal.mensaje);
  }

  const razonInfo = RAZONES_CITA[datos.razon as string];
  let fechaFin = datos.fecha_hora_fin as string;
  if (!datos.fecha_hora_fin && datos.fecha_hora_inicio && razonInfo) {
    const inicio = new Date(datos.fecha_hora_inicio as string);
    fechaFin = new Date(inicio.getTime() + razonInfo.duracion * 60 * 1000).toISOString();
  }

  const { data, error } = await supabase
    .from("citas")
    .insert([{
      id_cliente: datos.id_cliente,
      id_pedido: datos.id_pedido || null,
      razon: datos.razon,
      notas_adicionales: datos.notas_adicionales || null,
      fecha_hora_inicio: datos.fecha_hora_inicio,
      fecha_hora_fin: fechaFin,
      estado: ESTADOS_CITA.AGENDADA,
      veces_movida: 0,
      cancelada_por: null,
      creada_en_taller: datos.creada_en_taller || false,
    }])
    .select("*, clientes(id_cliente, nombre, telefono), pedidos(id_pedido, tipo_servicio, estado)")
    .single();

  if (error) throw new Error(`Error al crear cita: ${error.message}`);
  return data;
}

export async function moverCita(
  supabase: SupabaseClient,
  idCita: number,
  nuevaFechaInicio: string,
  nuevaFechaFin: string
) {
  const { data: cita, error: fetchError } = await supabase
    .from("citas")
    .select("*")
    .eq("id_cita", idCita)
    .single();

  if (fetchError || !cita) throw new Error("Cita no encontrada");

  if (cita.veces_movida >= 2) {
    throw new Error("Esta cita alcanzó el límite de 2 movimientos. Cancélala y crea una nueva.");
  }

  if (![ESTADOS_CITA.AGENDADA, ESTADOS_CITA.CONFIRMADA].includes(cita.estado)) {
    throw new Error("Solo se pueden mover citas en estado Agendada o Confirmada");
  }

  const horario = verificarHorarioTaller(nuevaFechaInicio, nuevaFechaFin);
  if (!horario.valido) throw new Error(horario.mensaje!);

  const disponibilidad = await verificarDisponibilidad(supabase, nuevaFechaInicio, nuevaFechaFin, idCita);
  if (!disponibilidad.valido) throw new Error(disponibilidad.mensaje!);

  const penalizacion = calcularPenalizacionMovimiento(cita.fecha_hora_inicio);

  const { data: citaActualizada, error: updateError } = await supabase
    .from("citas")
    .update({
      fecha_hora_inicio: nuevaFechaInicio,
      fecha_hora_fin: nuevaFechaFin,
      veces_movida: cita.veces_movida + 1,
    })
    .eq("id_cita", idCita)
    .select("*, clientes(id_cliente, nombre, telefono), pedidos(id_pedido, tipo_servicio, estado)")
    .single();

  if (updateError) throw new Error(`Error al mover cita: ${updateError.message}`);

  let penalizacionCreada = null;
  if (penalizacion.monto > 0) {
    const { data: pen, error: penError } = await supabase
      .from("penalizaciones_cita")
      .insert([{
        id_cita: idCita,
        id_cliente: cita.id_cliente,
        tipo: penalizacion.tipoPenalizacion,
        monto: penalizacion.monto,
        estado_cobro: "Pendiente",
      }])
      .select()
      .single();

    if (!penError) penalizacionCreada = pen;
  }

  return { cita: citaActualizada, penalizacion: penalizacionCreada };
}

export async function cancelarCita(
  supabase: SupabaseClient,
  idCita: number,
  canceladaPor: string = "Cliente",
  condonarPenalizacion = false,
  motivoCondonacion = ""
) {
  const { data: cita, error: fetchError } = await supabase
    .from("citas")
    .select("*")
    .eq("id_cita", idCita)
    .single();

  if (fetchError || !cita) throw new Error("Cita no encontrada");
  if (cita.estado === ESTADOS_CITA.COMPLETADA) throw new Error("No se puede cancelar una cita ya completada");
  if (cita.estado === ESTADOS_CITA.CANCELADA) throw new Error("La cita ya está cancelada");

  let penalizacionCreada = null;

  if (canceladaPor !== CANCELADA_POR.TALLER) {
    const calc = calcularPenalizacionCancelacion(cita.fecha_hora_inicio);

    if (calc.monto > 0) {
      const { data: pen, error: penError } = await supabase
        .from("penalizaciones_cita")
        .insert([{
          id_cita: idCita,
          id_cliente: cita.id_cliente,
          tipo: calc.tipoPenalizacion,
          monto: calc.monto,
          estado_cobro: condonarPenalizacion ? "Condonada" : "Pendiente",
          notas_cobro: condonarPenalizacion ? `Condonada: ${motivoCondonacion}` : null,
        }])
        .select()
        .single();

      if (!penError) penalizacionCreada = pen;
    }
  }

  const { data: citaActualizada, error: updateError } = await supabase
    .from("citas")
    .update({ estado: ESTADOS_CITA.CANCELADA, cancelada_por: canceladaPor })
    .eq("id_cita", idCita)
    .select("*, clientes(id_cliente, nombre, telefono), pedidos(id_pedido, tipo_servicio, estado)")
    .single();

  if (updateError) throw new Error(`Error al cancelar cita: ${updateError.message}`);

  return { cita: citaActualizada, penalizacion: penalizacionCreada };
}

export async function marcarNoShow(supabase: SupabaseClient, idCita: number) {
  const { data: cita, error: fetchError } = await supabase
    .from("citas")
    .select("*")
    .eq("id_cita", idCita)
    .single();

  if (fetchError || !cita) throw new Error("Cita no encontrada");

  if (![ESTADOS_CITA.AGENDADA, ESTADOS_CITA.CONFIRMADA].includes(cita.estado)) {
    throw new Error("Solo se puede marcar como No Show citas Agendadas o Confirmadas");
  }

  const { data: penalizacion, error: penError } = await supabase
    .from("penalizaciones_cita")
    .insert([{
      id_cita: idCita,
      id_cliente: cita.id_cliente,
      tipo: TIPOS_PENALIZACION.NO_SHOW,
      monto: PENALIZACIONES_DEFAULT.NO_SHOW,
      estado_cobro: "Pendiente",
    }])
    .select()
    .single();

  if (penError) throw new Error(`Error al crear penalización: ${penError.message}`);

  const { data: citaActualizada, error: updateError } = await supabase
    .from("citas")
    .update({ estado: ESTADOS_CITA.NO_SHOW })
    .eq("id_cita", idCita)
    .select("*, clientes(id_cliente, nombre, telefono), pedidos(id_pedido, tipo_servicio, estado)")
    .single();

  if (updateError) throw new Error(`Error al marcar No Show: ${updateError.message}`);

  return { cita: citaActualizada, penalizacion };
}

export async function condonarPenalizacion(supabase: SupabaseClient, idPenalizacion: number, motivo: string) {
  if (!motivo || motivo.trim() === "") {
    throw new Error("El motivo de condonación es obligatorio");
  }

  const { data: penalizacion, error: fetchError } = await supabase
    .from("penalizaciones_cita")
    .select("estado_cobro")
    .eq("id_penalizacion", idPenalizacion)
    .single();

  if (fetchError || !penalizacion) throw new Error("Penalización no encontrada");
  if (penalizacion.estado_cobro === "Cobrada") {
    throw new Error("No se puede condonar una penalización ya cobrada");
  }

  const { data, error } = await supabase
    .from("penalizaciones_cita")
    .update({ estado_cobro: "Condonada", notas_cobro: `Condonada: ${motivo}` })
    .eq("id_penalizacion", idPenalizacion)
    .select()
    .single();

  if (error) throw new Error(`Error al condonar penalización: ${error.message}`);
  return data;
}

export async function cobrarPenalizacion(supabase: SupabaseClient, idPenalizacion: number, notas = "") {
  const { data: penalizacion, error: fetchError } = await supabase
    .from("penalizaciones_cita")
    .select("estado_cobro")
    .eq("id_penalizacion", idPenalizacion)
    .single();

  if (fetchError || !penalizacion) throw new Error("Penalización no encontrada");
  if (penalizacion.estado_cobro === "Condonada") {
    throw new Error("No se puede cobrar una penalización condonada");
  }

  const { data, error } = await supabase
    .from("penalizaciones_cita")
    .update({
      estado_cobro: "Cobrada",
      notas_cobro: notas || `Cobrada el ${new Date().toISOString()}`,
    })
    .eq("id_penalizacion", idPenalizacion)
    .select()
    .single();

  if (error) throw new Error(`Error al cobrar penalización: ${error.message}`);
  return data;
}

export async function obtenerCitasPorFecha(supabase: SupabaseClient, fecha: string) {
  const inicio = `${fecha}T00:00:00`;
  const fin = `${fecha}T23:59:59`;

  const { data, error } = await supabase
    .from("citas")
    .select("*, clientes(id_cliente, nombre, telefono), pedidos(id_pedido, tipo_servicio, estado)")
    .gte("fecha_hora_inicio", inicio)
    .lte("fecha_hora_inicio", fin)
    .order("fecha_hora_inicio", { ascending: true });

  if (error) throw new Error(`Error al obtener citas: ${error.message}`);
  return data || [];
}

export async function obtenerHistorialPorCliente(supabase: SupabaseClient, idCliente: number) {
  const { data, error } = await supabase
    .from("citas")
    .select("*, pedidos(id_pedido, tipo_servicio, estado), penalizaciones_cita(*)")
    .eq("id_cliente", idCliente)
    .order("fecha_hora_inicio", { ascending: false });

  if (error) throw new Error(`Error al obtener historial: ${error.message}`);
  return data || [];
}
