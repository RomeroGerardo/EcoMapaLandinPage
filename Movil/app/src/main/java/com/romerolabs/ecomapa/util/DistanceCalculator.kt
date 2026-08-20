package com.romerolabs.ecomapa.util

import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Calculadora de distancia entre coordenadas geográficas.
 *
 * Réplica de distance_calculator.dart del proyecto Flutter.
 * Usa la fórmula de Haversine para calcular distancia en km.
 */
object DistanceCalculator {

    private const val EARTH_RADIUS_KM = 6371.0

    /**
     * Calcula la distancia en kilómetros entre dos puntos geográficos
     * usando la fórmula de Haversine.
     *
     * @param lat1 Latitud del primer punto.
     * @param lng1 Longitud del primer punto.
     * @param lat2 Latitud del segundo punto.
     * @param lng2 Longitud del segundo punto.
     * @return Distancia en kilómetros.
     */
    fun haversineDistance(
        lat1: Double,
        lng1: Double,
        lat2: Double,
        lng2: Double
    ): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLng = Math.toRadians(lng2 - lng1)

        val a = sin(dLat / 2) * sin(dLat / 2) +
                cos(Math.toRadians(lat1)) *
                cos(Math.toRadians(lat2)) *
                sin(dLng / 2) * sin(dLng / 2)

        val c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return EARTH_RADIUS_KM * c
    }
}
