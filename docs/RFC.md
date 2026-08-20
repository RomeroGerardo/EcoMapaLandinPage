# RFC — EcoMapa: Diseño Técnico del MVP

**Estado:** Borrador  
**Autor:** Arquitectura de Software  
**Fecha:** 2026-04-22  
**Referencia:** `docs/PRD.md` (Aprobado)

---

## 1. Resumen Ejecutivo

Este documento describe la arquitectura técnica y las decisiones de diseño para **EcoMapa**, un MVP universitario que asiste al ciudadano en la clasificación y disposición correcta de residuos reciclables mediante inteligencia artificial y geolocalización.

El sistema combina un **frontend en Flutter (Web)** con un **backend serverless en Supabase** (PostgreSQL + Edge Functions) y la **API de Groq** (modelo LLaMA) para ofrecer:

- Un **asistente conversacional de IA** que identifica el tipo de residuo, lo clasifica, calcula su impacto ambiental y sugiere el contenedor más cercano.
- Un **mapa interactivo** (OpenStreetMap) con marcadores geolocalizados por color de contenedor.
- Un **sistema de gamificación frictionless** (sin registro ni login) que persiste Ecopuntos e insignias en el almacenamiento local del dispositivo.

El objetivo de este RFC es definir de forma unívoca el stack, la arquitectura, el modelo de datos y el plan de fases para que cualquier desarrollador pueda implementar el MVP sin ambigüedades.

---

## 2. Stack Tecnológico (No Negociable)

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend** | Flutter 3.x (compilado a **Web**) | Código único exportable a Android en futuras iteraciones. Rendimiento nativo en navegador vía Wasm/CanvasKit. |
| **Mapas** | `flutter_map` + tiles de **OpenStreetMap** | Gratuito, sin API Key, comunidad activa. Alternativa a Google Maps sin costos. |
| **Backend / DB** | **Supabase** (PostgreSQL + Edge Functions en Deno) | Capa gratuita generosa, API REST auto-generada, Row Level Security, hosting de funciones serverless. |
| **Inteligencia Artificial** | **Groq API** (modelo `llama-3.3-70b-versatile`) | Inferencia en milisegundos gracias a hardware LPU. Capa gratuita disponible. |
| **Gamificación Local** | `shared_preferences` (Flutter) | Persistencia clave-valor en el navegador (LocalStorage) sin necesidad de autenticación ni backend adicional. |
| **Hosting Frontend** | **Vercel** o **Firebase Hosting** | Despliegue estático de la build Flutter Web con CI/CD mínimo. |

### Dependencias clave de Flutter (`pubspec.yaml`)

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_map: ^7.0.0          # Mapa OSM
  latlong2: ^0.9.0             # Coordenadas geográficas
  geolocator: ^13.0.0          # API de geolocalización del dispositivo
  http: ^1.2.0                 # Llamadas HTTP a Supabase Edge Functions
  shared_preferences: ^2.3.0   # Persistencia local (gamificación)
  flutter_animate: ^4.5.0      # Micro-animaciones UI
  provider: ^6.1.0             # State management liviano
