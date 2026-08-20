package com.romerolabs.ecomapa.domain.repository

import com.romerolabs.ecomapa.domain.model.RecyclingPoint

/**
 * Contrato para la obtención de puntos de reciclaje desde Supabase.
 *
 * Soporta consultas por proximidad (RPC `get_nearby_points`)
 * y consulta directa de todos los puntos activos.
 */
interface MapRepository {
    /**
     * Obtiene puntos de reciclaje cercanos a las coordenadas dadas.
     *
     * @param lat Latitud del usuario.
     * @param lng Longitud del usuario.
     * @param radiusKm Radio de búsqueda en kilómetros (default: 25 km).
     * @return Lista de [RecyclingPoint] ordenados por distancia.
     */
    suspend fun getNearbyPoints(
        lat: Double,
        lng: Double,
        radiusKm: Double = 25.0
    ): List<RecyclingPoint>

    /**
     * Obtiene todos los puntos de reciclaje activos y aprobados.
     *
     * @return Lista de [RecyclingPoint].
     */
    suspend fun getAllActivePoints(): List<RecyclingPoint>
}
