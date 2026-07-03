import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createSupabaseClient, cancelarCita } from "../_shared/cita-service.ts";

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

    const body = await req.json();

    const resultado = await cancelarCita(
      supabase,
      Number(idCita),
      body.cancelada_por || "Cliente",
      body.condonar_penalizacion || false,
      body.motivo_condonacion || ""
    );

    return jsonResponse({ data: resultado });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return errorResponse(message, 400);
  }
});
