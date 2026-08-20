package com.romerolabs.ecomapa.domain.model

/**
 * Modelo de una solicitud de retiro a domicilio para residuos voluminosos (Fase 2).
 */
data class PickupRequest(
    val id: String = "",
    val userName: String,
    val userPhone: String,
    val wasteType: String,
    val estimatedVolume: String,
    val notes: String? = null,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val preferredDate: String,
    val preferredTimeSlot: String,
    val status: String = "pendiente",
    val assignedCollector: String? = null
)
