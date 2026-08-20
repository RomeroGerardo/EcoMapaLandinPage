package com.romerolabs.ecomapa.data.repository

import com.romerolabs.ecomapa.data.local.GamificationStore
import com.romerolabs.ecomapa.data.remote.api.SupabaseApi
import com.romerolabs.ecomapa.data.remote.api.dto.CreateClaimDto
import com.romerolabs.ecomapa.domain.model.Reward
import com.romerolabs.ecomapa.domain.model.RewardClaim
import com.romerolabs.ecomapa.domain.repository.RewardRepository
import java.util.UUID

class RewardRepositoryImpl(
    private val api: SupabaseApi,
    private val store: GamificationStore
) : RewardRepository {

    override suspend fun getRewards(): List<Reward> {
        return try {
            api.getActiveRewards().map { it.toDomain() }
        } catch (e: Exception) {
            emptyList()
        }
    }

    override suspend fun claimReward(reward: Reward, userId: String): Result<RewardClaim> {
        return try {
            val currentPoints = store.getInt(GamificationStore.ECO_TOTAL_POINTS)
            if (currentPoints < reward.ecopointsCost) {
                return Result.failure(Exception("No tienes suficientes Ecopuntos (${currentPoints}/${reward.ecopointsCost})"))
            }

            // Generar código único de cupón
            val randomSuffix = UUID.randomUUID().toString().substring(0, 6).uppercase()
            val couponCode = "ECO-${reward.category.take(3).uppercase()}-$randomSuffix"

            val claimDto = CreateClaimDto(
                rewardId = reward.id,
                userId = userId,
                couponCode = couponCode,
                pointsSpent = reward.ecopointsCost,
                status = "activo"
            )

            val created = api.claimReward(claimDto)

            // Deducir puntos localmente en el DataStore
            store.setInt(GamificationStore.ECO_TOTAL_POINTS, currentPoints - reward.ecopointsCost)

            val claim = RewardClaim(
                id = created.firstOrNull()?.id ?: UUID.randomUUID().toString(),
                rewardId = reward.id,
                rewardTitle = reward.title,
                partnerName = reward.partnerName,
                couponCode = couponCode,
                status = "activo",
                pointsSpent = reward.ecopointsCost,
                claimedAt = "Hoy"
            )

            Result.success(claim)
        } catch (e: Exception) {
            Result.failure(Exception("Error al canjear cupón: ${e.message}", e))
        }
    }
}
