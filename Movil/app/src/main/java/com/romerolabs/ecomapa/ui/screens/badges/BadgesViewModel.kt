package com.romerolabs.ecomapa.ui.screens.badges

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.romerolabs.ecomapa.data.local.GamificationStore
import com.romerolabs.ecomapa.data.repository.GamificationRepositoryImpl
import com.romerolabs.ecomapa.domain.model.Badge
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class BadgesUiState(
    val badges: List<Badge> = emptyList(),
    val totalPoints: Int = 0,
    val unlockedCount: Int = 0
)

class BadgesViewModel(application: Application) : AndroidViewModel(application) {

    private val gamificationRepository = GamificationRepositoryImpl(
        GamificationStore(application.applicationContext)
    )

    private val _uiState = MutableStateFlow(BadgesUiState())
    val uiState: StateFlow<BadgesUiState> = _uiState.asStateFlow()

    init {
        loadBadges()
    }

    private fun loadBadges() {
        viewModelScope.launch {
            val progress = gamificationRepository.getUserProgress()
            val unlockedIds = progress.unlockedBadgeIds

            val badges = Badge.catalog.map { badge ->
                badge.copy(isUnlocked = badge.id in unlockedIds)
            }

            _uiState.update {
                BadgesUiState(
                    badges = badges,
                    totalPoints = progress.totalPoints,
                    unlockedCount = unlockedIds.size
                )
            }
        }
    }
}
