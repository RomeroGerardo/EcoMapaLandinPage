package com.romerolabs.ecomapa.domain.repository

import com.romerolabs.ecomapa.domain.model.AiResponse

/**
 * Contrato para el servicio de clasificación de residuos por IA.
 *
 * La implementación debe hacer un POST a la Edge Function `/classify`
 * de Supabase, que actúa como proxy seguro hacia Groq API.
 * Ninguna API Key de Groq debe exponerse en el cliente.
 */
interface AiRepository {
    /**
     * Envía un mensaje y coordenadas para ser clasificado por la IA.
     *
     * @param message Descripción del residuo en lenguaje natural.
     * @param userLat Latitud actual del usuario.
     * @param userLng Longitud actual del usuario.
     * @return [Result] con la respuesta de la IA o el error.
     */
    suspend fun classify(
        message: String,
        userLat: Double,
        userLng: Double
    ): Result<AiResponse>
}
