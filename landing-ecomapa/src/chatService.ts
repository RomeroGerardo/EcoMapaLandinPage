import axios from 'axios';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `
Eres un asesor comercial y experto de EcoMapa.
Tu único propósito es explicar punto a punto cualquier duda que tenga el usuario sobre la plataforma, y principalmente INCENTIVAR LA DESCARGA de la app.
Información sobre EcoMapa:
- Es una aplicación para conectar a las personas con puntos de reciclaje y promover la sostenibilidad.
- Permite ganar Ecopuntos por reciclar, que se canjean por descuentos en comercios adheridos.
- Ofrece un mapa con Puntos Verdes y retiros a domicilio de residuos voluminosos.
- Fomenta la responsabilidad ambiental de forma inteligente.

REGLAS ESTRICTAS:
1. SOLO puedes responder preguntas sobre EcoMapa, sus funciones, reciclaje en la app y promover su descarga. No puedes dar otra información.
2. Si el usuario te hace una pregunta sobre cualquier otro tema, DEBES responder: "Lo siento, como asesor de EcoMapa solo puedo brindarte información sobre nuestra aplicación. ¡Te invito a descargarla para empezar a reciclar!"
3. SIEMPRE debes invitar e incentivar al usuario a descargar la aplicación en tus respuestas.
4. Sé amable, persuasivo y explica las funciones punto a punto.
`;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const sendMessageToGroq = async (messages: ChatMessage[]) => {
  try {
    const payload = {
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.3,
    };

    const response = await axios.post(GROQ_API_URL, payload, {
      headers: {
        'Authorization': \`Bearer \${GROQ_API_KEY}\`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error al comunicarse con Groq API:", error);
    return "Hubo un error al intentar conectarme con el servidor. Por favor, intenta de nuevo más tarde.";
  }
};