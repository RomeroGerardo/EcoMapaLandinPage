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
const MODELS_TO_TRY = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3-flash-preview", "gemini-3.5-flash"];

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

// Clasificador local de respaldo si la API externa no respondiera
function classifyLocally(text: string, nearbyPoints: any[], userName: string) {
  const lower = text.toLowerCase().trim();

  // Detección de saludos o mensajes iniciales sin residuo
  const saludos = ["hola", "buenas", "buen dia", "buenos dias", "buenas tardes", "buenas noches", "que onda", "que tal", "como andas", "como estas", "hola!", "holaa", "holi"];
  const isSaludo = saludos.some(s => lower === s || lower.startsWith(s + " ") || lower.endsWith(" " + s));

  if (isSaludo || lower.length < 4) {
    return {
      waste_type: null,
      container_type: null,
      container_color: null,
      suggested_point: null,
      environmental_impact: null,
      ecopoints_earned: 0,
      friendly_message: `¡Qué hacés, ${userName}! 🌿 Todo bien por acá. Contame qué residuo u objeto tenés para reciclar o descartar hoy y te digo a dónde llevarlo o si coordinamos un retiro.`
    };
  }

  if (lower.includes("pila") || lower.includes("bateria") || lower.includes("batería") || lower.includes("celular") || lower.includes("cable") || lower.includes("electronico")) {
    const point = nearbyPoints.find((p) => p.type === "electronico" || p.type === "peligroso" || p.color === "rojo") || nearbyPoints[0];
    return {
      waste_type: "Pilas & Residuos Electrónicos (RAEE)",
      container_type: "electronico",
      container_color: "rojo",
      suggested_point: formatPoint(point),
      environmental_impact: "Evitás que metales pesados como litio y mercurio contaminen hasta 167.000 litros de agua por unidad.",
      ecopoints_earned: 40,
      friendly_message: `¡Excelente iniciativa, ${userName}! Los componentes electrónicos y pilas no van a la basura común. Llévalos al contenedor rojo o buzón RAEE más cercano. ¡Seguí así!`
    };
  }

  if (lower.includes("vidrio") || lower.includes("frasco") || lower.includes("copa")) {
    const point = nearbyPoints.find((p) => p.type === "vidrio" || p.color === "verde") || nearbyPoints[0];
    return {
      waste_type: "Vidrio",
      container_type: "vidrio",
      container_color: "verde",
      suggested_point: formatPoint(point),
      environmental_impact: "El vidrio es 100% reciclable infinitas veces. Ahorrás un 30% de energía en su fundición.",
      ecopoints_earned: 30,
      friendly_message: `¡Genial, ${userName}! El vidrio va en el contenedor verde. Enjuagalo bien antes de tirarlo para no ensuciar el resto de los materiales.`
    };
  }

  if (lower.includes("plastico") || lower.includes("plástico") || lower.includes("pet") || lower.includes("botella") || lower.includes("bolsa") || lower.includes("sachet")) {
    const point = nearbyPoints.find((p) => p.type === "plastico" || p.color === "amarillo") || nearbyPoints[0];
    return {
      waste_type: "Plásticos & Envases",
      container_type: "plastico",
      container_color: "amarillo",
      suggested_point: formatPoint(point),
      environmental_impact: "Evitás que el plástico tarde hasta 500 años en descomponerse en el ecosistema.",
      ecopoints_earned: 25,
      friendly_message: `¡De diez, ${userName}! Los plásticos van en la campana amarilla. Aplastá bien las botellas para ahorrar espacio en el contenedor.`
    };
  }

  if (lower.includes("carton") || lower.includes("cartón") || lower.includes("papel") || lower.includes("caja")) {
    const point = nearbyPoints.find((p) => p.type === "papel_carton" || p.color === "azul") || nearbyPoints[0];
    return {
      waste_type: "Papel & Cartón",
      container_type: "papel_carton",
      container_color: "azul",
      suggested_point: formatPoint(point),
      environmental_impact: "Por cada tonelada de cartón reciclado se salvan 17 árboles y miles de litros de agua.",
      ecopoints_earned: 25,
      friendly_message: `¡Bárbaro, ${userName}! El cartón y papel van en el contenedor azul. Asegurate de que esté limpio y seco, y desarmá las cajas para que no ocupen tanto lugar.`
    };
  }

  if (lower.includes("mueble") || lower.includes("sillon") || lower.includes("sillón") || lower.includes("colchon") || lower.includes("heladera") || lower.includes("lavarropas")) {
    return {
      waste_type: "Residuo Voluminoso",
      container_type: "especial",
      container_color: "naranja",
      suggested_point: null,
      environmental_impact: "Permite la recuperación formal y segura de materiales pesados por las cuadrillas de la municipalidad.",
      ecopoints_earned: 30,
      friendly_message: `¡Ojo, ${userName}! Al ser un objeto pesado/voluminoso, no hace falta que hagas fuerza. Podés solicitar el Retiro a Domicilio 🚛 desde la app y un vehículo municipal pasa a buscarlo por tu puerta.`
    };
  }

  return {
    waste_type: null,
    container_type: null,
    container_color: null,
    suggested_point: null,
    environmental_impact: null,
    ecopoints_earned: 0,
    friendly_message: `¡Hola, ${userName}! Para ayudarte mejor, contame exactamente qué material querés reciclar (por ejemplo botellas de plástico, cartón, vidrio, pilas o muebles) y te indico el punto más cercano.`
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

  const startTime = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const { message, user_lat, user_lng, user_name } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "El campo 'message' es requerido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Coordenadas con fallback a Matorrales, Córdoba
    const lat = Number(user_lat) || -31.7148;
    const lng = Number(user_lng) || -63.5110;
    const userName = (user_name && user_name.trim().length > 0) ? user_name.trim() : "Gerardo";

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Obtener puntos cercanos al usuario
    let nearbyPoints: any[] = [];
    try {
      const { data: rpcPoints } = await supabase.rpc("get_nearby_points", {
        user_lat: lat,
        user_lng: lng,
        radius_km: 50.0,
      });
      if (rpcPoints && rpcPoints.length > 0) {
        nearbyPoints = rpcPoints;
      }
    } catch (_) {}

    if (nearbyPoints.length === 0) {
      const { data: fallbackPoints } = await supabase
        .from("recycling_points")
        .select("id, name, type, color, latitude, longitude, address, is_active, is_approved")
        .eq("is_active", true)
        .eq("is_approved", true)
        .limit(10);
      nearbyPoints = fallbackPoints || [];
    }

    // ─────────────────────────────────────────────
    // System Prompt para Google Gemini
    // ─────────────────────────────────────────────
    const systemPrompt = `Sos EcoAsistente, el consultor ambiental municipal inteligente de EcoMapa.
Estás conversando con ${userName}. Hablale de forma súper cercana, cálida y con mucha onda argentina/cordobesa ("¡Qué hacés!", "¡Genial!", "Che", etc.).

UBICACIÓN ACTUAL DEL USUARIO: latitud ${lat}, longitud ${lng}
PUNTOS DE RECICLAJE DISPONIBLES EN LA ZONA:
${JSON.stringify(nearbyPoints.slice(0, 8))}

REGLAS FUNDAMENTALES DE COMPORTAMIENTO:
1. SI EL MENSAJE ES UN SALUDO, AGRADECIMIENTO O CONSULTA GENERAL (ej: "hola", "buenas", "cómo andás", "qué hacés", "gracias", "¿cómo funciona EcoMapa?"):
   - Respondé de forma amigable, cálida y natural saludando a ${userName}.
   - Invitalo a contarte qué residuo u objeto tiene para reciclar o descartar hoy.
   - waste_type: null
   - container_type: null
   - container_color: null
   - suggested_point: null
   - environmental_impact: null
   - ecopoints_earned: 0
   - ¡NO inventes ningún contenedor ni punto si el usuario no especificó un residuo!

2. SI EL USUARIO MENCIONA UN RESIDUO O MATERIAL:
   - Identificá con precisión qué tipo de residuo es y en qué contenedor va (Amarillo: plásticos/latas; Azul: papel/cartón; Verde: vidrio; Rojo: pilas/baterías/electrónicos pequeños RAEE/medicamentos).
   - Si es un OBJETO PESADO O VOLUMINOSO (muebles, sillones, heladeras, lavarropas, colchones, escombros, poda grande):
     * Explicá que la municipalidad cuenta con el servicio de Retiro a Domicilio 🚛 con cuadrillas y camiones, para que no tenga que cargarlo.
     * container_type: "especial", container_color: "naranja", suggested_point: null.
   - Si es RECICLABLE COMÚN:
     * Elegí de la lista el suggested_point MÁS CERCANO y adecuado para ese residuo.
     * Explicá brevemente cómo llevarlo (limpio, seco, aplastado).
     * Proporcioná un dato de impacto ambiental real y motivador.
     * ecopoints_earned: número entre 20 y 50 según el residuo.

FORMATO DE RESPUESTA: Respondé OBLIGATORIAMENTE en JSON válido con este esquema:
{
  "waste_type": "string o null",
  "container_type": "string o null",
  "container_color": "string o null",
  "suggested_point": {
    "id": "uuid o string",
    "name": "string",
    "address": "string o null",
    "latitude": number,
    "longitude": number,
    "distance_km": number
  } o null,
  "environmental_impact": "string o null",
  "ecopoints_earned": number,
  "friendly_message": "string (mensaje cálido con onda y emojis dirigiéndote a ${userName})"
}`;

    let resultResponse: any = null;

    // Intentar con Google Gemini API
    if (GEMINI_API_KEY) {
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
                  parts: [{ text: message }],
                },
              ],
              generationConfig: {
                response_mime_type: "application/json",
                temperature: 0.2,
              },
            }),
          });

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textContent) {
              const parsed = JSON.parse(textContent);
              resultResponse = {
                waste_type: parsed.waste_type || null,
                container_type: parsed.container_type || null,
                container_color: parsed.container_color || null,
                suggested_point: parsed.suggested_point ? formatPoint(parsed.suggested_point) : null,
                environmental_impact: parsed.environmental_impact || null,
                ecopoints_earned: typeof parsed.ecopoints_earned === "number" ? parsed.ecopoints_earned : 0,
                friendly_message: parsed.friendly_message || "¡Hola! ¿En qué residuo te puedo ayudar hoy? 🌿",
              };
              break; // Modelo exitoso, terminar bucle
            }
          } else {
            console.warn(`Modelo ${model} falló con status ${geminiRes.status}`);
          }
        } catch (modelErr) {
          console.warn(`Error llamando a ${model}:`, modelErr);
        }
      }
    }

    // Respaldo local si Gemini no devolvió respuesta
    if (!resultResponse) {
      resultResponse = classifyLocally(message, nearbyPoints, userName);
    }

    // Registrar en ai_queries_log
    const durationMs = Date.now() - startTime;
    supabase.from("ai_queries_log").insert([
      {
        query_text: message.substring(0, 300),
        waste_category: resultResponse.waste_type || "Consulta",
        container_type: resultResponse.container_type || "general",
        container_color: resultResponse.container_color || "verde",
        ecopoints_awarded: resultResponse.ecopoints_earned || 0,
        response_time_ms: durationMs,
        resolved_point_id: resultResponse.suggested_point?.id || null,
      }
    ]).then(() => {});

    return new Response(JSON.stringify(resultResponse), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (err: any) {
    console.error("Error general en classify:", err);
    const fallback = {
      waste_type: null,
      container_type: null,
      container_color: null,
      suggested_point: null,
      environmental_impact: null,
      ecopoints_earned: 0,
      friendly_message: "¡Hola! Estoy listo para ayudarte a reciclar. Contame qué residuo u objeto tenés y te digo dónde llevarlo 🌿"
    };
    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
