package com.romerolabs.ecomapa.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

/**
 * Tema principal de EcoMapa (Material 3).
 * Réplica del lightTheme definido en theme.dart.
 */
private val EcoLightColorScheme = lightColorScheme(
    primary = PrimaryGreen,
    onPrimary = SurfaceLight,
    secondary = SecondaryBlue,
    onSecondary = SurfaceLight,
    tertiary = AccentYellow,
    error = DangerRed,
    background = BackgroundLight,
    onBackground = TextPrimary,
    surface = SurfaceLight,
    onSurface = TextPrimary,
    surfaceVariant = BackgroundLight,
    onSurfaceVariant = TextSecondary
)

@Composable
fun EcoMapaTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = EcoLightColorScheme,
        typography = EcoTypography,
        content = content
    )
}
