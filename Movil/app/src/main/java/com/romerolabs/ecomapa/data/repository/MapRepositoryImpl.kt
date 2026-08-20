package com.romerolabs.ecomapa.data.repository

import android.util.Log
import com.romerolabs.ecomapa.data.remote.api.SupabaseApi
import com.romerolabs.ecomapa.domain.model.RecyclingPoint
import com.romerolabs.ecomapa.domain.repository.MapRepository
import retrofit2.HttpException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

private const val TAG = "MapRepository"

class MapRepositoryImpl(
    private val api: SupabaseApi
) : MapRepository {

    override suspend fun getNearbyPoints(
        lat: Double,
        lng: Double,
        radiusKm: Double
    ): List<RecyclingPoint> {
        return try {
            val params = mapOf(
                "user_lat" to lat,
                "user_lng" to lng,
                "radius_km" to radiusKm
            )
            api.getNearbyPoints(params).map { it.toDomain() }
        } catch (e: UnknownHostException) {
            // FIX BUG-04: Sin internet — el ViewModel hace fallback a getAllActivePoints,
            // que también fallará, y propagará el error al errorMessage del UiState.
            Log.w(TAG, "getNearbyPoints: sin conexión a internet", e)
            emptyList()
        } catch (e: HttpException) {
            Log.e(TAG, "getNearbyPoints: HTTP ${e.code()} — ${e.message()}", e)
            emptyList()
        } catch (e: SocketTimeoutException) {
            Log.w(TAG, "getNearbyPoints: timeout de red", e)
            emptyList()
        } catch (e: Exception) {
            Log.e(TAG, "getNearbyPoints: error inesperado", e)
            emptyList()
        }
    }

    override suspend fun getAllActivePoints(): List<RecyclingPoint> {
        return try {
            api.getAllActivePoints().map { it.toDomain() }
        } catch (e: UnknownHostException) {
            Log.w(TAG, "getAllActivePoints: sin conexión a internet", e)
            throw Exception("Sin conexión a internet. No se pudieron cargar los puntos de reciclaje.")
        } catch (e: HttpException) {
            Log.e(TAG, "getAllActivePoints: HTTP ${e.code()} — ${e.message()}", e)
            throw Exception("Error del servidor (${e.code()}) al cargar los puntos de reciclaje.")
        } catch (e: SocketTimeoutException) {
            Log.w(TAG, "getAllActivePoints: timeout de red", e)
            throw Exception("La carga del mapa tardó demasiado. Revisá tu conexión.")
        } catch (e: Exception) {
            Log.e(TAG, "getAllActivePoints: error inesperado", e)
            throw Exception("No se pudieron cargar los puntos de reciclaje. Intentá de nuevo.")
        }
    }
}
