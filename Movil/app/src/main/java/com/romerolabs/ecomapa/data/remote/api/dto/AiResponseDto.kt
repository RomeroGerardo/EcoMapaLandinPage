package com.romerolabs.ecomapa.data.remote.api.dto

import com.google.gson.annotations.SerializedName
import com.romerolabs.ecomapa.domain.model.AiResponse

/**
 * DTO de la respuesta JSON de la Edge Function `/classify`.
 *
 * Mapea el formato definido en el System Prompt (RFC Apéndice A):
 * ```json
 * {
 *   "waste_type": "string",
 *   "container_type": "string",
 *   "container_color": "string",
 *   "suggested_point": { ... },
 *   "environmental_impact": "string",
 *   "ecopoints_earned": number,
 *   "friendly_message": "string"
 * }
 * ```
 */
data class AiResponseDto(
    @SerializedName("waste_type")
    val wasteType: String? = null,
    @SerializedName("container_type")
    val containerType: String? = null,
    @SerializedName("container_color")
    val containerColor: String? = null,
    @SerializedName("suggested_point")
    val suggestedPoint: SuggestedPointDto? = null,
    @SerializedName("environmental_impact")
    val environmentalImpact: String? = null,
    @SerializedName("ecopoints_earned")
    val ecopointsEarned: Int? = null,
    @SerializedName("friendly_message")
    val friendlyMessage: String? = null
) {
    /** Convierte el DTO a modelo de dominio con valores por defecto seguros. */
    fun toDomain(): AiResponse = AiResponse(
        wasteType = wasteType ?: "",
        containerType = containerType ?: "",
        containerColor = containerColor ?: "",
        suggestedPoint = suggestedPoint?.toDomain(
            fallbackType = containerType ?: "",
            fallbackColor = containerColor ?: ""
        ),
        environmentalImpact = environmentalImpact ?: "",
        ecopointsEarned = ecopointsEarned ?: 20,
        friendlyMessage = friendlyMessage ?: ""
    )
}
