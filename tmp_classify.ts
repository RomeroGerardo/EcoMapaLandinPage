import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://uuagrhbdgyvopezoakia.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1YWdyaGJkZ3l2b3Blem9ha2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTA1MjcsImV4cCI6MjA5MjQ2NjUyN30.JaoX421xZ-kIdz_Z6LwFHXxtwVSYa5ICdGvGRCR2Yt8";
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";

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

// Clasificador inteligente local por palabras clave
function classifyLocally(text: string, nearbyPoints: any[]) {
  const lower = text.toLowerCase();
  
  if (lower.includes("pila") || lower.includes("bateria") || lower.includes("batería")) {
    const point = nearbyPoints.find((p) => p.type === "peligroso" || p.color === "rojo" || p.type === "rep_oficial") || nearbyPoints[0];
    return {
      waste_type: "Pilas y Baterías",
      container_type: "peligroso",
      container_color: "rojo",
      suggested_point: formatPoint(point),
      environmental_impact: "Tené en cuenta que CADA pila alcalina puede contaminar hasta 167.000 litros de agua.",
      ecopoints_earned: 50,
      friendly_message: "¡Qué onda! Excelente iniciativa. Las pilas tienen metales pesados re peligrosos, así que mandala directo al contenedor rojo o punto oficial REP. ¡Seguí así!"
    };
  }

  if (lower.includes("vidrio") || lower.includes("botella de vidrio") || lower.includes("frasco") || lower.includes("copa")) {
    const point = nearbyPoints.find((p) => p.type === "vidrio" || p.color === "verde") || nearbyPoints[0];
    return {
      waste_type: "Vidrio",
      container_type: "vidrio",
      container_color: "verde",
      suggested_point: formatPoint(point),
      environmental_impact: "Ahorras un 30% de energía en la fundición de nuevo vidrio.",
      ecopoints_earned: 30,
      friendly_message: "El vidrio es 100% reciclable de forma infinita. Asegúrate de enjuagarlo antes de depositarlo en la campana verde."
    };
  }

  if (lower.includes("plastico") || lower.includes("plástico") || lower.includes("pet") || lower.includes("botella") || lower.includes("bolsa") || lower.includes("sachet")) {
    const point = nearbyPoints.find((p) => p.type === "plastico" || p.color === "amarillo") || nearbyPoints[0];
    return {
      waste_type: "Plásticos & PET",
      container_type: "plastico",
      container_color: "amarillo",
      suggested_point: formatPoint(point),
      environmental_impact: "Evitas que el plástico tarde hasta 500 años en degradarse.",
      ecopoints_earned: 20,
      friendly_message: "Limpia y aplasta la botella para optimizar el espacio del contenedor amarillo. ¡Gran trabajo!"
    };
  }

  if (lower.includes("carton") || lower.includes("cartón") || lower.includes("papel") || lower.includes("caja") || lower.includes("diario") || lower.includes("revista")) {
    const point = nearbyPoints.find((p) => p.type === "papel_carton" || p.color === "azul") || nearbyPoints[0];
    return {
      waste_type: "Papel & Cartón",
      container_type: "papel_carton",
      container_color: "azul",
      suggested_point: formatPoint(point),
      environmental_impact: "Salvas árboles y ahorras hasta 140 litros de agua por kilo de papel reciclado.",
      ecopoints_earned: 20,
      friendly_message: "Mantén el cartón seco y desarmado antes de depositarlo en el contenedor azul."
    };
  }

  if (lower.includes("remedio") || lower.includes("medicamento") || lower.includes("blister") || lower.includes("jarabe") || lower.includes("farmacia")) {
    const point = nearbyPoints.find((p) => p.type === "farmacia" || p.color === "rojo") || nearbyPoints[0];
    return {
      waste_type: "Medicamentos Vencidos",
      container_type: "farmacia",
      container_color: "rojo",
      suggested_point: formatPoint(point),
      environmental_impact: "Evitas la contaminación de napas subterráneas y fauna acuática.",
      ecopoints_earned: 40,
      friendly_message: "Los medicamentos vencidos no deben tirarse a la basura común. Llévalos al buzón de residuos farmacéuticos de una farmacia adherida."
    };
  }

  if (lower.includes("mueble") || lower.includes("sillon") || lower.includes("sillón") || lower.includes("colchon") || lower.includes("colchón") || lower.includes("escombro") || lower.includes("chatarra") || lower.includes("rama")) {
    return {
      waste_type: "Residuo Voluminoso",
      container_type: "especial",
      container_color: "naranja",
      suggested_point: formatPoint(nearbyPoints[0]),
      environmental_impact: "Permite la recuperación formal de materiales pesados por cooperativas.",
      ecopoints_earned: 30,
      friendly_message: "Para residuos pesados o voluminosos, puedes utilizar la función de 'Retiro a Domicilio 🚛' de EcoMapa para que una cuadrilla pase a buscarlo por tu casa."
    };
  }

  // Fallback general
  const point = nearbyPoints[0] || null;
  return {
    waste_type: "Residuo General / Reciclable",
    container_type: "general",
    container_color: "verde",
    suggested_point: formatPoint(point),
    environmental_impact: "Contribuyes a la economía circular y a una ciudad más limpia.",
    ecopoints_earned: 20,
    friendly_message: "Para reciclar este material, asegúrate de que esté limpio y seco antes de depositarlo en el punto verde más cercano."
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

    const lat = Number(user_lat) || -31.4201;
    const lng = Number(user_lng) || -64.1888;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Obtener puntos cercanos o activos
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

    let resultResponse: any = null;

    // Intentar con Groq API si la key existe
    if (GROQ_API_KEY && GROQ_API_KEY.startsWith("gsk_")) {
      try {
        const userName = user_name || 'amigo/a';
        const systemPrompt = `Eres EcoAsistente, un amigo súper buena onda experto en reciclaje.
Estás hablando con ${userName}. Dirígete a esta persona por su nombre, con un tono muy amigable, cercano y cool (con onda).
Ubicación usuario: lat ${lat}, lng ${lng}.
Puntos cercanos: ${JSON.stringify(nearbyPoints)}

Responde ÚNICAMENTE en este formato JSON:
{
  "waste_type": "string",
  "container_type": "string",
  "container_color": "string",
  "suggested_point": {
    "id": "uuid",
    "name": "string",
    "address": "string",
    "latitude": number,
    "longitude": number,
    "distance_km": number
  },
  "environmental_impact": "string (Ej: datos reales y proporcionales. En vez de 600mil L por 1 pila, aclara que es POR CADA unidad, o da un dato real interesante y preciso)",
  "ecopoints_earned": number,
  "friendly_message": "string (Mensaje dirigiéndote a ${userName} con mucha onda, emojis y motivación)"
}`;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message },
            ],
            temperature: 0.3,
            max_tokens: 800,
            response_format: { type: "json_object" },
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const content = groqData.choices?.[0]?.message?.content;
          if (content) {
            resultResponse = JSON.parse(content);
          }
        }
      } catch (groqErr) {
        console.warn("Groq API error, usando clasificador local:", groqErr);
      }
    }

    // Si Groq no devolvió resultado, usar clasificador local
    if (!resultResponse) {
      resultResponse = classifyLocally(message, nearbyPoints);
    }

    // Registrar en ai_queries_log
    const durationMs = Date.now() - startTime;
    supabase.from("ai_queries_log").insert([
      {
        query_text: message.substring(0, 300),
        waste_category: resultResponse.waste_type || "General",
        container_type: resultResponse.container_type || "general",
        container_color: resultResponse.container_color || "verde",
        ecopoints_awarded: resultResponse.ecopoints_earned || 20,
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
    console.error("Error en classify:", err);
    // Fallback de emergencia
    const fallback = {
      waste_type: "Residuo General",
      container_type: "general",
      container_color: "verde",
      suggested_point: null,
      environmental_impact: "Reciclar protege nuestro planeta.",
      ecopoints_earned: 20,
      friendly_message: "Para reciclar este residuo, llévalo al punto verde más cercano asegurándote de que esté limpio y seco."
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
