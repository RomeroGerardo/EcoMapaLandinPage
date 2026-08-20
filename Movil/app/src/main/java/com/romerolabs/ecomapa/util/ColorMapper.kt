package com.romerolabs.ecomapa.util

import androidx.compose.ui.graphics.Color
import com.romerolabs.ecomapa.ui.theme.ContainerColors

/**
 * Utilidad para mapear nombres de color de contenedor (DB) a colores.
 *
 * Réplica de color_mapper.dart del proyecto Flutter.
 *
 * Colores según tipo de contenedor (RFC §5.1):
 * - verde   → orgánico
 * - azul    → vidrio
 * - amarillo → plástico/metal
 * - rojo    → peligroso
 * - naranja → textil
 * - gris    → general
 */
object ColorMapper {

    /** Retorna el [Color] de Compose correspondiente al nombre del contenedor. */
    fun getContainerColor(colorName: String): Color {
        return ContainerColors[colorName.lowercase()] ?: Color(0xFF9E9E9E)
    }

    /**
     * Retorna el color como Int ARGB para uso con APIs de Android (osmdroid, etc).
     * Formato: 0xAARRGGBB
     */
    fun getContainerColorInt(colorName: String): Int {
        return when (colorName.lowercase()) {
            "verde" -> 0xFF4CAF50.toInt()
            "azul" -> 0xFF1565C0.toInt()
            "amarillo" -> 0xFFF9A825.toInt()
            "rojo" -> 0xFFD32F2F.toInt()
            "naranja" -> 0xFFFF9800.toInt()
            "gris" -> 0xFF757575.toInt()
            else -> 0xFF9E9E9E.toInt()
        }
    }
}
