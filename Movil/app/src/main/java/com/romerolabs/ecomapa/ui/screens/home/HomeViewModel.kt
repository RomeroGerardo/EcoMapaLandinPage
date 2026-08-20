package com.romerolabs.ecomapa.ui.screens.home

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.romerolabs.ecomapa.data.local.GamificationStore
import com.romerolabs.ecomapa.data.remote.NetworkModule
import com.romerolabs.ecomapa.data.repository.AiRepositoryImpl
import com.romerolabs.ecomapa.data.repository.GamificationRepositoryImpl
import com.romerolabs.ecomapa.data.repository.MapRepositoryImpl
import com.romerolabs.ecomapa.domain.model.Badge
import com.romerolabs.ecomapa.domain.model.ChatMessage
import com.romerolabs.ecomapa.domain.model.RecyclingPoint
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.osmdroid.util.GeoPoint

data class HomeUiState(
    val recyclingPoints: List<RecyclingPoint> = emptyList(),
    val userLocation: GeoPoint? = null,
    val chatMessages: List<ChatMessage> = emptyList(),
    val chatInput: String = "",
    val isLoading: Boolean = false,
    val totalPoints: Int = 0,
    val unlockedBadgeIds: List<String> = emptyList(),
    val newBadgeUnlocked: Badge? = null,
    val centerOnPoint: GeoPoint? = null,
    val errorMessage: String? = null
)

class HomeViewModel(application: Application) : AndroidViewModel(application) {

    private val aiRepository = AiRepositoryImpl(NetworkModule.supabaseApi)
    private val mapRepository = MapRepositoryImpl(NetworkModule.supabaseApi)
    private val gamificationRepository = GamificationRepositoryImpl(
        GamificationStore(application.applicationContext)
    )

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    private var currentLat = -31.4201
    private var currentLng = -64.1888

    init {
        // MEJORA-01: Mensaje de bienvenida real como primer ChatMessage.
        // Al ser un ChatMessage real (no un placeholder estático), el scroll
        // automático de LazyColumn funciona desde el inicio y el historial
        // de conversación es correcto.
        _uiState.update {
            it.copy(
                chatMessages = listOf(
                    ChatMessage(
                        content = "¡Hola! Soy EcoAsistente 🌿\nCuéntame qué residuo querés reciclar y te ayudo a encontrar el contenedor correcto cerca tuyo.",
                        isUser = false
                    )
                )
            )
        }
        loadInitialData()
    }

    private fun loadInitialData() {
        viewModelScope.launch {
            try {
                val points = mapRepository.getNearbyPoints(currentLat, currentLng)
                val fallbackPoints = if (points.isEmpty()) {
                    mapRepository.getAllActivePoints()
                } else points

                val progress = gamificationRepository.getUserProgress()

                _uiState.update {
                    it.copy(
                        recyclingPoints = fallbackPoints,
                        totalPoints = progress.totalPoints,
                        unlockedBadgeIds = progress.unlockedBadgeIds
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    // FIX BUG-04: El mensaje ya viene descriptivo desde MapRepositoryImpl.
                    // Fallback genérico solo si e.message es null.
                    it.copy(errorMessage = e.message ?: "Error al cargar el mapa. Intentá de nuevo.")
                }
            }
        }
    }

    fun updateUserLocation(lat: Double, lng: Double) {
        currentLat = lat
        currentLng = lng
        _uiState.update {
            it.copy(userLocation = GeoPoint(lat, lng))
        }
        viewModelScope.launch {
            val points = mapRepository.getNearbyPoints(lat, lng)
            if (points.isNotEmpty()) {
                _uiState.update { it.copy(recyclingPoints = points) }
            }
        }
    }

    fun updateChatInput(text: String) {
        _uiState.update { it.copy(chatInput = text) }
    }

    fun sendMessage() {
        val text = _uiState.value.chatInput.trim()
        if (text.isBlank()) return

        val userMessage = ChatMessage(content = text, isUser = true)
        _uiState.update {
            it.copy(
                chatMessages = it.chatMessages + userMessage,
                chatInput = "",
                isLoading = true,
                errorMessage = null
            )
        }

        viewModelScope.launch {
            val result = aiRepository.classify(text, currentLat, currentLng)

            result.fold(
                onSuccess = { aiResponse ->
                    val aiMessage = ChatMessage(
                        content = aiResponse.friendlyMessage,
                        isUser = false,
                        aiResponse = aiResponse
                    )

                    val gamResult = gamificationRepository.processReward(aiResponse)

                    val centerPoint = aiResponse.suggestedPoint?.let {
                        if (it.latitude != 0.0 && it.longitude != 0.0) {
                            GeoPoint(it.latitude, it.longitude)
                        } else null
                    }

                    _uiState.update {
                        it.copy(
                            chatMessages = it.chatMessages + aiMessage,
                            isLoading = false,
                            totalPoints = gamResult.totalPoints,
                            centerOnPoint = centerPoint,
                            newBadgeUnlocked = gamResult.newBadges.firstOrNull()
                        )
                    }
                },
                onFailure = { error ->
                    val errorMessage = ChatMessage(
                        content = "Lo siento, no pude procesar tu consulta. Intenta de nuevo.",
                        isUser = false
                    )
                    _uiState.update {
                        it.copy(
                            chatMessages = it.chatMessages + errorMessage,
                            isLoading = false,
                            errorMessage = error.message
                        )
                    }
                }
            )
        }
    }

    fun dismissBadgeDialog() {
        _uiState.update { it.copy(newBadgeUnlocked = null) }
    }

    fun clearCenterPoint() {
        _uiState.update { it.copy(centerOnPoint = null) }
    }

    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
}
