package com.romerolabs.ecomapa.data.remote.api.dto

import com.google.gson.annotations.SerializedName
import com.romerolabs.ecomapa.domain.model.Reward
import com.romerolabs.ecomapa.domain.model.RewardClaim

data class RewardDto(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("partner_name") val partnerName: String,
    @SerializedName("category") val category: String,
    @SerializedName("description") val description: String,
    @SerializedName("ecopoints_cost") val ecopointsCost: Int,
    @SerializedName("discount_percentage") val discountPercentage: Int? = null,
    @SerializedName("stock") val stock: Int = 100,
    @SerializedName("is_active") val isActive: Boolean = true
) {
    fun toDomain(): Reward = Reward(
        id = id,
        title = title,
        partnerName = partnerName,
        category = category,
        description = description,
        ecopointsCost = ecopointsCost,
        discountPercentage = discountPercentage,
        stock = stock,
        isActive = isActive
    )
}

data class CreateClaimDto(
    @SerializedName("reward_id") val rewardId: String,
    @SerializedName("user_id") val userId: String,
    @SerializedName("coupon_code") val couponCode: String,
    @SerializedName("points_spent") val pointsSpent: Int,
    @SerializedName("status") val status: String = "activo"
)

data class RewardClaimDto(
    @SerializedName("id") val id: String,
    @SerializedName("reward_id") val rewardId: String,
    @SerializedName("coupon_code") val couponCode: String,
    @SerializedName("status") val status: String,
    @SerializedName("points_spent") val pointsSpent: Int,
    @SerializedName("claimed_at") val claimedAt: String
)
