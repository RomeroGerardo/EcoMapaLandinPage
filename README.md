# EcoMapa V 2.1 · Suite de Gestión Ambiental & GovTech SaaS

Desarrollado por **CivicLoop Technologies S.A.**

Plataforma integral para municipios, empresas con Responsabilidad Extendida del Productor (REP) y ciudadanía, compuesta por:
- **Web SuperAdmin:** Consola ejecutiva de CivicLoop Technologies (Puerto `5174`).
- **Web Tenant:** Portal operativo de la jurisdicción municipal (Puerto `5173`).
- **Mobile Android:** App ciudadana nativa en Kotlin & Jetpack Compose.

---

## 🚀 Inicio Rápido (Quickstart)

### 1. Prerrequisitos
- Node.js 18+ (LTS recomendado 20+)
- JDK 17+ (para compilar la app móvil)
- Android Studio / SDK (para Android)

### 2. Variables de Entorno
Crea o revisa `.env.local` tanto en `web-tenant/` como en `web-superadmin/`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
VITE_GROQ_API_KEY=tu_groq_api_key_aqui
```

---

## 💻 Ejecución de Plataformas Web

### Consola Matriz SuperAdmin (CivicLoop Technologies)
```bash
cd web-superadmin
npm install
npx vite --port 5174 --host
```
Acceso: [http://localhost:5174/](http://localhost:5174/)

### Portal Operativo Territorial (EcoMapa Municipio)
```bash
cd web-tenant
npm install
npx vite --port 5173 --host
```
Acceso: [http://localhost:5173/](http://localhost:5173/)

---

## 📱 Compilación de la Aplicación Móvil Android

```powershell
cd Movil
.\gradlew.bat assembleDebug
```
El instalador generado se ubicará en:
`Movil/app/build/outputs/apk/debug/app-debug.apk`

Para instalar vía USB con ADB:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 📚 Documentación y Manuales
- **Manual de Usuario con Capturas:** Ver artefacto en el informe de tesis.
- **Manual Técnico Detallado:** Disponible en la documentación del proyecto.
