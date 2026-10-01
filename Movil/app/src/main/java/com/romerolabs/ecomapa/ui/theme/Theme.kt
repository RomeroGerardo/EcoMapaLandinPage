package com.romerolabs.ecomapa.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

/**
 * Tema principal de EcoMapa V2.1 (Material 3).
 * Soporta Modo Claro y Modo Oscuro nativo con estética GovTech Emerald & Slate.
 */

private val EcoLightColorScheme = lightColorScheme(
    primary = EmeraldPrimaryDark,
    onPrimary = SurfaceLight,
    primaryContainer = EmeraldLight,
    onPrimaryContainer = EmeraldPrimaryDeep,
    secondary = SecondaryBlue,
    onSecondary = SurfaceLight,
    secondaryContainer = Color(0xFFE0F2FE),
    onSecondaryContainer = Color(0xFF0369A1),
    tertiary = AccentYellow,
    error = DangerRed,
    background = BackgroundLight,
    onBackground = TextPrimaryLight,
    surface = SurfaceLight,
    onSurface = TextPrimaryLight,
    surfaceVariant = SurfaceLightElevated,
    onSurfaceVariant = TextSecondaryLight,
    outline = BorderLight
)

private val EcoDarkColorScheme = darkColorScheme(
    primary = EmeraldPrimary,
    onPrimary = BackgroundDark,
    primaryContainer = Color(0xFF064E3B),
    onPrimaryContainer = EmeraldLight,
    secondary = Color(0xFF38BDF8),
    onSecondary = BackgroundDark,
    secondaryContainer = Color(0xFF0C4A6E),
    onSecondaryContainer = Color(0xFFBAE6FD),
    tertiary = AccentYellow,
    error = DangerRed,
    background = BackgroundDark,
    onBackground = TextPrimaryDark,
    surface = SurfaceDark,
    onSurface = TextPrimaryDark,
    surfaceVariant = SurfaceDarkCard,
    onSurfaceVariant = TextSecondaryDark,
    outline = BorderDark
)

@Composable
fun EcoMapaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) EcoDarkColorScheme else EcoLightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = EcoTypography,
        content = content
    )
}
