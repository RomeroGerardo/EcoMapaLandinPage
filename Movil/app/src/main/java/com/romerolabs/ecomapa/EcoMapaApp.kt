package com.romerolabs.ecomapa

import android.app.Application
import org.osmdroid.config.Configuration

/**
 * Clase Application de EcoMapa.
 *
 * Inicializa la configuración de osmdroid al arrancar la app:
 * - User agent para cumplir con la política de uso de tiles OSM.
 * - Directorio de cache para los tiles del mapa.
 */
class EcoMapaApp : Application() {

    override fun onCreate() {
        super.onCreate()

        // Configurar osmdroid
        val osmConfig = Configuration.getInstance()
        osmConfig.userAgentValue = packageName
        osmConfig.osmdroidBasePath = filesDir
        osmConfig.osmdroidTileCache = cacheDir
    }
}
