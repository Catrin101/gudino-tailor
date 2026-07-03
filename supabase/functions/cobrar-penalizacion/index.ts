import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createSupabaseClient, cobrarPenalizacion } from "../_shared/cita-service.ts";

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
    const idPenalizacion = pathParts[pathParts.length - 1];

    if (!idPenalizacion || isNaN(Number(idPenalizacion))) {
      return errorResponse("ID de penalización inválido");
    }

    const body = await req.json().catch(() => ({}));

    const resultado = await cobrarPenalizacion(
      supabase,
      Number(idPenalizacion),
      body.notas || ""
    );

    return jsonResponse({ data: resultado });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return errorResponse(message, 400);
  }
});
