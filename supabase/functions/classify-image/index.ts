import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://uuagrhbdgyvopezoakia.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1YWdyaGJkZ3l2b3Blem9ha2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTA1MjcsImV4cCI6MjA5MjQ2NjUyN30.JaoX421xZ-kIdz_Z6LwFHXxtwVSYa5ICdGvGRCR2Yt8";

// Google Gemini API Key
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const GEMINI_MODEL = "gemini-3-flash-preview";

function formatPoint(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    address: row.address ?? null,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    distance_km: row.distance_km ? Number(Number(row.distance_km).toFixed(2)) : null,
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método no permitido. Usa POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { image_base64, user_lat, user_lng, user_name } = body;

    if (!image_base64 || typeof image_base64 !== "string" || image_base64.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "El campo 'image_base64' es requerido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Coordenadas del usuario (default: Matorrales, Córdoba)
    const lat = Number(user_lat) || -31.7148;
    const lng = Number(user_lng) || -63.5110;
    const userName = user_name || "amigo/a";

    // Obtener puntos de reciclaje cercanos para sugerir el más adecuado
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let nearbyPoints: any[] = [];

    try {
      const { data: rpcPoints } = await supabase.rpc("get_nearby_points", {
        user_lat: lat,
        user_lng: lng,
        radius_km: 50.0,
      });
      if (rpcPoints && rpcPoints.length > 0) nearbyPoints = rpcPoints;
    } catch (_) {}

    if (nearbyPoints.length === 0) {
      const { data: fallbackPoints } = await supabase
        .from("recycling_points")
        .select("id, name, type, color, latitude, longitude, address, is_active, is_approved")
        .eq("is_active", true)
        .eq("is_approved", true)
        .limit(8);
      nearbyPoints = fallbackPoints || [];
    }

    // ─────────────────────────────────────────────
    // PROMPT para la IA con personalidad amigable
    // ─────────────────────────────────────────────
    const systemPrompt = `Sos EcoAsistente, el asistente amigable de EcoMapa. Estás hablando con ${userName}.
Tu misión es analizar la foto de un residuo u objeto y decidir de forma clara y con onda qué debe hacer el vecino.

═══ CRITERIOS DE CLASIFICACIÓN ═══

1. "SOLICITAR_RETIRO" → cuando el objeto es VOLUMINOSO o PESADO y el vecino NO lo puede llevar a pie:
   - Electrodomésticos grandes: heladeras, lavarropas, secarropas, lavavajillas, aires acondicionados, termotanques, TVs grandes
   - Muebles: sillones, sofás, colchones, camas, armarios, mesas, sillas rotas
   - Restos de obra: escombros embolsados, cerámicas, ladrillos
   - Chatarra y metales pesados: caños, rejas, portones, bicicletas viejas
   - Restos de poda GRANDES: ramas gruesas, troncos, árboles cortados
   - ¡IMPORTANTE!: Recordale que el municipio y las cuadrillas tienen VEHÍCULOS y camiones especiales preparados para pasar a buscarlo a su casa sin que el vecino tenga que hacer fuerza ni moverlo.

2. "PUNTO_RECICLAJE" → cuando el vecino PUEDE llevarlo caminando a un contenedor o punto verde:
   - Botellas y envases de plástico / PET, bidones
   - Latas de aluminio y conservas
   - Frascos y botellas de vidrio
   - Cajas, cartón, papeles, diarios (volumen normal)
   - Residuos electrónicos pequeños (RAEE): celulares, cargadores, cables, mouses, teclados, auriculares, tablets → buzón rojo / punto RAEE de electrónicos
   - Pilas y baterías pequeñas (al contenedor rojo / buzón de pilas)
   - Medicamentos vencidos (al buzón de farmacia)

Puntos de reciclaje disponibles cerca: ${JSON.stringify(nearbyPoints.slice(0, 6))}

═══ PERSONALIDAD Y TONO ═══
- Hablá con tono argentino/latinoamericano cercano, súper buena onda, amigable y motivador ("¡Qué hacés!", "¡Genial iniciativa!", etc.).
- Siempre felicitá al vecino por separar y cuidar el medio ambiente.
- Si es SOLICITAR_RETIRO: tranquilizalo de que no mueva nada pesado, que los vehículos pasan a buscarlo directo por su domicilio.
- Si es PUNTO_RECICLAJE: decile el color del contenedor y cómo prepararlo (limpio, seco, aplastado).

═══ FORMATO DE RESPUESTA ═══
Respondé OBLIGATORIAMENTE en JSON con esta estructura exacta:
{
  "action": "SOLICITAR_RETIRO" o "PUNTO_RECICLAJE",
  "item_detectado": "nombre claro del objeto",
  "categoria": "categoría (ej: Electrodoméstico / RAEE, Mueble / Madera, Plástico PET, Vidrio, etc.)",
  "es_voluminoso": true o false,
  "friendly_message": "mensaje con muchísima onda y emojis dirigiéndote a ${userName}",
  "instrucciones": "pasos simples de qué hacer ahora",
  "ecopoints_estimados": número entre 20 y 80 según el impacto,
  "suggested_point": null si es retiro, o el punto más acorde si es punto de reciclaje
}`;

    // Limpiar header base64 si viene con data:image/...;base64,
    let cleanBase64 = image_base64;
    let mimeType = "image/jpeg";
    if (image_base64.includes("base64,")) {
      const parts = image_base64.split("base64,");
      cleanBase64 = parts[1];
      const mimeMatch = parts[0].match(/data:(.*?);/);
      if (mimeMatch) mimeType = mimeMatch[1];
    }

    // ─────────────────────────────────────────────
    // Llamada a Google Gemini API (con fallback automático de modelos)
    // ─────────────────────────────────────────────
    const MODELS_TO_TRY = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3-flash-preview", "gemini-3.5-flash"];
    let rawText: string | null = null;
    let usedModel = MODELS_TO_TRY[0];

    for (const model of MODELS_TO_TRY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: cleanBase64,
                    },
                  },
                  {
                    text: "Analizá la foto de este objeto o residuo y clasificá si se debe solicitar retiro a domicilio o llevar a punto de reciclaje.",
                  },
                ],
              },
            ],
            generation_config: {
              response_mime_type: "application/json",
              temperature: 0.2,
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            rawText = candidateText;
            usedModel = model;
            break;
          }
        } else {
          console.warn(`Model ${model} falló con status: ${geminiRes.status}, intentando siguiente...`);
        }
      } catch (err) {
        console.warn(`Error llamando a ${model}:`, err);
      }
    }

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: "No se pudo procesar la imagen en este momento. Intentá nuevamente." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(rawText);

    // Normalizar punto sugerido
    if (result.suggested_point) {
      result.suggested_point = formatPoint(result.suggested_point);
    }

    // Asegurar valores por defecto
    result.action = result.action || "PUNTO_RECICLAJE";
    result.item_detectado = result.item_detectado || "Objeto detectado";
    result.categoria = result.categoria || "General";
    result.es_voluminoso = result.es_voluminoso ?? false;
    result.friendly_message = result.friendly_message || "¡Gracias por cuidar el medio ambiente! 🌿";
    result.instrucciones = result.instrucciones || "Llevalo a tu punto verde más cercano.";
    result.ecopoints_estimados = result.ecopoints_estimados || 25;

    // Log en Supabase (fire-and-forget)
    supabase.from("ai_queries_log").insert({
      query_type: "gemini_image_classify",
      model_used: usedModel,
      action_result: result.action,
      item_detected: result.item_detectado,
    }).then(() => {}).catch(() => {});

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    console.error("Error general en classify-image:", e);
    return new Response(
      JSON.stringify({ error: "Error interno: " + (e?.message || "desconocido") }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
