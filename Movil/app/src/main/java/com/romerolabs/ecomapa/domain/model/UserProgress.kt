package com.romerolabs.ecomapa.domain.model

import java.time.Instant

/**
 * Modelo del progreso del usuario en el sistema de gamificación.
 *
 * Almacena el estado actual de puntos, consultas, racha e insignias.
 * Los datos se persisten en Jetpack DataStore.
 */
data class UserProgress(
    /** Total acumulado de Ecopuntos. */
    val totalPoints: Int = 0,
    /** Número total de consultas realizadas al asistente IA. */
    val queriesCount: Int = 0,
    /** Lista de IDs de insignias desbloqueadas. */
    val unlockedBadgeIds: List<String> = emptyList(),
    /** Fecha/hora de la última consulta (para cálculo de racha). */
    val lastQueryDate: Instant? = null,
    /** Días consecutivos usando la app. */
    val streakDays: Int = 0
)
