import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createSupabaseClient, crearCita } from "../_shared/cita-service.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return errorResponse("Método no permitido", 405);
  }

  try {
    const supabase = createSupabaseClient(req);
    const body = await req.json();

    const cita = await crearCita(supabase, body);

    return jsonResponse({ data: cita }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return errorResponse(message, 400);
  }
});
