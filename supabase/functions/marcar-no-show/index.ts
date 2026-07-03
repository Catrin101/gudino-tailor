import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createSupabaseClient, marcarNoShow } from "../_shared/cita-service.ts";

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
    const idCita = pathParts[pathParts.length - 1];

    if (!idCita || isNaN(Number(idCita))) {
      return errorResponse("ID de cita inválido");
    }

    const resultado = await marcarNoShow(supabase, Number(idCita));

    return jsonResponse({ data: resultado });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return errorResponse(message, 400);
  }
});
