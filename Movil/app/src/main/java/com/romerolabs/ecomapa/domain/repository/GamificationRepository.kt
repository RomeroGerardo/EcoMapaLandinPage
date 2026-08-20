package com.romerolabs.ecomapa.domain.repository

import com.romerolabs.ecomapa.domain.model.AiResponse
import com.romerolabs.ecomapa.domain.model.Badge
import com.romerolabs.ecomapa.domain.model.GamificationResult
import com.romerolabs.ecomapa.domain.model.UserProgress

/**
 * Contrato para el sistema de gamificación (Ecopuntos e Insignias).
 *
 * La persistencia se realiza con Jetpack DataStore (sin backend ni login).
 * Replica la lógica del GamificationService de Flutter.
 */
interface GamificationRepository {
    /** Obtiene el total acumulado de Ecopuntos. */
    suspend fun getTotalPoints(): Int

    /** Suma [points] al total y retorna el nuevo acumulado. */
    suspend fun addPoints(points: Int): Int

    /** Obtiene el número total de consultas realizadas. */
    suspend fun getQueriesCount(): Int

    /** Incrementa el contador de consultas en 1. */
    suspend fun incrementQueries()

    /** Obtiene los días de racha consecutivos. */
    suspend fun getStreakDays(): Int

    /** Actualiza la racha según la última consulta. */
    suspend fun updateStreak()

    /** Obtiene los IDs de las insignias desbloqueadas. */
    suspend fun getUnlockedBadgeIds(): List<String>

    /** Obtiene el progreso completo del usuario. */
    suspend fun getUserProgress(): UserProgress

    /**
     * Procesa la recompensa de una consulta de IA.
     *
     * Flujo (idéntico al GamificationService de Flutter):
     * 1. Incrementar consultas
     * 2. Actualizar racha
     * 3. Aplicar multiplicador (x1.5 si racha ≥ 3)
     * 4. Evaluar insignias nuevas
     * 5. Sumar puntos bonus de insignias
     * 6. Persistir total
     *
     * @param response Respuesta de la IA con ecopuntos base y tipo de residuo.
     * @return [GamificationResult] con puntos ganados, total y nuevas insignias.
     */
    suspend fun processReward(response: AiResponse): GamificationResult
}
