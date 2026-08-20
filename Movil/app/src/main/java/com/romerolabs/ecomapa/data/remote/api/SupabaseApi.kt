package com.romerolabs.ecomapa.data.remote.api

import com.romerolabs.ecomapa.data.remote.api.dto.AiResponseDto
import com.romerolabs.ecomapa.data.remote.api.dto.ClassifyRequestDto
import com.romerolabs.ecomapa.data.remote.api.dto.CreateClaimDto
import com.romerolabs.ecomapa.data.remote.api.dto.CreatePickupRequestDto
import com.romerolabs.ecomapa.data.remote.api.dto.PickupRequestDto
import com.romerolabs.ecomapa.data.remote.api.dto.RecyclingPointDto
import com.romerolabs.ecomapa.data.remote.api.dto.RewardClaimDto
import com.romerolabs.ecomapa.data.remote.api.dto.RewardDto
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

/**
 * Interfaz Retrofit para la API REST de Supabase con extensiones de Fase 2.
 */
interface SupabaseApi {

    /** Clasifica un residuo via la Edge Function `/classify`. */
    @POST("functions/v1/classify")
    suspend fun classify(@Body request: ClassifyRequestDto): AiResponseDto

    /** Consulta puntos de reciclaje cercanos via RPC PostGIS. */
    @POST("rest/v1/rpc/get_nearby_points")
    suspend fun getNearbyPoints(@Body params: Map<String, @JvmSuppressWildcards Any>): List<RecyclingPointDto>

    /** Obtiene todos los puntos de reciclaje activos y aprobados. */
    @GET("rest/v1/recycling_points?is_active=eq.true&is_approved=eq.true&select=*")
    suspend fun getAllActivePoints(): List<RecyclingPointDto>

    // ── Fase 2: Recompensas & Marketplace B2B ──
    @GET("rest/v1/rewards?is_active=eq.true&select=*&order=ecopoints_cost.asc")
    suspend fun getActiveRewards(): List<RewardDto>

    @POST("rest/v1/reward_claims")
    suspend fun claimReward(@Body claim: CreateClaimDto): List<RewardClaimDto>

    // ── Fase 2: Retiros a Domicilio ──
    @POST("rest/v1/pickup_requests")
    suspend fun createPickupRequest(@Body request: CreatePickupRequestDto): List<PickupRequestDto>
}
