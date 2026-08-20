package com.romerolabs.ecomapa.domain.repository

import com.romerolabs.ecomapa.domain.model.PickupRequest

interface PickupRepository {
    suspend fun requestPickup(request: PickupRequest): Result<PickupRequest>
}
