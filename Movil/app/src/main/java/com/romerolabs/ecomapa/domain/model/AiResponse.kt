package com.romerolabs.ecomapa.domain.model

/**
 * Modelo de la respuesta JSON de la Edge Function `/classify` (Groq API).
 *
 * Parsea el JSON estructurado que devuelve el modelo LLaMA incluyendo
 * el tipo de residuo, contenedor sugerido, impacto ambiental y ecopuntos.
 */
data class AiResponse(
    /** Tipo de residuo identificado (ej: 'pilas', 'vidrio', 'orgánico'). */
    val wasteType: String,
    /** Tipo de contenedor correcto (ej: 'peligroso', 'vidrio', 'organico'). */
    val containerType: String,
    /** Color del contenedor (ej: 'rojo', 'azul', 'verde'). */
    val containerColor: String,
    /** Punto de reciclaje sugerido más cercano (puede ser null si no hay). */
    val suggestedPoint: RecyclingPoint? = null,
    /** Impacto ambiental estimado (texto descriptivo). */
    val environmentalImpact: String,
    /** Ecopuntos otorgados por esta consulta. */
    val ecopointsEarned: Int,
    /** Mensaje amigable de la IA para mostrar en el chat. */
    val friendlyMessage: String
)
