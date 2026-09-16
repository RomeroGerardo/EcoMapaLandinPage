const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const sendLandingMessageToGroq = async (messages: { role: 'user' | 'assistant'; content: string }[]) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/landing-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    });
    const data = await response.json();
    return data.reply || "¡Hola! ¿En qué te puedo asesorar sobre EcoMapa V2.1?";
  } catch (error) {
    console.error("Error al comunicarse con el asistente:", error);
    return "En este momento no puedo responder. Intentá nuevamente en unos segundos.";
  }
};
