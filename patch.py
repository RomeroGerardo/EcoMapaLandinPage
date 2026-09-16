import json
import re

with open(r'C:\Users\Usuario\.gemini\antigravity\brain\0d08c3d9-5a9b-411a-be84-3e395519b303\.system_generated\steps\1105\output.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)
content = data['files'][0]['content']

content = content.replace('"Evitas la contaminación de hasta 600.000 litros de agua dulce."', '"Tené en cuenta que CADA pila alcalina puede contaminar hasta 167.000 litros de agua."')
content = content.replace('"Las pilas contienen metales pesados y deben depositarse en contenedores especiales rojos o puntos oficiales REP. ¡Excelente iniciativa!"', '"¡Qué onda! Excelente iniciativa. Las pilas tienen metales pesados re peligrosos, así que mandala directo al contenedor rojo o punto oficial REP. ¡Seguí así!"')

content = content.replace('const { message, user_lat, user_lng } = body;', 'const { message, user_lat, user_lng, user_name } = body;')
content = content.replace('"llama-3.3-70b-versatile"', '"openai/gpt-oss-120b"')

new_prompt_code = '''const userName = user_name || 'amigo/a';
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
}`;'''

content = re.sub(r'const systemPrompt = `.*?}`;', new_prompt_code, content, flags=re.DOTALL)

with open('tmp_classify.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
