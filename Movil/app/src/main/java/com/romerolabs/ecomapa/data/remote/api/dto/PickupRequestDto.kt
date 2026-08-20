package com.romerolabs.ecomapa.data.remote.api.dto

import com.google.gson.annotations.SerializedName
import com.romerolabs.ecomapa.domain.model.PickupRequest

data class CreatePickupRequestDto(
    @SerializedName("user_name") val userName: String,
    @SerializedName("user_phone") val userPhone: String,
    @SerializedName("waste_type") val wasteType: String,
    @SerializedName("estimated_volume") val estimatedVolume: String,
    @SerializedName("notes") val notes: String? = null,
    @SerializedName("address") val address: String,
    @SerializedName("latitude") val latitude: Double,
    @SerializedName("longitude") val longitude: Double,
    @SerializedName("preferred_date") val preferredDate: String,
    @SerializedName("preferred_time_slot") val preferredTimeSlot: String,
    @SerializedName("status") val status: String = "pendiente"
)

data class PickupRequestDto(
    @SerializedName("id") val id: String,
    @SerializedName("user_name") val userName: String,
    @SerializedName("user_phone") val userPhone: String,
    @SerializedName("waste_type") val wasteType: String,
    @SerializedName("estimated_volume") val estimatedVolume: String,
    @SerializedName("notes") val notes: String? = null,
    @SerializedName("address") val address: String,
    @SerializedName("latitude") val latitude: Double,
    @SerializedName("longitude") val longitude: Double,
    @SerializedName("preferred_date") val preferredDate: String,
    @SerializedName("preferred_time_slot") val preferredTimeSlot: String,
    @SerializedName("status") val status: String,
    @SerializedName("assigned_collector") val assignedCollector: String? = null
) {
    fun toDomain(): PickupRequest = PickupRequest(
        id = id,
        userName = userName,
        userPhone = userPhone,
        wasteType = wasteType,
        estimatedVolume = estimatedVolume,
        notes = notes,
        address = address,
        latitude = latitude,
        longitude = longitude,
        preferredDate = preferredDate,
        preferredTimeSlot = preferredTimeSlot,
        status = status,
        assignedCollector = assignedCollector
    )
}
