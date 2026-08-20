import axios from 'axios';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `
Eres un asistente virtual de EcoMapa. Tu único propósito es responder preguntas relacionadas con EcoMapa, una aplicación para el reciclaje inteligente.
Información sobre EcoMapa:
- Es una aplicación para conectar a las personas con puntos de reciclaje y promover la sostenibilidad.
- La aplicación tiene un estilo visual moderno, verde esmeralda y azul cielo.
- Fomenta la responsabilidad ambiental.

REGLAS ESTRICTAS:
1. SOLO puedes responder preguntas sobre EcoMapa, sus funciones, reciclaje en la app y temas ambientales relacionados con la app.
2. Si el usuario te hace una pregunta sobre cualquier otro tema (política, historia, programación, matemáticas, etc.), DEBES responder EXACTAMENTE: "Lo siento, solo puedo responder preguntas relacionadas con EcoMapa y sus funcionalidades."
3. Sé amable y profesional en todas tus respuestas.
`;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const sendMessageToGroq = async (messages: ChatMessage[]) => {
  try {
    const payload = {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.2, // Baja temperatura para mantenerlo enfocado
    };

    const response = await axios.post(GROQ_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error al comunicarse con Groq API:", error);
    return "Hubo un error al intentar conectarme con el servidor. Por favor, intenta de nuevo más tarde.";
  }
};
