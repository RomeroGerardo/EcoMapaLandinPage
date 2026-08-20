package com.romerolabs.ecomapa.domain.model

/**
 * Modelo de una recompensa o cupón de descuento B2B (Fase 2).
 */
data class Reward(
    val id: String,
    val title: String,
    val partnerName: String,
    val category: String,
    val description: String,
    val ecopointsCost: Int,
    val discountPercentage: Int?,
    val stock: Int,
    val isActive: Boolean = true
)

/**
 * Modelo de un cupón ya canjeado por el usuario.
 */
data class RewardClaim(
    val id: String,
    val rewardId: String,
    val rewardTitle: String,
    val partnerName: String,
    val couponCode: String,
    val status: String,
    val pointsSpent: Int,
    val claimedAt: String
)
