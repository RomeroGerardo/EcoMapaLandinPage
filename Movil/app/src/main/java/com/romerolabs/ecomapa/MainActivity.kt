package com.romerolabs.ecomapa

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.romerolabs.ecomapa.ui.navigation.EcoNavigation
import com.romerolabs.ecomapa.ui.theme.EcoMapaTheme

/**
 * Activity principal de EcoMapa.
 *
 * Single Activity architecture con Jetpack Compose.
 * Todo el contenido se renderiza dentro de [EcoMapaTheme] y [EcoNavigation].
 */
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            EcoMapaTheme {
                EcoNavigation()
            }
        }
    }
}
