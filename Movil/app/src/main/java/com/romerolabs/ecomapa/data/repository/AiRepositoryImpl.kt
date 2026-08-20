package com.romerolabs.ecomapa.data.repository

import com.romerolabs.ecomapa.data.remote.api.SupabaseApi
import com.romerolabs.ecomapa.data.remote.api.dto.ClassifyRequestDto
import com.romerolabs.ecomapa.domain.model.AiResponse
import com.romerolabs.ecomapa.domain.repository.AiRepository
import retrofit2.HttpException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

class AiRepositoryImpl(
    private val api: SupabaseApi
) : AiRepository {

    override suspend fun classify(
        message: String,
        userLat: Double,
        userLng: Double
    ): Result<AiResponse> {
        return try {
            val request = ClassifyRequestDto(
                message = message,
                userLat = userLat,
                userLng = userLng
            )
            val responseDto = api.classify(request)
            Result.success(responseDto.toDomain())
        } catch (e: HttpException) {
            // FIX BUG-04: Error HTTP con código específico (4xx / 5xx)
            val userMessage = when (e.code()) {
                401, 403 -> "Sin autorización para consultar la IA. Verificá la configuración."
                429       -> "Demasiadas consultas. Esperá un momento e intentá de nuevo."
                500, 502,
                503, 504  -> "El servidor de IA no está disponible ahora. Intentá en unos minutos."
                else      -> "Error del servidor (${e.code()}). Intentá de nuevo."
            }
            Result.failure(Exception(userMessage, e))
        } catch (e: SocketTimeoutException) {
            // FIX BUG-04: La Edge Function tardó más de 30 segundos
            Result.failure(Exception("La consulta tardó demasiado. Revisá tu conexión e intentá de nuevo.", e))
        } catch (e: UnknownHostException) {
            // FIX BUG-04: Sin conexión a internet
            Result.failure(Exception("Sin conexión a internet. Conectate a una red e intentá de nuevo.", e))
        } catch (e: Exception) {
            // Cualquier otro error inesperado
            Result.failure(Exception("No se pudo clasificar el residuo. Intentá de nuevo.", e))
        }
    }
}
