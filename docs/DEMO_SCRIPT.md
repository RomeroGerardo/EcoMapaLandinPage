# Script de Demo — EcoMapa MVP

**Objetivo:** Demostrar el flujo completo (end-to-end) de EcoMapa, validando la interacción del usuario con la IA, la respuesta en el mapa y la gamificación, en menos de 5 minutos.

## Requisitos previos
- Aplicación EcoMapa abierta en el navegador (`https://ecomapa.vercel.app` o entorno local).
- Permisos de geolocalización concedidos.

## Paso a Paso

### 1. Inicio y Ubicación (0:00 - 0:30)
- **Acción:** Abrir la aplicación y otorgar permisos de ubicación si se solicita.
- **Narrativa:** "Bienvenidos a EcoMapa. Al ingresar, la aplicación detecta nuestra ubicación y carga en el mapa los puntos de reciclaje más cercanos a nosotros, identificados por colores según el tipo de residuo."
- **Verificación:** El mapa centra en la ubicación del usuario (punto azul) y muestra marcadores de contenedores cercanos. El contador de ecopuntos muestra el saldo actual.

### 2. Primera Interacción: Residuo Peligroso (0:30 - 1:30)
- **Acción:** En el chat, escribir: *"Tengo unas pilas rotas"*. Enviar mensaje.
- **Narrativa:** "Tenemos unas pilas usadas y no sabemos qué hacer. Le preguntamos al EcoAsistente IA."
- **Verificación:**
  - El mensaje aparece en el panel de chat.
  - La IA responde con la clasificación correcta: **Residuo Peligroso**.
  - Recomienda el **Contenedor Rojo**.
  - **El mapa hace zoom y resalta automáticamente** el "Punto Pilas" más cercano.
  - Se muestra el impacto ambiental y se otorgan **+50 Ecopuntos**.

### 3. Gamificación: Desbloqueo de Insignia (1:30 - 2:00)
- **Acción:** Observar la animación del contador y la insignia.
- **Narrativa:** "Al ser nuestra primera consulta, el sistema de gamificación nos premia instantáneamente."
- **Verificación:**
  - El contador de puntos en la esquina superior derecha suma los puntos animadamente (+50).
  - Aparece el popup de celebración de logro desbloqueando la insignia **Eco Curioso** (o **Héroe Tóxico** por reciclar residuos peligrosos).
  - Cerrar el dialog haciendo clic en "¡Genial!".

### 4. Segunda Interacción: Reciclaje Común (2:00 - 3:00)
- **Acción:** En el chat, escribir: *"Quiero reciclar unas botellas de vidrio"*. Enviar mensaje.
- **Narrativa:** "Ahora reciclemos algo más común, vidrio."
- **Verificación:**
  - La IA responde: **Contenedor Azul**.
  - **El mapa redirige su vista** hacia el contenedor de vidrio más cercano y parpadea el marcador azul.
  - Suma **+20 Ecopuntos** base. (O más si hay racha activa).

### 5. Pantalla de Insignias y Colección (3:00 - 3:30)
- **Acción:** Hacer clic en el botón flotante de trofeo (🏆) o navegar a la pantalla de insignias.
- **Narrativa:** "Podemos consultar nuestro progreso general en la sección de Insignias."
- **Verificación:**
  - Se abre `BadgesScreen`.
  - Muestra el total de ecopuntos actualizados.
  - Las insignias desbloqueadas ("Eco Curioso", "Héroe Tóxico") están coloreadas con fecha de desbloqueo.
  - Las insignias restantes están en escala de grises con un ícono de candado.

### 6. Prueba de Persistencia (3:30 - 4:00)
- **Acción:** Refrescar completamente la página web (F5 o Cmd+R) o cerrar y volver a abrir la pestaña.
- **Narrativa:** "Para garantizar una buena experiencia, nuestro progreso queda guardado localmente."
- **Verificación:**
  - Al volver a cargar, los Ecopuntos se mantienen igual.
  - Al ir a la pantalla de Insignias, las insignias conseguidas siguen estando desbloqueadas, demostrando la persistencia con `shared_preferences`.

## Fin de la Demo
- **Narrativa:** "Con esto concluimos la presentación de EcoMapa, una solución inteligente y gamificada para el reciclaje local. ¡Muchas gracias!"