```

---

## 3. Arquitectura del Sistema

### 3.1 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO (Navegador)                      │
│                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────────────┐  │
│  │  Mapa    │    │  Chat IA     │    │  Panel Gamificación   │  │
│  │ (OSM)   │    │  (Input)     │    │  (Ecopuntos/Insignias)│  │
│  └────┬─────┘    └──────┬───────┘    └───────────┬───────────┘  │
│       │                 │                        │              │
│       │    ┌────────────▼────────────┐           │              │
│       │    │   GeolocatorService     │           │              │
│       │    │   (lat, lng del user)   │           │              │
│       │    └────────────┬────────────┘           │              │
│       │                 │                        │              │
│       │                 ▼                        │              │
│       │    ┌─────────────────────────┐           │              │
│       │    │   Supabase Edge Function│           │              │
│       │    │   POST /classify        │           │              │
│       │    └────────────┬────────────┘           │              │
└───────┼─────────────────┼────────────────────────┼──────────────┘
        │                 │                        │
        │                 ▼                        │
        │    ┌─────────────────────────┐           │
        │    │       Groq API          │           │
        │    │  (LLaMA 3.3 70B)       │           │
        │    │  System Prompt +        │           │
        │    │  coords + residuo       │           │
        │    └────────────┬────────────┘           │
        │                 │                        │
        │                 ▼                        │
        │    ┌─────────────────────────┐           │
        │    │  Respuesta JSON:        │           │
        │    │  - tipo_contenedor      │           │
        │    │  - color                │           │
        │    │  - punto_cercano (lat,  │           │
        │    │    lng, distancia)      │           │
        │    │  - impacto_ambiental    │           │
        │    │  - ecopuntos_ganados    │           │
        │    └────────────┬────────────┘           │
        │                 │                        │
        ▼                 ▼                        ▼
  ┌───────────┐  ┌──────────────┐   ┌──────────────────────┐
  │ Renderizar│  │ Mostrar resp │   │ Sumar Ecopuntos en   │
  │ marcador  │  │ en chat      │   │ shared_preferences   │
  │ en mapa   │  │              │   │ + check insignias    │
  └───────────┘  └──────────────┘   └──────────────────────┘
```

### 3.2 Flujo Técnico Paso a Paso

1. **Captura de ubicación:** Al iniciar la app, `GeolocatorService` solicita permisos de geolocalización del navegador y obtiene `(lat, lng)` del usuario.
2. **Carga del mapa:** `flutter_map` renderiza los tiles de OSM centrados en la ubicación del usuario. Se consultan los `recycling_points` desde Supabase REST API filtrando por radio (~5 km) y se pintan como marcadores coloreados.
3. **Consulta al asistente IA:** El usuario escribe su duda en el chat (ej: *"Tengo unas pilas rotas"*). El frontend envía un `POST` a la **Edge Function** `/classify` de Supabase con el payload:
   ```json
   {
     "message": "Tengo unas pilas rotas",
     "user_lat": -31.4201,
     "user_lng": -64.1888
   }
   ```
4. **Edge Function (Proxy seguro):** La función en Deno lee la `GROQ_API_KEY` desde las variables de entorno del proyecto Supabase, arma el prompt del sistema inyectando las coordenadas del usuario y la lista de puntos de reciclaje cercanos (consultados desde la misma DB), y hace la llamada a `https://api.groq.com/openai/v1/chat/completions`.
5. **Respuesta de Groq:** El modelo LLaMA devuelve un JSON estructurado indicando tipo de contenedor, color, punto más cercano, impacto ambiental estimado y ecopuntos a otorgar.
6. **Actualización del frontend:** El chat muestra la respuesta. El mapa centra/resalta el contenedor sugerido. El módulo de gamificación suma los ecopuntos en `shared_preferences` y evalúa si se desbloquea una insignia nueva.

### 3.3 Seguridad

- La **API Key de Groq nunca llega al navegador**. Reside exclusivamente como variable de entorno en Supabase (`GROQ_API_KEY`).
- Las Edge Functions validan el payload entrante (esquema JSON, largo máximo del mensaje, coordenadas dentro de rangos válidos).
- La tabla `recycling_points` usa **Row Level Security (RLS)** con política de solo lectura (`SELECT`) para el `anon` key de Supabase.

---

## 4. Estructura de Carpetas

