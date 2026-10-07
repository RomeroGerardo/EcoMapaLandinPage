package com.romerolabs.ecomapa.util

import androidx.compose.ui.graphics.Color
import com.romerolabs.ecomapa.R
import com.romerolabs.ecomapa.ui.theme.ContainerColors

/**
 * Utilidad para mapear nombres y códigos de color de contenedor a colores e iconos.
 */
object ColorMapper {

    /** Retorna el [Color] de Compose correspondiente al nombre o código del contenedor. */
    fun getContainerColor(colorName: String): Color {
        val lower = colorName.lowercase().trim()
        ContainerColors[lower]?.let { return it }

        if (lower.startsWith("#")) {
            return try {
                Color(android.graphics.Color.parseColor(lower))
            } catch (_: Exception) {
                Color(0xFF9E9E9E)
            }
        }
        return Color(0xFF9E9E9E)
    }

    /**
     * Retorna el color como Int ARGB para uso con APIs de Android (osmdroid, etc).
     * Formato: 0xAARRGGBB
     */
    fun getContainerColorInt(colorName: String): Int {
        val lower = colorName.lowercase().trim()
        return when (lower) {
            "verde" -> 0xFF10B981.toInt()
            "azul" -> 0xFF0284C7.toInt()
            "amarillo" -> 0xFFF59E0B.toInt()
            "rojo" -> 0xFFEF4444.toInt()
            "naranja" -> 0xFFF97316.toInt()
            "gris" -> 0xFF64748B.toInt()
            else -> {
                if (lower.startsWith("#")) {
                    try {
                        android.graphics.Color.parseColor(lower)
                    } catch (_: Exception) {
                        0xFF9E9E9E.toInt()
                    }
                } else {
                    0xFF9E9E9E.toInt()
                }
            }
        }
    }

    /**
     * Retorna el emoji representativo del contenedor según su tipo y color.
     */
    fun getContainerEmoji(type: String, color: String): String {
        val t = type.lowercase()
        val c = color.lowercase()
        return when {
            t.contains("electronico") || t.contains("raee") -> "🔌"
            t.contains("plastico") || c == "amarillo" -> "🧴"
            t.contains("carton") || t.contains("papel") || c == "azul" -> "📦"
            t.contains("vidrio") -> "🍾"
            t.contains("peligroso") || t.contains("farmacia") || c == "rojo" -> "🔋"
            t.contains("organico") -> "🌱"
            t.contains("textil") || c == "naranja" -> "👕"
            else -> "♻️"
        }
    }

    /**
     * Retorna el texto/etiqueta en letras legibles para mostrar en el mapa (ej: "PLÁSTICOS", "CARTÓN").
     */
    fun getContainerTypeLabel(type: String, color: String): String {
        val t = type.lowercase()
        val c = color.lowercase()
        return when {
            t.contains("electronico") || t.contains("raee") -> "ELECTRÓNICOS"
            t.contains("peligroso") || t.contains("farmacia") || t.contains("pila") || c == "rojo" -> "PILAS / RAEE"
            t.contains("carton") || t.contains("papel") || c == "azul" -> "CARTÓN / PAPEL"
            t.contains("vidrio") -> "VIDRIO"
            t.contains("plastico") || c == "amarillo" -> "PLÁSTICOS"
            t.contains("organico") -> "ORGÁNICO"
            t.contains("textil") || c == "naranja" -> "TEXTIL"
            else -> "PUNTO VERDE"
        }
    }

    /**
     * Retorna el recurso drawable de la imagen representativa del contenedor.
     */
    fun getContainerDrawableRes(type: String, color: String): Int {
        val t = type.lowercase()
        val c = color.lowercase()
        return when {
            t.contains("electronico") || t.contains("raee") -> R.drawable.contenedor_rojo_pilas
            t.contains("plastico") || c == "amarillo" -> R.drawable.contenedor_amarillo_plastico
            t.contains("carton") || t.contains("papel") || c == "azul" -> R.drawable.contenedor_azul_carton
            t.contains("vidrio") || (c == "verde" && !t.contains("organico")) -> R.drawable.contenedor_verde_vidrio
            t.contains("peligroso") || t.contains("farmacia") || c == "rojo" -> R.drawable.contenedor_rojo_pilas
            else -> R.drawable.contenedor_amarillo_plastico
        }
    }
}
