package com.romerolabs.ecomapa.data.repository

import com.romerolabs.ecomapa.data.remote.api.SupabaseApi
import com.romerolabs.ecomapa.data.remote.api.dto.CreatePickupRequestDto
import com.romerolabs.ecomapa.domain.model.PickupRequest
import com.romerolabs.ecomapa.domain.repository.PickupRepository

class PickupRepositoryImpl(
    private val api: SupabaseApi
) : PickupRepository {

    override suspend fun requestPickup(request: PickupRequest): Result<PickupRequest> {
        return try {
            val dto = CreatePickupRequestDto(
                userName = request.userName,
                userPhone = request.userPhone,
                wasteType = request.wasteType,
                estimatedVolume = request.estimatedVolume,
                notes = request.notes,
                address = request.address,
                latitude = request.latitude,
                longitude = request.longitude,
                preferredDate = request.preferredDate,
                preferredTimeSlot = request.preferredTimeSlot,
                status = "pendiente"
            )

            val created = api.createPickupRequest(dto)
            val resultDomain = created.firstOrNull()?.toDomain() ?: request
            Result.success(resultDomain)
        } catch (e: Exception) {
            Result.failure(Exception("No se pudo registrar la solicitud de retiro: ${e.message}", e))
        }
    }
}
