package com.romerolabs.ecomapa.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * Paleta de colores del Design System de EcoMapa.
 * Réplica exacta de theme.dart del proyecto Flutter.
 */

// ── Paleta principal ──
val PrimaryGreen = Color(0xFF2E7D32)
val SecondaryBlue = Color(0xFF1565C0)
val AccentYellow = Color(0xFFF9A825)
val DangerRed = Color(0xFFD32F2F)
val TextileOrange = Color(0xFFFF9800)
val NeutralGray = Color(0xFF757575)

// ── Fondos y superficies ──
val BackgroundLight = Color(0xFFF5F9F5)
val SurfaceLight = Color(0xFFFFFFFF)

// ── Texto ──
val TextPrimary = Color(0xFF1B1B1B)
val TextSecondary = Color(0xFF5F6368)

// ── Mapa de colores de contenedor ──
// Mapea nombres de color de la DB a Color de Compose.
// verde → orgánico, azul → vidrio, amarillo → plástico/metal,
// rojo → peligroso, naranja → textil, gris → general
val ContainerColors: Map<String, Color> = mapOf(
    "verde" to Color(0xFF4CAF50),
    "azul" to SecondaryBlue,
    "amarillo" to AccentYellow,
    "rojo" to DangerRed,
    "naranja" to TextileOrange,
    "gris" to NeutralGray
)
