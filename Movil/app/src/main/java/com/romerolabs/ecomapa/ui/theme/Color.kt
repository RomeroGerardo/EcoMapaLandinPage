package com.romerolabs.ecomapa.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * Paleta de colores del Design System de EcoMapa V2.1 (GovTech Emerald & Slate).
 * Alineada con las consolas web de SuperAdmin y Portal Municipal.
 */

// ── Paleta Principal GovTech Emerald ──
val EmeraldPrimary = Color(0xFF10B981)       // Emerald 500
val EmeraldPrimaryDark = Color(0xFF059669)   // Emerald 600
val EmeraldPrimaryDeep = Color(0xFF047857)   // Emerald 700
val EmeraldLight = Color(0xFFD1FAE5)         // Emerald 100
val EmeraldGlow = Color(0x3310B981)          // Emerald 20% alpha

// ── Compatibilidad con versiones previas ──
val PrimaryGreen = EmeraldPrimaryDark
val SecondaryBlue = Color(0xFF0284C7)        // Sky 600
val AccentYellow = Color(0xFFF59E0B)         // Amber 500
val DangerRed = Color(0xFFEF4444)            // Rose/Red 500
val TextileOrange = Color(0xFFF97316)        // Orange 500
val NeutralGray = Color(0xFF64748B)          // Slate 500

// ── Modo Claro (GovTech Light) ──
val BackgroundLight = Color(0xFFF8FAFC)      // Slate 50
val SurfaceLight = Color(0xFFFFFFFF)         // Pure White
val SurfaceLightCard = Color(0xFFFFFFFF)
val SurfaceLightElevated = Color(0xFFF1F5F9) // Slate 100
val BorderLight = Color(0xFFE2E8F0)          // Slate 200
val TextPrimaryLight = Color(0xFF0F172A)     // Slate 900
val TextSecondaryLight = Color(0xFF64748B)   // Slate 500

// ── Modo Oscuro (GovTech Slate Dark) ──
val BackgroundDark = Color(0xFF0B1120)       // Slate 950
val SurfaceDark = Color(0xFF0F172A)          // Slate 900
val SurfaceDarkCard = Color(0xFF1E293B)      // Slate 800
val SurfaceDarkElevated = Color(0xFF334155)  // Slate 700
val BorderDark = Color(0xFF334155)           // Slate 700
val TextPrimaryDark = Color(0xFFF8FAFC)      // Slate 50
val TextSecondaryDark = Color(0xFF94A3B8)    // Slate 400

// ── Compatibilidad con texto ──
val TextPrimary = TextPrimaryLight
val TextSecondary = TextSecondaryLight

// ── Mapa de colores de contenedor para marcadores y etiquetas ──
val ContainerColors: Map<String, Color> = mapOf(
    "verde" to Color(0xFF10B981),     // Orgánicos / Compostables
    "azul" to Color(0xFF0284C7),      // Papel / Cartón / Vidrio
    "amarillo" to Color(0xFFF59E0B),  // Plásticos / Metales / Latas
    "rojo" to Color(0xFFEF4444),      // Peligrosos / RAEE / Baterías
    "naranja" to Color(0xFFF97316),   // Textil / Ropa
    "gris" to Color(0xFF64748B)       // Resto / General
)
