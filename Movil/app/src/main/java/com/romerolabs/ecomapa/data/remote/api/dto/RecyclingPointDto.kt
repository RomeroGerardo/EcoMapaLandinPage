package com.romerolabs.ecomapa.data.remote.api.dto

import com.google.gson.annotations.SerializedName
import com.romerolabs.ecomapa.domain.model.RecyclingPoint

/**
 * DTO para puntos de reciclaje devueltos por Supabase REST API
 * y por la RPC `get_nearby_points` con soporte para Fase 2.
 */
data class RecyclingPointDto(
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("type")
    val type: String,
    @SerializedName("color")
    val color: String,
    @SerializedName("latitude")
    val latitude: Double,
    @SerializedName("longitude")
    val longitude: Double,
    @SerializedName("address")
    val address: String? = null,
    @SerializedName("distance_km")
    val distanceKm: Double? = null,
    @SerializedName("is_private_facility")
    val isPrivateFacility: Boolean? = null,
    @SerializedName("price_per_kg_detail")
    val pricePerKgDetail: String? = null,
    @SerializedName("producer_name")
    val producerName: String? = null
) {
    /** Convierte el DTO a modelo de dominio. */
    fun toDomain(): RecyclingPoint = RecyclingPoint(
        id = id,
        name = name,
        type = type,
        color = color,
        latitude = latitude,
        longitude = longitude,
        address = address,
        distanceKm = distanceKm,
        isPrivateFacility = isPrivateFacility ?: false,
        pricePerKgDetail = pricePerKgDetail,
        producerName = producerName
    )
}
