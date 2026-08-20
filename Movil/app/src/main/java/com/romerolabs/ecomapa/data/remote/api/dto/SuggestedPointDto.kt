package com.romerolabs.ecomapa.data.remote.api.dto

import com.google.gson.annotations.SerializedName
import com.romerolabs.ecomapa.domain.model.RecyclingPoint

/**
 * DTO para el punto sugerido dentro de la respuesta de IA.
 * Puede venir con o sin coordenadas completas.
 */
data class SuggestedPointDto(
    @SerializedName("id")
    val id: String? = null,
    @SerializedName("name")
    val name: String? = null,
    @SerializedName("type")
    val type: String? = null,
    @SerializedName("color")
    val color: String? = null,
    @SerializedName("address")
    val address: String? = null,
    @SerializedName("latitude")
    val latitude: Double? = null,
    @SerializedName("longitude")
    val longitude: Double? = null,
    @SerializedName("distance_km")
    val distanceKm: Double? = null
) {
    /** Convierte a modelo de dominio si tiene datos mínimos (name). */
    fun toDomain(fallbackType: String = "", fallbackColor: String = ""): RecyclingPoint? {
        val pointName = name ?: return null
        return RecyclingPoint(
            id = id ?: "",
            name = pointName,
            type = type ?: fallbackType,
            color = color ?: fallbackColor,
            latitude = latitude ?: 0.0,
            longitude = longitude ?: 0.0,
            address = address,
            distanceKm = distanceKm
        )
    }
}
