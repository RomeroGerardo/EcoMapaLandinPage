package com.romerolabs.ecomapa.ui.screens.rewards

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.romerolabs.ecomapa.data.local.GamificationStore
import com.romerolabs.ecomapa.data.remote.NetworkModule
import com.romerolabs.ecomapa.data.repository.RewardRepositoryImpl
import com.romerolabs.ecomapa.domain.model.Reward
import com.romerolabs.ecomapa.domain.model.RewardClaim
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class RewardsUiState(
    val rewards: List<Reward> = emptyList(),
    val claimedCoupons: List<RewardClaim> = emptyList(),
    val totalPoints: Int = 0,
    val selectedTab: Int = 0, // 0: Recompensas, 1: Mis Cupones
    val isLoading: Boolean = false,
    val claimedCoupon: RewardClaim? = null,
    val errorMessage: String? = null
)

class RewardsViewModel(application: Application) : AndroidViewModel(application) {

    private val store = GamificationStore(application.applicationContext)
    private val rewardRepository = RewardRepositoryImpl(NetworkModule.supabaseApi, store)

    private val _uiState = MutableStateFlow(RewardsUiState())
    val uiState: StateFlow<RewardsUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    fun loadData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val points = store.getInt(GamificationStore.ECO_TOTAL_POINTS)
            val rewards = rewardRepository.getRewards()
            val claimed = rewardRepository.getClaimedCoupons()

            _uiState.update {
                it.copy(
                    rewards = rewards,
                    claimedCoupons = claimed,
                    totalPoints = points,
                    isLoading = false
                )
            }
        }
    }

    fun setTab(index: Int) {
        _uiState.update { it.copy(selectedTab = index) }
    }

    fun claimReward(reward: Reward) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val result = rewardRepository.claimReward(reward, "device_user_id")

            result.fold(
                onSuccess = { claim ->
                    val newPoints = store.getInt(GamificationStore.ECO_TOTAL_POINTS)
                    val updatedClaimed = rewardRepository.getClaimedCoupons()
                    _uiState.update {
                        it.copy(
                            claimedCoupon = claim,
                            claimedCoupons = updatedClaimed,
                            totalPoints = newPoints,
                            isLoading = false
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            errorMessage = error.message ?: "No se pudo realizar el canje",
                            isLoading = false
                        )
                    }
                }
            )
        }
    }

    fun dismissCouponDialog() {
        _uiState.update { it.copy(claimedCoupon = null) }
    }

    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
}
