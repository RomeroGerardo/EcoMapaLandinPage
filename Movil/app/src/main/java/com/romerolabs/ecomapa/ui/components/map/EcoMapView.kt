package com.romerolabs.ecomapa.ui.components.map

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
                val drawable = GradientDrawable().apply {
                    shape = GradientDrawable.OVAL
                    setSize(36, 36)
                    setColor(colorInt)
                    setStroke(3, 0xFFFFFFFF.toInt())
                }
                icon = drawable

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
