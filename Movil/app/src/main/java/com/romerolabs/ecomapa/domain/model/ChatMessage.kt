package com.romerolabs.ecomapa.domain.model

import java.time.Instant

/**
 * Modelo de un mensaje en el chat entre el usuario y el asistente IA.
 *
 * Puede contener una [AiResponse] asociada cuando es un mensaje
 * proveniente de la IA con datos estructurados de clasificación.
 */
data class ChatMessage(
    /** Contenido textual del mensaje. */
    val content: String,
    /** `true` si el mensaje es del usuario, `false` si es de la IA. */
    val isUser: Boolean,
    /** Marca temporal del mensaje. */
    val timestamp: Instant = Instant.now(),
    /** Respuesta estructurada de la IA (solo en mensajes de la IA). */
    val aiResponse: AiResponse? = null
)