```
ecomapa/
├── lib/
│   ├── main.dart                       # Entry point
│   ├── app.dart                        # MaterialApp, rutas, tema global
│   │
│   ├── config/
│   │   ├── constants.dart              # URLs de Supabase, radios de búsqueda
│   │   ├── theme.dart                  # Colores, tipografía, tema Material
│   │   └── env.dart                    # Variables de entorno (Supabase URL/Anon Key)
│   │
│   ├── models/
│   │   ├── recycling_point.dart        # Modelo del punto de reciclaje
│   │   ├── ai_response.dart            # Modelo de la respuesta de Groq
│   │   ├── chat_message.dart           # Modelo de mensaje del chat
│   │   ├── badge.dart                  # Modelo de insignia/logro
│   │   └── user_progress.dart          # Modelo del progreso del usuario
│   │
│   ├── services/
│   │   ├── location_service.dart       # Wrapper de Geolocator
│   │   ├── supabase_service.dart       # Cliente REST para recycling_points
│   │   ├── ai_service.dart             # POST a la Edge Function /classify
│   │   └── gamification_service.dart   # CRUD de Ecopuntos/Insignias (shared_preferences)
│   │
│   ├── providers/
│   │   ├── map_provider.dart           # Estado del mapa (centro, zoom, marcadores)
│   │   ├── chat_provider.dart          # Estado del chat (mensajes, loading)
│   │   └── gamification_provider.dart  # Estado de puntos e insignias
│   │
│   ├── screens/
│   │   ├── home_screen.dart            # Pantalla principal (mapa + chat + puntos)
│   │   └── badges_screen.dart          # Pantalla de colección de insignias
│   │
│   ├── widgets/
│   │   ├── map/
│   │   │   ├── eco_map.dart            # Widget del mapa con flutter_map
│   │   │   ├── recycling_marker.dart   # Marcador personalizado por color
│   │   │   └── user_location_marker.dart
│   │   ├── chat/
│   │   │   ├── chat_panel.dart         # Panel lateral/inferior del chat
│   │   │   ├── chat_bubble.dart        # Burbuja de mensaje (user/IA)
│   │   │   └── chat_input.dart         # Input de texto + botón enviar
│   │   └── gamification/
│   │       ├── ecopoints_counter.dart  # Contador animado de puntos
│   │       ├── badge_card.dart         # Tarjeta de insignia
│   │       └── badge_unlock_dialog.dart # Dialog de celebración al desbloquear
│   │
│   └── utils/
│       ├── distance_calculator.dart    # Haversine para distancia entre coords
│       └── color_mapper.dart           # Mapa tipo_contenedor → Color
│
├── supabase/
│   └── functions/
│       └── classify/
│           └── index.ts                # Edge Function: proxy a Groq API
│
├── web/
│   └── index.html                      # Shell HTML para Flutter Web
│
├── assets/
│   ├── badges/                         # Íconos SVG/PNG de insignias
│   └── images/                         # Recursos gráficos UI
│
├── pubspec.yaml
├── analysis_options.yaml
└── README.md
```

---

## 5. Modelo de Datos

### 5.1 Script SQL para Supabase

