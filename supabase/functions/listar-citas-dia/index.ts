import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createSupabaseClient, obtenerCitasPorFecha } from "../_shared/cita-service.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "GET") {
    return errorResponse("Método no permitido", 405);
  }

  try {
    const supabase = createSupabaseClient(req);
    const url = new URL(req.url);
    const fecha = url.searchParams.get("fecha");

    if (!fecha) {
      return errorResponse("El parámetro 'fecha' es requerido (YYYY-MM-DD)");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return errorResponse("Formato de fecha inválido. Use YYYY-MM-DD");
    }

    const citas = await obtenerCitasPorFecha(supabase, fecha);

    return jsonResponse({ data: citas, total: citas.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return errorResponse(message, 500);
  }
});
