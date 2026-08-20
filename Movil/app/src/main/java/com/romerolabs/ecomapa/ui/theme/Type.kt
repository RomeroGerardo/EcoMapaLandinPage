package com.romerolabs.ecomapa.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * Tipografía del Design System de EcoMapa.
 *
 * Usa la fuente por defecto del sistema (sans-serif) con la escala
 * tipográfica replicada de theme.dart del Flutter original.
 * En futuras iteraciones se puede reemplazar por Poppins bundled.
 */
val EcoFontFamily = FontFamily.SansSerif

val EcoTypography = Typography(
    displayLarge = TextStyle(
        fontFamily = EcoFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp,
        color = TextPrimary
    ),
    headlineMedium = TextStyle(
        fontFamily = EcoFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 24.sp,
        color = TextPrimary
    ),
    titleLarge = TextStyle(
        fontFamily = EcoFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 20.sp,
        color = TextPrimary
    ),
    titleMedium = TextStyle(
        fontFamily = EcoFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp,
        color = TextPrimary
    ),
    bodyLarge = TextStyle(
        fontFamily = EcoFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        color = TextPrimary
    ),
    bodyMedium = TextStyle(
        fontFamily = EcoFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        color = TextSecondary
    ),
    labelLarge = TextStyle(
        fontFamily = EcoFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        color = TextPrimary
    )
)
