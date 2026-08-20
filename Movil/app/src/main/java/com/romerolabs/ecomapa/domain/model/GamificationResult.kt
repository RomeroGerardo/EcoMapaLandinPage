package com.romerolabs.ecomapa.domain.model

/**
 * Resultado del procesamiento de recompensa de gamificación.
 *
 * Devuelto por [GamificationRepository.processReward] con los puntos
 * ganados, total actualizado e insignias nuevas desbloqueadas.
 */
data class GamificationResult(
    /** Puntos ganados en esta consulta (incluyendo bonus de insignias). */
    val pointsEarned: Int,
    /** Total acumulado de Ecopuntos tras esta consulta. */
    val totalPoints: Int,
    /** Lista de insignias nuevas desbloqueadas en esta consulta. */
    val newBadges: List<Badge>
)
