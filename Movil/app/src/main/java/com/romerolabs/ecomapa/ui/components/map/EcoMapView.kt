package com.romerolabs.ecomapa.ui.components.map

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Typeface
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.graphics.drawable.GradientDrawable
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import com.romerolabs.ecomapa.domain.model.RecyclingPoint
import com.romerolabs.ecomapa.util.ColorMapper
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.FolderOverlay

/**
 * Wrapper Compose para osmdroid MapView.
 *
 * Renderiza el mapa OpenStreetMap con marcadores de colores
 * según el tipo de contenedor de reciclaje.
 *
 * FIX BUG-01: Se usan dos FolderOverlay separados — uno para el marcador
 * del usuario y otro para los puntos de reciclaje. Al actualizar los puntos
 * se limpia solo el folder de puntos, preservando el marcador del usuario.
 * Esto elimina la condición de carrera donde ambos LaunchedEffect competían
 * por limpiar y agregar overlays al mismo tiempo.
 *
 * @param recyclingPoints Lista de puntos a mostrar como marcadores.
 * @param userLocation Ubicación del usuario (puede ser null).
 * @param centerOnPoint Punto para centrar el mapa (desde respuesta IA).
 * @param modifier Modifier de Compose.
 */
@Composable
fun EcoMapView(
    recyclingPoints: List<RecyclingPoint>,
    userLocation: GeoPoint?,
    centerOnPoint: GeoPoint? = null,
    defaultCenter: GeoPoint = GeoPoint(-31.4201, -64.1888), // Córdoba, Argentina
    defaultZoom: Double = 14.0,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    // FIX BUG-01: Dos folders de overlays separados y persistentes.
    // userFolder: solo el marcador del usuario. Se actualiza independientemente.
    // pointsFolder: todos los puntos de reciclaje. Se limpia al recibir nuevos puntos.
    val userFolder = remember { FolderOverlay() }
    val pointsFolder = remember { FolderOverlay() }

    val mapView = remember {
        MapView(context).apply {
            setTileSource(TileSourceFactory.MAPNIK)
            setMultiTouchControls(true)
            controller.setZoom(defaultZoom)
            controller.setCenter(userLocation ?: defaultCenter)
            // Agregar los folders en orden: primero puntos, encima el usuario
            overlays.add(pointsFolder)
            overlays.add(userFolder)
        }
    }

    // FIX BUG-01: LaunchedEffect SOLO para el marcador del usuario.
    // Opera sobre userFolder exclusivamente — nunca toca pointsFolder.
    LaunchedEffect(userLocation) {
        userFolder.items.clear()
        if (userLocation != null) {
            val userMarker = Marker(mapView).apply {
                position = userLocation
                setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                title = "Mi ubicación"
                val drawable = GradientDrawable().apply {
                    shape = GradientDrawable.OVAL
                    setSize(40, 40)
                    setColor(0xFF1565C0.toInt())
                    setStroke(4, 0xFFFFFFFF.toInt())
                }
                icon = drawable
            }
            userFolder.add(userMarker)
        }
        mapView.invalidate()
    }

    // FIX BUG-01: LaunchedEffect SOLO para los puntos de reciclaje.
    // Opera sobre pointsFolder exclusivamente — nunca toca userFolder.
    LaunchedEffect(recyclingPoints) {
        pointsFolder.items.clear()
        for (point in recyclingPoints) {
            val marker = Marker(mapView).apply {
                position = GeoPoint(point.latitude, point.longitude)
                setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                title = point.name
                snippet = buildString {
                    if (point.isPrivateFacility && point.pricePerKgDetail != null) {
                        append("🏢 Compra material: ${point.pricePerKgDetail}\n")
                    } else if (point.producerName != null) {
                        append("⭐ Punto Oficial REP: ${point.producerName}\n")
                    } else {
                        append(point.type.replaceFirstChar { it.uppercase() })
                    }
                    if (point.address != null) append(" — ${point.address}")
                    if (point.distanceKm != null) append(" (${point.distanceKm} km)")
                }
                val colorInt = ColorMapper.getContainerColorInt(point.color)
                val emoji = ColorMapper.getContainerEmoji(point.type, point.color)
                val label = ColorMapper.getContainerTypeLabel(point.type, point.color)
                icon = createContainerMarkerIcon(context, colorInt, emoji, label)

                setOnMarkerClickListener { _, _ ->
                    val uri = android.net.Uri.parse("google.navigation:q=${point.latitude},${point.longitude}")
                    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, uri)
                    intent.setPackage("com.google.android.apps.maps")
                    try {
                        context.startActivity(intent)
                    } catch (e: Exception) {
                        val fallbackUri = android.net.Uri.parse("geo:${point.latitude},${point.longitude}?q=${point.latitude},${point.longitude}")
                        val fallbackIntent = android.content.Intent(android.content.Intent.ACTION_VIEW, fallbackUri)
                        context.startActivity(fallbackIntent)
                    }
                    true
                }
            }
            pointsFolder.add(marker)
        }
        mapView.invalidate()
    }

    // Centrar en punto sugerido por la IA
    LaunchedEffect(centerOnPoint) {
        if (centerOnPoint != null) {
            mapView.controller.animateTo(centerOnPoint, 16.0, 1000L)
        }
    }

    // Centrar en el usuario la primera vez que llega su ubicación
    var hasCenteredOnUser by remember { mutableStateOf(false) }
    LaunchedEffect(userLocation) {
        if (userLocation != null && !hasCenteredOnUser) {
            mapView.controller.animateTo(userLocation, 15.0, 1000L)
            hasCenteredOnUser = true
        }
    }

    // Lifecycle management
    DisposableEffect(Unit) {
        mapView.onResume()
        onDispose {
            mapView.onPause()
        }
    }

    AndroidView(
        factory = { mapView },
        modifier = modifier
    )
}

