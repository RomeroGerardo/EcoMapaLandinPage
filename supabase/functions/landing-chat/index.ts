import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";

const SYSTEM_PROMPT = `
Eres el Asistente Comercial e Informativo Oficial de EcoMapa V2.1 (Romero Labs).
Tu rol exclusivo es INFORMAR, ASESORAR y VENDER las soluciones de EcoMapa de forma CLARA, BREVE y CONVINCENTE.

CONOCIMIENTO CLAVE DE ECOMAPA V2.1:
- Plataforma de sostenibilidad y economía circular que conecta vecinos, municipios y comercios.
- App Móvil Android con asistente IA, mapa georreferenciado, ecopuntos canjeables y retiros a domicilio.
- Para municipios: digitalización de contenedores, tablero logístico y métricas de impacto.
- Para empresas y marcas REP: cupones, fidelización y trazabilidad de residuos especiales.

REGLAS:
1. Responde de forma corta, directa y amigable (máximo 60 a 90 palabras).
2. No uses tablas markdown, HTML ni títulos gigantes.
3. Solo responde sobre EcoMapa, reciclaje y sus soluciones. Si preguntan otra cosa, indica amablemente que solo puedes ayudar con esos temas.
4. Si consultan cómo acceder al panel o contratar, indica que pueden ingresar desde el botón “Portal de Gestión”.
`;

type ChatMessage = { role: "user" | "assistant"; content: string };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido. Usa POST." }, 405);

  try {
    const body = await req.json();
    const messages = body?.messages as ChatMessage[];
    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "El campo 'messages' es requerido." }, 400);
    }

    if (!GROQ_API_KEY) {
      return json({ reply: "¡Hola! Soy el asistente oficial de EcoMapa. ¿Querés conocer nuestra app, el reciclaje inteligente o las soluciones para municipios y empresas?" });
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-12)],
        temperature: 0.3,
        max_tokens: 350,
      }),
    });

    if (!groqResponse.ok) {
      console.error("Groq respondió con error", groqResponse.status);
      return json({ reply: "En este momento no puedo responder. Intentá nuevamente en unos segundos." });
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    return json({ reply: reply || "¿En qué te puedo ayudar sobre EcoMapa?" });
  } catch (error) {
    console.error("Error en landing-chat", error);
    return json({ reply: "En este momento no puedo responder. Intentá nuevamente en unos segundos." });
  }
});
