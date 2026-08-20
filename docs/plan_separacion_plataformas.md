# Plan de Acción: Separación de Plataformas (Móvil vs Web)

> [!NOTE]
> Este documento detalla los pasos conceptuales y técnicos para separar la arquitectura actual en dos frontends distintos: una **aplicación móvil** exclusiva para usuarios finales y una **plataforma web** para administradores y entes. Ambas plataformas compartirán el mismo backend/base de datos.

## 1. Fase de Análisis y Preparación

- **Auditoría de Componentes:** Identificar y listar todas las pantallas, componentes y lógica de negocio que pertenecen exclusivamente al área de administración (Dashboard Superadmin, Gestión de Entes).
- **Separación de Lógica Compartida:** Identificar funciones o utilidades que ambas plataformas necesitarán (ej. conexión a DB, validaciones) para extraerlas o replicarlas ordenadamente.
- **Auditoría de Dependencias:** Revisar qué librerías (`package.json`) son exclusivas para la web (ej. librerías de tablas complejas) y cuáles para móvil (ej. mapas nativos) para limpiar los proyectos más adelante.

## 2. Fase de Creación del Nuevo Entorno Web

- **Inicializar proyecto web:** Crear un nuevo repositorio o directorio exclusivo para el panel web (recomendado usar herramientas modernas como Vite + React o Next.js).
- **Conexión al Backend:** Configurar las variables de entorno para conectar este nuevo proyecto web a la misma base de datos (Firebase, Supabase, etc.) que usa la aplicación actual.
- **Estructura Base:** Configurar el sistema de ruteo, autenticación y el layout base del Dashboard (menú lateral, barra superior, diseño responsivo).

## 3. Fase de Migración (De App a Web)

- **Migrar Autenticación:** Mover la lógica de login específica para roles con privilegios (Superadmin y Entes).
- **Migrar Dashboard Superadmin:** Trasladar todas las vistas, métricas, tablas de usuarios y configuraciones globales al nuevo proyecto web.
- **Migrar Panel de Entes:** Mover la gestión propia de los entes.
- **Verificación de Integridad:** Probar exhaustivamente que la nueva plataforma web pueda leer y modificar la base de datos sin problemas.

## 4. Fase de Limpieza y Enfoque (App Móvil)

> [!WARNING]
> Esta fase solo debe ejecutarse cuando el nuevo entorno web esté completamente funcional y validado.

- **Eliminar Rutas Admin:** Borrar del proyecto móvil todo el ruteo hacia los paneles de administración.
- **Depuración de Código:** Eliminar componentes y archivos de la interfaz que ya no se utilizarán en móvil.
- **Limpieza de Dependencias:** Desinstalar librerías que solo servían para la parte administrativa, reduciendo el peso final de la aplicación.
- **Optimización:** Enfocar el código de la app móvil al 100% en la experiencia del usuario: Mapa interactivo, Chat IA y sistema de suma de puntos.

## 5. Fase de Seguridad y Control de Accesos

> [!IMPORTANT]
> Es vital proteger los accesos ahora que las puertas de entrada están físicamente separadas.

- **Reglas de Base de Datos:** Asegurar a nivel de servidor/DB que solo los roles autorizados puedan acceder a datos sensibles (Ej. Reglas de Firebase/Supabase).
- **Restricción Cruzada:**
  - Si un *Superadmin* o *Ente* intenta iniciar sesión en la App Móvil, decidir si se le deniega el acceso con un mensaje indicando que use la plataforma web, o si se le da una vista de usuario común.
  - Si un *Usuario Móvil* intenta acceder a la Web, denegar el acceso automáticamente por falta de permisos.

## 6. Despliegue (Deploy)

- **Deploy Web:** Publicar el panel de administración en un servicio de alojamiento en la nube (Vercel, Firebase Hosting, AWS, etc.).
- **Release Móvil:** Compilar y lanzar la nueva versión de la app móvil (más ligera y segura) en las respectivas tiendas de aplicaciones.
