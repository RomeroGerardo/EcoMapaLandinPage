package com.romerolabs.ecomapa.data.remote

import com.romerolabs.ecomapa.BuildConfig
import com.romerolabs.ecomapa.data.remote.api.SupabaseApi
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Módulo de red singleton (sin framework de DI para simplificar el MVP).
 *
 * Configura OkHttp con interceptor de autenticación para Supabase
 * y crea la instancia de Retrofit apuntando a [BuildConfig.SUPABASE_URL].
 */
object NetworkModule {

    /** Timeout de red en segundos (igual que en Flutter: 30s). */
    private const val TIMEOUT_SECONDS = 30L

    /**
     * Interceptor que inyecta los headers de autenticación de Supabase
     * en cada request: `apikey` y `Authorization: Bearer {anon_key}`.
     */
    private val authInterceptor = Interceptor { chain ->
        val original = chain.request()
        val request = original.newBuilder()
            .header("apikey", BuildConfig.SUPABASE_ANON_KEY)
            .header("Authorization", "Bearer ${BuildConfig.SUPABASE_ANON_KEY}")
            .header("Content-Type", "application/json")
            .build()
        chain.proceed(request)
    }

    /** Logging interceptor para debug (solo en builds de debug). */
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = if (BuildConfig.DEBUG) {
            HttpLoggingInterceptor.Level.BODY
        } else {
            HttpLoggingInterceptor.Level.NONE
        }
    }

    /** Cliente OkHttp configurado con auth y timeouts. */
    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .readTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .writeTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .build()

    /** Instancia de Retrofit apuntando a la URL de Supabase. */
    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.SUPABASE_URL.trimEnd('/') + "/")
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    /** API de Supabase lista para usar. */
    val supabaseApi: SupabaseApi = retrofit.create(SupabaseApi::class.java)
}
