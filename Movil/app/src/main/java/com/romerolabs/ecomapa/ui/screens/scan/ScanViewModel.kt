package com.romerolabs.ecomapa.ui.screens.scan

import android.app.Application
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.ByteArrayOutputStream
import java.util.concurrent.TimeUnit

// ─── Modelo de datos del resultado ────────────────────────────────────────────

data class ClassifyImageResult(
    val action: String = "",               // "SOLICITAR_RETIRO" | "PUNTO_RECICLAJE"
    val itemDetectado: String = "",
    val categoria: String = "",
    val esVoluminoso: Boolean = false,
    val friendlyMessage: String = "",
    val instrucciones: String = "",
    val ecopointsEstimados: Int = 0,
    val suggestedPoint: SuggestedPointData? = null
)

data class SuggestedPointData(
    val id: String = "",
    val name: String = "",
    val type: String = "",
    val color: String = "",
    val address: String? = null,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val distanceKm: Double? = null
)

// ─── Estado de la UI ──────────────────────────────────────────────────────────

data class ScanUiState(
    val phase: ScanPhase = ScanPhase.IDLE,
    val capturedImageUri: Uri? = null,
    val result: ClassifyImageResult? = null,
    val errorMessage: String? = null
)

enum class ScanPhase {
    IDLE,       // Pantalla inicial — botón "Sacar foto"
    LOADING,    // Foto tomada, analizando con IA
    RESULT,     // Resultado listo para mostrar
    ERROR       // Algo falló
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

class ScanViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(ScanUiState())
    val uiState: StateFlow<ScanUiState> = _uiState.asStateFlow()

    // OkHttp con timeout generoso para el análisis de imagen
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(40, TimeUnit.SECONDS)
        .build()

    // URL base de Supabase: tomada desde BuildConfig (definida en local.properties)
    private val supabaseUrl: String by lazy {
        try {
            val buildConfig = Class.forName("com.romerolabs.ecomapa.BuildConfig")
            buildConfig.getField("SUPABASE_URL").get(null) as String
        } catch (_: Exception) {
            "https://uuagrhbdgyvopezoakia.supabase.co"
        }
    }

    /**
     * Llamado cuando el sistema de cámara devuelve una foto exitosamente.
     * Acepta opcionalmente las coordenadas GPS actuales del usuario para sugerir
     * el contenedor más cercano en tiempo real (ej. Matorrales, Villa del Rosario).
     */
    fun onPhotoCaptured(uri: Uri, userLat: Double? = null, userLng: Double? = null) {
        _uiState.value = ScanUiState(phase = ScanPhase.LOADING, capturedImageUri = uri)
        classifyImage(uri, userLat, userLng)
    }

    /**
     * Llamado si la cámara fue cancelada o falló.
     */
    fun onPhotoFailed() {
        _uiState.value = ScanUiState(
            phase = ScanPhase.ERROR,
            errorMessage = "No se pudo capturar la foto. Intentá de nuevo 📷"
        )
    }

    /**
     * Vuelve al estado inicial para escanear otro objeto.
     */
    fun resetScan() {
        _uiState.value = ScanUiState()
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }

    // ─── Lógica privada ───────────────────────────────────────────────────────

    private fun classifyImage(uri: Uri, userLat: Double?, userLng: Double?) {
        viewModelScope.launch {
            try {
                // 1. Comprimir la imagen a Base64 en un hilo de I/O
                val base64 = withContext(Dispatchers.IO) {
                    compressAndEncodeImage(getApplication(), uri)
                }

                // 2. Llamar a la Edge Function en un hilo de I/O
                val result = withContext(Dispatchers.IO) {
                    callClassifyImageEdgeFunction(base64, userLat, userLng)
                }

                _uiState.value = ScanUiState(
                    phase = ScanPhase.RESULT,
                    capturedImageUri = uri,
                    result = result
                )

            } catch (e: Exception) {
                _uiState.value = ScanUiState(
                    phase = ScanPhase.ERROR,
                    capturedImageUri = uri,
                    errorMessage = "Ups, no pude analizar la foto 😅 Revisá tu conexión y volvé a intentarlo."
                )
            }
        }
    }

    /**
     * Comprime la imagen al máximo 800px y la codifica en Base64 JPEG.
     * Típicamente el resultado pesa menos de 80 KB, ideal para enviar a la API.
     */
    private fun compressAndEncodeImage(context: Context, uri: Uri): String {
        val inputStream = context.contentResolver.openInputStream(uri)
            ?: throw Exception("No se pudo abrir la imagen")
        val original = BitmapFactory.decodeStream(inputStream)
        inputStream.close()

        // Escalar al máximo 800px en el lado más largo
        val maxDim = 800
        val scaled = if (original.width > maxDim || original.height > maxDim) {
            val scale = maxDim.toFloat() / maxOf(original.width, original.height)
            Bitmap.createScaledBitmap(
                original,
                (original.width * scale).toInt(),
                (original.height * scale).toInt(),
                true
            )
        } else original

        val outputStream = ByteArrayOutputStream()
        scaled.compress(Bitmap.CompressFormat.JPEG, 78, outputStream)
        return Base64.encodeToString(outputStream.toByteArray(), Base64.NO_WRAP)
    }

    /**
     * Llama a la Supabase Edge Function `classify-image` y parsea el resultado.
     */
    private fun callClassifyImageEdgeFunction(
        base64: String,
        userLat: Double?,
        userLng: Double?
    ): ClassifyImageResult {
        val requestBody = JsonObject().apply {
            addProperty("image_base64", base64)
            if (userLat != null && userLng != null) {
                addProperty("user_lat", userLat)
                addProperty("user_lng", userLng)
            }
        }

        val body = requestBody.toString()
            .toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("$supabaseUrl/functions/v1/classify-image")
            .post(body)
            .addHeader("Content-Type", "application/json")
            .build()

        val response = httpClient.newCall(request).execute()
        val bodyStr = response.body?.string() ?: throw Exception("Respuesta vacía del servidor")

        if (!response.isSuccessful) {
            throw Exception("Error del servidor: ${response.code}")
        }

        // Parsear con Gson de forma manual para no necesitar nuevas dependencias
        val json = com.google.gson.JsonParser.parseString(bodyStr).asJsonObject

        val suggestedPoint = json.getAsJsonObject("suggested_point")?.let { p ->
            SuggestedPointData(
                id = p.get("id")?.asString ?: "",
                name = p.get("name")?.asString ?: "",
                type = p.get("type")?.asString ?: "",
                color = p.get("color")?.asString ?: "",
                address = p.get("address")?.asString,
                latitude = p.get("latitude")?.asDouble ?: 0.0,
                longitude = p.get("longitude")?.asDouble ?: 0.0,
                distanceKm = p.get("distance_km")?.asDouble
            )
        }

        return ClassifyImageResult(
            action = json.get("action")?.asString ?: "PUNTO_RECICLAJE",
            itemDetectado = json.get("item_detectado")?.asString ?: "Residuo detectado",
            categoria = json.get("categoria")?.asString ?: "",
            esVoluminoso = json.get("es_voluminoso")?.asBoolean ?: false,
            friendlyMessage = json.get("friendly_message")?.asString ?: "",
            instrucciones = json.get("instrucciones")?.asString ?: "",
            ecopointsEstimados = json.get("ecopoints_estimados")?.asInt ?: 20,
            suggestedPoint = suggestedPoint
        )
    }
}
