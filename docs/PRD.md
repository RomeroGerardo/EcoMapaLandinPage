# PRD — Documento de Requerimientos del Producto: EcoMapa V2.1

**Estado:** Producción / Validado con Autoridades  
**Metodología:** Desarrollo Orientado a Especificaciones (SDD) & Clean Architecture  
**Núcleo Tecnológico:**
- **App Móvil:** Android Nativo (Kotlin 2.0, Jetpack Compose, osmdroid, Retrofit, DataStore)
- **Panel Web Admin:** React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend & Base de Datos:** Supabase (PostGIS, Edge Functions Deno, Groq LLaMA 3.3-70b, RLS)

---

## 1. El Problema y Oportunidad
Los ciudadanos enfrentan dificultades para clasificar residuos complejos (pilas, electrónicos, residuos voluminosos, medicamentos) y encontrar puntos de reciclaje adecuados. A su vez, los municipios carecen de herramientas de trazabilidad en tiempo real, los recuperadores urbanos no disponen de un canal digital para coordinar retiros de residuos pesados, y los fabricantes bajo leyes REP (Responsabilidad Extendida del Productor) necesitan visibilizar sus puntos de recolección oficiales.

---

## 2. Objetivos del Producto (V2.1)
1. **Asistencia Ciudadana Inteligente:** Asistente conversacional con IA (Llama 3 en Groq) que clasifica residuos en lenguaje natural, informa el impacto ecológico y geolocaliza el punto más cercano.
2. **Gamificación B2B Real:** Evolución de Ecopuntos virtuales a beneficios tangibles canjeables en supermercados, farmacias y comercios adheridos.
3. **Logística de Retiros a Domicilio:** Canal para solicitar recolección de residuos voluminosos (muebles, escombros, ramas, chatarra) coordinado con cooperativas y cuadrillas municipales.
4. **Módulo REP (Responsabilidad Extendida del Productor):** Certificación y mapeo de marcas (Duracell, AgroClean, Samsung) para recuperación de residuos especiales.
5. **Centros Privados y Tarifas por Kg:** Visualización de centros de compra de chatarra, metales y cartón con precios actualizados.
6. **Plataforma SaaS Multi-Tenant (B2G / B2B):** Panel administrativo con roles para Superadmin, Municipios y Empresas Privadas con métricas de impacto en tiempo real.

---

## 3. Alcance de Plataformas

### A. App Móvil Android (`/Movil`)
- **Mapa Interactivo:** Renderizado offline-first con `osmdroid` y OpenStreetMap, marcadores categorizados por color y geolocalización GPS de alta precisión con fallback.
- **Chatbot Asistente:** Integración con la Edge Function `/classify` de Supabase, respuestas enriquecidas con ecopuntos y navegación directa a Google Maps.
- **Marketplace de Recompensas (`RewardsScreen`):** Catálogo de cupones B2B, saldo de Ecopuntos y generación de códigos de cupón únicos.
- **Solicitud de Retiro a Domicilio (`PickupScreen`):** Formulario para recolección de residuos voluminosos con selección de franja horaria.
- **Colección de Insignias (`BadgesScreen`):** Sistema de 6 logros desbloqueables con multiplicadores de racha basados en días de calendario.

### B. Panel Web Administrativo (`/web`)
- **Autenticación Segura:** Inicio de sesión y registro de administradores con Supabase Auth y protección de rutas privadas (`ProtectedRoute`).
- **Dashboard Overview:** Métricas en tiempo real de puntos aprobados, pendientes y gráfico semanal de actividad.
- **Métricas de IA & Telemetría:** Monitoreo de consultas ciudadanas, latencias de la Edge Function y categorías más preguntadas (`ai_queries_log`).
- **Aprobación de Puntos (`Approvals`):** Flujo de moderación con un clic para altas enviadas por entidades y comercios.
- **Gestión de Retiros (`Pickups`):** Panel logístico para asignar cuadrillas o cooperativas y actualizar estados (`pendiente` -> `asignado` -> `completado`).
- **Gestión de Recompensas (`RewardsManager`):** Creación de cupones y seguimiento de canjes por usuarios.
- **Directorio REP (`RepProducers`):** Registro de fabricantes adheridos a programas de recuperación de residuos especiales.

---

## 4. Requerimientos de Base de Datos (Supabase PostGIS)

| Tabla / Objeto | Descripción | RLS |
|---|---|:---:|
| `public.tenants` | Municipios y empresas privadas suscritas al SaaS | ✅ |
| `public.recycling_points` | Puntos de reciclaje con PostGIS `location`, colores, tarifas $/kg y marcas REP | ✅ |
| `public.pickup_requests` | Solicitudes de retiro a domicilio de residuos voluminosos | ✅ |
| `public.rewards` | Catálogo de cupones y beneficios comerciales B2B | ✅ |
| `public.reward_claims` | Historial de canjes realizados con código de cupón único | ✅ |
| `public.producers` | Directorio de marcas adheridas a Responsabilidad Extendida del Productor | ✅ |
| `public.ai_queries_log` | Telemetría y analítica de consultas procesadas por la IA | ✅ |
| `public.get_nearby_points` | Función RPC PostGIS con ordenamiento espacial por `ST_DWithin` | ✅ |

---

## 5. Criterios de Calidad y Rendimiento
- **Resiliencia de la IA:** La Edge Function `/classify` cuenta con clasificación semántica inteligente y fallback local automático garantizando disponibilidad 100% ante caídas de proveedores externos.
- **Gamificación Justa:** El cálculo de rachas diarias evalúa días de calendario (`LocalDate`) para evitar que múltiples consultas en un mismo día reinicien la racha.
- **Build Limpio:** Tanto la app móvil como el panel web compilan con 0 errores de tipado o linter (`tsc -b && vite build` y Kotlin Gradle).
