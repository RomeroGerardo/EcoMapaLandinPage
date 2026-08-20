# TASKS.md — EcoMapa V2.1: Registro de Ejecución y Estado del Proyecto

**Versión:** 2.1.0  
**Última Actualización:** Agosto 2026  
**Metodología:** Desarrollo por Fases, Clean Architecture & Validación E2E

---

## 📊 Resumen General del Estado

| Fase | Alcance | Estado |
|---|---|:---:|
| **Fase 1** | Deuda Técnica, Separación de Stack y Estabilización | ✅ 100% Completado |
| **Fase 2** | Devoluciones de Autoridades (REP, Retiros, Recompensas B2B, Centros Privados) | ✅ 100% Completado |
| **Fase 3** | Pulido de Lógica, Optimización de Rachas y Documentación Integral | ✅ 100% Completado |

---

## 📱 Fase 1 · Estabilización del Stack (Android Kotlin + React Web)

### App Android (`/Movil`)
- [x] **AUD-01:** Auditoría profunda de 38 archivos Kotlin descartando esqueletos vacíos.
- [x] **BUG-01:** Corrección de race condition en mapa `osmdroid` mediante `FolderOverlay` separados (`userFolder` y `pointsFolder`).
- [x] **BUG-02:** Implementación de geolocalización en 2 pasos: `lastLocation` con fallback a `getCurrentLocation(PRIORITY_HIGH_ACCURACY)`.
- [x] **BUG-04:** Manejo descriptivo de excepciones de red (`HttpException` 401/403/429/5xx, `SocketTimeoutException`, `UnknownHostException`).
- [x] **MEJORA-01:** Mensaje de bienvenida contextual del EcoAsistente pre-cargado en el ViewModel.
- [x] **MEJORA-02:** `SnackbarHost` para alertas no bloqueantes en errores de red.
- [x] **MEJORA-03:** Auto-solicitud de permisos y centrado de ubicación GPS al iniciar.

### Panel Web Admin (`/web`)
- [x] **DB-01:** Migración de base de datos en Supabase con PostGIS, trigger de sincronización y función RPC `get_nearby_points`.
- [x] **WEB-01:** Implementación de pantalla `Approvals.tsx` con carga de puntos pendientes, join con tenants y acciones Aprobar/Rechazar.
- [x] **WEB-02:** Sistema de autenticación con `Supabase Auth`, persistencia en Zustand, página de `Login.tsx` y `ProtectedRoute`.
- [x] **WEB-03:** Conexión de `Overview.tsx` con conteos reales de DB y gráfico semanal de nuevos puntos.
- [x] **WEB-04:** Conexión de métricas de telemetría de IA en `Analytics.tsx` con la tabla `ai_queries_log`.
- [x] **WEB-05:** Consolidación de layouts en `/dashboard/*` y redirección limpia de rutas legacy.

---

## 🏛️ Fase 2 · Devoluciones de la Presentación ante Autoridades

### 1. Responsabilidad Extendida del Productor (REP)
- [x] **REP-01 (DB):** Creación de tabla `producers` y columna `producer_id` en `recycling_points`.
- [x] **REP-02 (Web):** Módulo `/dashboard/rep` (`RepProducers.tsx`) para registrar fabricantes y programas de recuperación.
- [x] **REP-03 (Móvil):** Distintivo `⭐ Punto Oficial REP` en los marcadores del mapa (`EcoMapView.kt`).

### 2. Sistema de Retiros a Domicilio (Residuos Voluminosos)
- [x] **RET-01 (DB):** Creación de tabla `pickup_requests` con estados, tipo de material, volumen y turnos.
- [x] **RET-02 (Móvil):** Pantalla `PickupScreen.kt` con formulario para solicitar recolección de muebles, escombros, chatarra y ramas.
- [x] **RET-03 (Web):** Módulo logístico `/dashboard/pickups` (`Pickups.tsx`) para asignar cuadrillas de recolección.

### 3. Gamificación B2B & Recompensas Reales
- [x] **REC-01 (DB):** Creación de tablas `rewards` y `reward_claims` con código de cupón digital.
- [x] **REC-02 (Web):** Módulo `/dashboard/rewards` (`RewardsManager.tsx`) para que comercios publiquen beneficios y cupones.
- [x] **REC-03 (Móvil):** Pantalla `RewardsScreen.kt` para consultar saldo de Ecopuntos y canjear cupones con código en pantalla.

### 4. Centros de Reciclaje Privados & Tarifas por Kilo
- [x] **CEN-01 (DB):** Columnas `is_private_facility` y `price_per_kg_detail` en `recycling_points`.
- [x] **CEN-02 (Web):** Formulario `AddPointForm.tsx` con soporte para centros privados y cotización de compra ($/kg).
- [x] **CEN-03 (Móvil):** Marcadores con badges enriquecidos informando tarifas de compra de materiales (aluminio, cartón, cobre).

### 5. Resiliencia y Despliegue de IA
- [x] **AI-01:** Despliegue de Edge Function `/functions/v1/classify` (v4) con clasificación semántica inteligente y fallback local automático.
- [x] **AI-02:** Registro automatizado de telemetría en `ai_queries_log`.

---

## ⚡ Fase 3 · Pulido de Lógica & Puesta en Producción

- [x] **BUG-03 (Móvil):** Optimización de la lógica de racha en `GamificationRepositoryImpl.kt` utilizando `LocalDate` (días de calendario) para evitar reinicios al hacer múltiples consultas en un mismo día.
- [x] **BUG-WEB-01 (Web):** Corrección de colisión de foco entre `Dialog` y `Select` en `RewardsManager.tsx` y `RepProducers.tsx`.
- [x] **LAND-01 (Web):** Integración de Landing Page oficial Material Design 3 (`LandingPage.tsx`) con descarga de APK, modal QR y Bento Grid V2.1.
- [x] **SEC-01 (Web):** Arquitectura de seguridad en 3 niveles (Ciudadano, Municipio/Comercio y Superadmin Romero Labs con `SuperAdminRoute`).
- [x] **SAAS-01 (Web):** Panel Superadmin de Entidades & Control de Suscripciones SaaS (`Tenants.tsx`).
- [x] **AI-CHAT-01 (Web):** Chatbot comercial de Landing conectado a Groq (`openai/gpt-oss-120b`), logo oficial de la app, formateador sin signos raros y rol anti-jailbreak estricto.
- [x] **DOC-01:** Actualización completa de `docs/PRD.md`, `docs/RESUMEN_ECOMAPA.md`, `docs/TASKS.md` y `tasks_mejoras_presentacion.md`.
- [x] **BUILD-01:** Verificación de compilación de producción en Web (`npm run build`) con 0 errores.

---

## 📌 Tareas Pendientes para la Próxima Sesión

- [ ] **APK-01:** Generar y alojar el archivo `ecomapa.apk` final en `web/public/downloads/ecomapa.apk`.
- [ ] **DEPLOY-01:** Configuración y verificación de despliegue en Vercel / Netlify para el dominio público.
- [ ] **E2E-01:** Prueba final del circuito completo simulando usuario móvil, municipio y superadmin.

---

*Registro oficial de tareas completadas de EcoMapa V2.1 — Romero Labs.*