/**
 * Genera un pin visual personalizado para el contenedor de reciclaje:
 * - Pastilla superior oscura con borde de color y texto en letras mayúsculas con el tipo de desecho (PLÁSTICOS, VIDRIO, etc.)
 * - Pin circular con marco blanco protector y color oficial del contenedor (amarillo, azul, verde, rojo)
 * - Emoji / logo representativo del residuo en el centro (botella, cartón, vidrio, pila, electrónica)
 * - Punta inferior orientada exactamente a la coordenada GPS
 */
private fun createContainerMarkerIcon(
    context: Context,
    colorInt: Int,
    emoji: String,
    label: String
): Drawable {
    val density = context.resources.displayMetrics.density

    // Configuración del texto de la etiqueta (letras legibles en el mapa)
    val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = android.graphics.Color.WHITE
        textSize = 9.5f * density
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        textAlign = Paint.Align.CENTER
    }

    val textWidth = textPaint.measureText(label)
    val pillPaddingH = 7f * density
    val pillWidth = textWidth + (pillPaddingH * 2)
    val pillHeight = 15f * density

    // Dimensiones del pin circular
    val pinRadius = 14f * density
    val pinDiameter = pinRadius * 2
    val tipHeight = 8f * density
    val pinSpacing = 2f * density

    val totalWidth = maxOf(pillWidth + (4 * density), pinDiameter + (8 * density)).toInt()
    val totalHeight = (pillHeight + pinSpacing + pinDiameter + tipHeight + (3 * density)).toInt()

    val bitmap = Bitmap.createBitmap(totalWidth, totalHeight, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)

    val centerX = totalWidth / 2f
    val paint = Paint(Paint.ANTI_ALIAS_FLAG)

    // 1. Dibujar la pastilla con el nombre del desecho (en la parte superior)
    val pillLeft = centerX - (pillWidth / 2f)
    val pillTop = 2f * density
    val pillRight = centerX + (pillWidth / 2f)
    val pillBottom = pillTop + pillHeight
    val pillRadius = 4f * density
    val pillRect = RectF(pillLeft, pillTop, pillRight, pillBottom)

    // Sombra sutil de la pastilla
    paint.color = 0x40000000
    canvas.drawRoundRect(RectF(pillLeft, pillTop + 1f * density, pillRight, pillBottom + 1f * density), pillRadius, pillRadius, paint)

    // Fondo negro azulado para alta visibilidad y contraste contra cualquier fondo
    paint.color = 0xF0111827.toInt()
    paint.style = Paint.Style.FILL
    canvas.drawRoundRect(pillRect, pillRadius, pillRadius, paint)

    // Borde de la pastilla con el color del contenedor
    paint.color = colorInt
    paint.style = Paint.Style.STROKE
    paint.strokeWidth = 1.5f * density
    canvas.drawRoundRect(pillRect, pillRadius, pillRadius, paint)
    paint.style = Paint.Style.FILL

    // Texto de la etiqueta centrado
    val textY = pillTop + (pillHeight / 2f) - ((textPaint.descent() + textPaint.ascent()) / 2f)
    canvas.drawText(label, centerX, textY, textPaint)

    // 2. Dibujar el pin circular (debajo de la pastilla)
    val pinCenterY = pillBottom + pinSpacing + pinRadius

    // Sombra del círculo
    paint.color = 0x33000000
    canvas.drawCircle(centerX, pinCenterY + (1.5f * density), pinRadius, paint)

    // Borde exterior blanco
    paint.color = android.graphics.Color.WHITE
    canvas.drawCircle(centerX, pinCenterY, pinRadius, paint)

    // Círculo interior con el color del contenedor
    paint.color = colorInt
    canvas.drawCircle(centerX, pinCenterY, pinRadius - (2.5f * density), paint)

    // 3. Punta inferior del pin
    val tipStartY = pinCenterY + (pinRadius * 0.65f)
    val tipBottomY = totalHeight - (2f * density)
    val tipHalfWidth = 5f * density

    // Punta blanca exterior
    val tipPathWhite = Path().apply {
        moveTo(centerX - tipHalfWidth - (1f * density), tipStartY)
        lineTo(centerX + tipHalfWidth + (1f * density), tipStartY)
        lineTo(centerX, tipBottomY + (1f * density))
        close()
    }
    paint.color = android.graphics.Color.WHITE
    canvas.drawPath(tipPathWhite, paint)

    // Punta interior con color del contenedor
    val tipPathColor = Path().apply {
        moveTo(centerX - tipHalfWidth, tipStartY)
        lineTo(centerX + tipHalfWidth, tipStartY)
        lineTo(centerX, tipBottomY)
        close()
    }
    paint.color = colorInt
    canvas.drawPath(tipPathColor, paint)

    // 4. Emoji / logo centrado en el círculo
    val emojiPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textSize = 14f * density
        textAlign = Paint.Align.CENTER
    }
    val emojiFontMetrics = emojiPaint.fontMetrics
    val emojiY = pinCenterY - ((emojiFontMetrics.descent + emojiFontMetrics.ascent) / 2f)
    canvas.drawText(emoji, centerX, emojiY, emojiPaint)

    return BitmapDrawable(context.resources, bitmap)
}
