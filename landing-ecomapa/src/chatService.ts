const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uuagrhbdgyvopezoakia.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const sendMessageToGroq = async (messages: ChatMessage[]) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/landing-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages: messages.filter((message) => message.role !== 'system') })
    });

    const data = await response.json();
    return data.reply || '¿En qué te puedo ayudar sobre EcoMapa?';
  } catch (error) {
    console.error("Error al comunicarse con el asistente:", error);
    return "Hubo un error al intentar conectarme con el servidor. Por favor, intenta de nuevo más tarde.";
  }
};
