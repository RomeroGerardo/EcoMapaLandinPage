package com.romerolabs.ecomapa.domain.model

/**
 * Modelo de un punto de reciclaje obtenido desde Supabase.
 *
 * Corresponde a la tabla `recycling_points` del RFC §5.1 y extensiones Fase 2.
 * Incluye campos para puntos públicos, centros privados de compra y puntos oficiales REP.
 */
data class RecyclingPoint(
    /** Identificador UUID del punto. */
    val id: String,
    /** Nombre descriptivo del punto de reciclaje. */
    val name: String,
    /** Tipo de contenedor (ej: 'organico', 'vidrio', 'peligroso', 'centro_privado', 'rep_oficial'). */
    val type: String,
    /** Color visual del contenedor ('verde', 'azul', 'amarillo', 'rojo', 'naranja', 'gris'). */
    val color: String,
    /** Coordenada latitud. */
    val latitude: Double,
    /** Coordenada longitud. */
    val longitude: Double,
    /** Dirección legible (opcional). */
    val address: String? = null,
    /** Distancia en kilómetros desde el usuario (disponible en respuesta RPC). */
    val distanceKm: Double? = null,
    /** Indica si es un centro privado o cooperativa que compra materiales. */
    val isPrivateFacility: Boolean = false,
    /** Detalle de precios pagados por kilo de material (ej. "$150/kg aluminio"). */
    val pricePerKgDetail: String? = null,
    /** Nombre de la marca oficial REP asignada (ej. "Duracell", "Samsung"). */
    val producerName: String? = null
)
