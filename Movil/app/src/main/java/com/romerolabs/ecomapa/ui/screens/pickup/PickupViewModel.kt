package com.romerolabs.ecomapa.ui.screens.pickup

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.romerolabs.ecomapa.data.remote.NetworkModule
import com.romerolabs.ecomapa.data.repository.PickupRepositoryImpl
import com.romerolabs.ecomapa.domain.model.PickupRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class PickupUiState(
    val userName: String = "",
    val userPhone: String = "",
    val wasteType: String = "muebles",
    val estimatedVolume: String = "mediano",
    val address: String = "",
    val notes: String = "",
    val preferredTimeSlot: String = "manana",
    val latitude: Double = -31.4201,
    val longitude: Double = -64.1888,
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val errorMessage: String? = null
)

class PickupViewModel(application: Application) : AndroidViewModel(application) {

    private val pickupRepository = PickupRepositoryImpl(NetworkModule.supabaseApi)

    private val _uiState = MutableStateFlow(PickupUiState())
    val uiState: StateFlow<PickupUiState> = _uiState.asStateFlow()

    fun updateField(
        name: String? = null,
        phone: String? = null,
        wasteType: String? = null,
        volume: String? = null,
        address: String? = null,
        notes: String? = null,
        timeSlot: String? = null,
        lat: Double? = null,
        lng: Double? = null
    ) {
        _uiState.update { current ->
            current.copy(
                userName = name ?: current.userName,
                userPhone = phone ?: current.userPhone,
                wasteType = wasteType ?: current.wasteType,
                estimatedVolume = volume ?: current.estimatedVolume,
                address = address ?: current.address,
                notes = notes ?: current.notes,
                preferredTimeSlot = timeSlot ?: current.preferredTimeSlot,
                latitude = lat ?: current.latitude,
                longitude = lng ?: current.longitude
            )
        }
    }

    fun submitRequest() {
        val state = _uiState.value
        if (state.userName.isBlank() || state.userPhone.isBlank() || state.address.isBlank()) {
            _uiState.update { it.copy(errorMessage = "Completa tu nombre, teléfono y dirección.") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            val request = PickupRequest(
                userName = state.userName.trim(),
                userPhone = state.userPhone.trim(),
                wasteType = state.wasteType,
                estimatedVolume = state.estimatedVolume,
                notes = state.notes.ifBlank { null },
                address = state.address.trim(),
                latitude = state.latitude,
                longitude = state.longitude,
                preferredDate = "Mañana",
                preferredTimeSlot = state.preferredTimeSlot
            )

            val result = pickupRepository.requestPickup(request)

            result.fold(
                onSuccess = {
                    _uiState.update { it.copy(isLoading = false, isSuccess = true) }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "Error al solicitar retiro"
                        )
                    }
                }
            )
        }
    }

    fun resetSuccess() {
        _uiState.update { it.copy(isSuccess = false) }
    }

    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
}