```sql
-- ============================================
-- EcoMapa: Modelo de datos MVP
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Habilitar extensión PostGIS para funciones geoespaciales
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enum para tipos de contenedor
CREATE TYPE container_type AS ENUM (
  'organico',
  'papel_carton',
  'plastico_metal',
  'vidrio',
  'peligroso',
  'electronico',
  'textil',
  'general'
);

-- Tabla principal de puntos de reciclaje
CREATE TABLE recycling_points (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,                              -- Nombre descriptivo del punto
  description   TEXT,                                       -- Detalle opcional
  type          container_type NOT NULL,                    -- Clasificación del contenedor
  color         TEXT NOT NULL,                              -- Color visual (verde, azul, amarillo, rojo, etc.)
  latitude      DOUBLE PRECISION NOT NULL,                  -- Coordenada latitud
  longitude     DOUBLE PRECISION NOT NULL,                  -- Coordenada longitud
  geom          GEOMETRY(Point, 4326),                      -- Columna geométrica PostGIS (SRID WGS84)
  address       TEXT,                                       -- Dirección legible
  is_active     BOOLEAN DEFAULT true,                       -- Estado: activo/inactivo
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Índice espacial para consultas de proximidad eficientes
CREATE INDEX idx_recycling_points_geom ON recycling_points USING GIST (geom);

-- Índice por tipo para filtrado rápido
CREATE INDEX idx_recycling_points_type ON recycling_points (type);

-- Índice por estado activo
CREATE INDEX idx_recycling_points_active ON recycling_points (is_active) WHERE is_active = true;

-- Trigger para auto-generar la columna geom a partir de lat/lng
CREATE OR REPLACE FUNCTION set_geom_from_coords()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_geom
  BEFORE INSERT OR UPDATE OF latitude, longitude ON recycling_points
  FOR EACH ROW
  EXECUTE FUNCTION set_geom_from_coords();

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_updated_at
  BEFORE UPDATE ON recycling_points
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE recycling_points ENABLE ROW LEVEL SECURITY;

-- Política: cualquier usuario anónimo puede leer puntos activos
CREATE POLICY "Lectura pública de puntos activos"
  ON recycling_points
  FOR SELECT
  USING (is_active = true);

-- ============================================
-- Función RPC: buscar puntos cercanos
-- ============================================
CREATE OR REPLACE FUNCTION get_nearby_points(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5.0
)
RETURNS TABLE (
  id            UUID,
  name          TEXT,
  type          container_type,
  color         TEXT,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  address       TEXT,
  distance_km   DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rp.id,
    rp.name,
    rp.type,
    rp.color,
    rp.latitude,
    rp.longitude,
    rp.address,
    ROUND(
      (ST_DistanceSphere(
        rp.geom,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)
      ) / 1000.0)::NUMERIC, 2
    )::DOUBLE PRECISION AS distance_km
  FROM recycling_points rp
  WHERE rp.is_active = true
    AND ST_DWithin(
      rp.geom::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000  -- ST_DWithin usa metros
    )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Datos de prueba (Córdoba, Argentina)
-- ============================================
INSERT INTO recycling_points (name, type, color, latitude, longitude, address) VALUES
  ('Ecocentro Plaza España',     'plastico_metal', 'amarillo', -31.4201, -64.1888, 'Av. Vélez Sársfield 500'),
  ('Punto Verde Parque Sarmiento','organico',      'verde',    -31.4274, -64.1847, 'Parque Sarmiento s/n'),
  ('Contenedor Vidrio Centro',   'vidrio',         'azul',     -31.4135, -64.1811, 'Colón 200'),
  ('Punto Pilas - Municipalidad','peligroso',      'rojo',     -31.4167, -64.1833, 'Marcelo T. de Alvear 120'),
  ('Campana Textil Nueva Córdoba','textil',        'naranja',  -31.4250, -64.1900, 'Av. Hipólito Yrigoyen 350');
```

### 5.2 Diagrama Entidad-Relación (MVP)

```
┌──────────────────────────────────────┐
│           recycling_points           │
├──────────────────────────────────────┤
│ id            UUID (PK)              │
│ name          TEXT                    │
│ description   TEXT?                   │
│ type          container_type (ENUM)   │
│ color         TEXT                    │
│ latitude      DOUBLE PRECISION        │
│ longitude     DOUBLE PRECISION        │
│ geom          GEOMETRY(Point, 4326)   │
│ address       TEXT?                   │
│ is_active     BOOLEAN                 │
│ created_at    TIMESTAMPTZ             │
│ updated_at    TIMESTAMPTZ             │
└──────────────────────────────────────┘
```

> **Nota:** En el MVP se utiliza una única tabla. En iteraciones futuras se podrán agregar tablas para `users`, `recycling_logs` (historial de reciclaje por usuario), y `challenges` (desafíos semanales).

---

## 6. Diseño de Interfaz y Gamificación

### 6.1 Almacenamiento Local con `shared_preferences`

Toda la información de progreso del usuario se persiste en el `LocalStorage` del navegador a través de `shared_preferences`. No se requiere autenticación.

**Claves almacenadas:**

| Clave | Tipo | Descripción |
|---|---|---|
| `eco_total_points` | `int` | Acumulador total de Ecopuntos |
| `eco_queries_count` | `int` | Número total de consultas realizadas |
| `eco_badges` | `String` (JSON) | Lista de IDs de insignias desbloqueadas |
| `eco_last_query` | `String` (ISO8601) | Timestamp de la última consulta |
| `eco_streak_days` | `int` | Racha de días consecutivos usando la app |

