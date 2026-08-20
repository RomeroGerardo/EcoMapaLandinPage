package com.romerolabs.ecomapa.domain.repository

import com.romerolabs.ecomapa.domain.model.Reward
import com.romerolabs.ecomapa.domain.model.RewardClaim

interface RewardRepository {
    suspend fun getRewards(): List<Reward>
    suspend fun claimReward(reward: Reward, userId: String): Result<RewardClaim>
}
