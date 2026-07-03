import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createSupabaseClient, obtenerHistorialPorCliente } from "../_shared/cita-service.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "GET") {
    return errorResponse("Método no permitido", 405);
  }

  try {
    const supabase = createSupabaseClient(req);
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const idCliente = pathParts[pathParts.length - 1];

    if (!idCliente || isNaN(Number(idCliente))) {
      return errorResponse("ID de cliente inválido");
    }

    const historial = await obtenerHistorialPorCliente(supabase, Number(idCliente));

    return jsonResponse({ data: historial, total: historial.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return errorResponse(message, 500);
  }
});