### 6.2 Catálogo de Insignias (MVP)

| ID | Nombre | Ícono | Condición de desbloqueo | Puntos bonus |
|---|---|---|---|---|
| `first_query` | Eco Curioso | 🌱 | Primera consulta al asistente IA | +10 |
| `toxic_hero` | Héroe Tóxico | 🔋 | Reciclar primer residuo peligroso (pilas, baterías) | +50 |
| `glass_master` | Maestro del Vidrio | 🍶 | Reciclar 3 items de vidrio | +30 |
| `recycler_10` | Reciclador x10 | ♻️ | Alcanzar 10 consultas totales | +100 |
| `streak_3` | Racha Verde | 🔥 | 3 días consecutivos usando la app | +75 |
| `eco_warrior` | Guerrero Eco | 🛡️ | Acumular 500 Ecopuntos totales | +200 |

### 6.3 Sistema de Puntuación

```
Consulta estándar:          +20 Ecopuntos
Residuo peligroso:          +50 Ecopuntos
Bonus por insignia nueva:   Variable (ver tabla)
Bonus racha diaria (≥3d):   x1.5 multiplicador
```

### 6.4 Flujo de Gamificación en Código

```dart
// Pseudocódigo del flujo en GamificationService
Future<GamificationResult> processReward(AiResponse response) async {
  // 1. Sumar puntos base según tipo de residuo
  int points = response.ecopointsEarned;

  // 2. Verificar multiplicador de racha
  if (await _getStreakDays() >= 3) {
    points = (points * 1.5).round();
  }

  // 3. Persistir nuevo total
  final total = await _addPoints(points);

  // 4. Evaluar insignias desbloqueadas
  final newBadges = await _evaluateBadges(response, total);

  // 5. Retornar resultado para la UI
  return GamificationResult(
    pointsEarned: points,
    totalPoints: total,
    newBadges: newBadges,
  );
}
```

### 6.5 UX de Celebración

Al desbloquear una insignia, se muestra un **dialog modal animado** con:
- Ícono de la insignia con animación de escala (bounce-in) usando `flutter_animate`.
- Nombre y descripción de la insignia.
- Confetti/partículas animadas como feedback positivo.
- Botón "¡Genial!" para cerrar.

---

## 7. Plan de Implementación por Fases (Fase 1 — MVP)

### Sprint 1: Infraestructura Base (Días 1-3)

| # | Módulo | Descripción |
|---|---|---|
| 1.1 | Proyecto Flutter | Scaffold del proyecto con la estructura de carpetas definida en §4. Configurar `pubspec.yaml` con todas las dependencias. |
| 1.2 | Tema y Design System | `config/theme.dart` — Paleta de colores eco (verdes, azules), tipografía, componentes reutilizables. |
| 1.3 | Supabase Setup | Crear proyecto en Supabase. Ejecutar script SQL (§5.1). Configurar RLS y variables de entorno (`GROQ_API_KEY`). |
| 1.4 | Edge Function `/classify` | Desarrollar la función en TypeScript/Deno que recibe el mensaje + coordenadas, consulta puntos cercanos, arma el prompt y llama a Groq API. |

### Sprint 2: Mapa y Geolocalización (Días 4-6)

| # | Módulo | Descripción |
|---|---|---|
| 2.1 | `LocationService` | Implementar solicitud de permisos y obtención de coordenadas con `geolocator`. Fallback a búsqueda manual si permisos son denegados. |
| 2.2 | `SupabaseService` | Cliente REST para consultar `get_nearby_points()` RPC. |
| 2.3 | `EcoMap` Widget | Integrar `flutter_map` con tiles OSM. Renderizar `RecyclingMarker` por color. Mostrar ubicación del usuario. |
| 2.4 | `MapProvider` | Estado reactivo: centro del mapa, zoom, lista de marcadores, marcador seleccionado. |

