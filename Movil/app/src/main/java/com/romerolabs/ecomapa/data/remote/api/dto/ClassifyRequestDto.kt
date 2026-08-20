package com.romerolabs.ecomapa.data.remote.api.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO del payload POST a la Edge Function `/classify`.
 *
 * Formato esperado por classify/index.ts:
 * ```json
 * { "message": "...", "user_lat": -31.42, "user_lng": -64.18 }
 * ```
 */
data class ClassifyRequestDto(
    @SerializedName("message")
    val message: String,
    @SerializedName("user_lat")
    val userLat: Double,
    @SerializedName("user_lng")
    val userLng: Double
)