### Sprint 3: Asistente IA + Chat (Días 7-9)

| # | Módulo | Descripción |
|---|---|---|
| 3.1 | `AiService` | POST a Edge Function `/classify`. Parsear respuesta JSON a `AiResponse` model. |
| 3.2 | `ChatPanel` + Widgets | Panel de chat con `ChatBubble`, `ChatInput`. Diseño responsive (lateral en desktop, inferior en mobile). |
| 3.3 | `ChatProvider` | Estado: lista de mensajes, estado de carga, conversación. |
| 3.4 | Integración Mapa ↔ Chat | Al recibir respuesta IA, centrar mapa en el punto sugerido y resaltar el marcador. |

### Sprint 4: Gamificación y Polish (Días 10-12)

| # | Módulo | Descripción |
|---|---|---|
| 4.1 | `GamificationService` | Lógica de puntos, rachas e insignias con `shared_preferences`. |
| 4.2 | `EcopointsCounter` | Widget animado que muestra los puntos sumándose en tiempo real. |
| 4.3 | `BadgeUnlockDialog` | Modal de celebración con animaciones al desbloquear un logro. |
| 4.4 | `BadgesScreen` | Pantalla de colección mostrando insignias desbloqueadas y bloqueadas (en gris). |

### Sprint 5: QA, Deploy y Demo (Días 13-15)

| # | Módulo | Descripción |
|---|---|---|
| 5.1 | Testing | Validar los 5 tipos de materiales (orgánico, vidrio, plástico, papel, peligroso). Verificar persistencia de Ecopuntos tras cierre de navegador. |
| 5.2 | Build Web | `flutter build web --release`. Optimizar assets. |
| 5.3 | Deploy | Subir a Vercel/Firebase Hosting. Configurar dominio y variables de entorno. |
| 5.4 | Demo | Preparar presentación con caso de uso end-to-end. |

---

## Apéndice A: System Prompt para Groq API

```
Eres EcoAsistente, un experto en reciclaje y medio ambiente. Tu misión es ayudar al usuario a clasificar sus residuos correctamente.

CONTEXTO:
- La ubicación del usuario es: latitud {{user_lat}}, longitud {{user_lng}}.
- Los puntos de reciclaje cercanos son:
{{nearby_points_json}}

INSTRUCCIONES:
1. Identifica el tipo de residuo que el usuario describe.
2. Indica el tipo de contenedor correcto y su color.
3. Del listado de puntos cercanos, sugiere el más adecuado indicando nombre, dirección y distancia.
4. Calcula un impacto ambiental estimado (ej: litros de agua ahorrados, kg de CO2 evitados).
5. Asigna Ecopuntos: 20 base, 50 si es residuo peligroso.

FORMATO DE RESPUESTA (JSON estricto):
{
  "waste_type": "string",
  "container_type": "string",
  "container_color": "string",
  "suggested_point": {
    "id": "uuid",
    "name": "string",
    "address": "string",
    "distance_km": number
  },
  "environmental_impact": "string",
  "ecopoints_earned": number,
  "friendly_message": "string"
}
```

---

## Apéndice B: Ejemplo de Edge Function `/classify`

```typescript
// supabase/functions/classify/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { message, user_lat, user_lng } = await req.json();

    // Validación básica
    if (!message || !user_lat || !user_lng) {
      return new Response(
        JSON.stringify({ error: "Faltan campos: message, user_lat, user_lng" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Consultar puntos cercanos desde Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: nearbyPoints } = await supabase.rpc("get_nearby_points", {
      user_lat,
      user_lng,
      radius_km: 5.0,
    });

    // Construir System Prompt
    const systemPrompt = `Eres EcoAsistente...`; // (ver Apéndice A, inyectando nearbyPoints)

    // Llamar a Groq API
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      }
    );

    const groqData = await groqResponse.json();
    const aiContent = groqData.choices[0].message.content;

    return new Response(aiContent, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

---

**Fin del RFC — Documento sujeto a revisión por el equipo de desarrollo.**
