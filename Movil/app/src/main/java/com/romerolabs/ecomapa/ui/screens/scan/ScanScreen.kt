package com.romerolabs.ecomapa.ui.screens.scan

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import com.google.android.gms.location.CurrentLocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.ui.res.painterResource
import com.romerolabs.ecomapa.util.ColorMapper
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.NearMe
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.romerolabs.ecomapa.ui.theme.EmeraldLight
import com.romerolabs.ecomapa.ui.theme.EmeraldPrimary
import com.romerolabs.ecomapa.ui.theme.EmeraldPrimaryDark
import com.romerolabs.ecomapa.ui.theme.EmeraldPrimaryDeep
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScanScreen(
    onNavigateBack: () -> Unit,
    onNavigateToPickup: (prefilledWasteType: String) -> Unit,
    viewModel: ScanViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    // GPS del usuario para recomendar el contenedor más cercano en tiempo real
    val fusedLocationClient = remember { LocationServices.getFusedLocationProviderClient(context) }
    var currentUserLocation by remember { mutableStateOf<android.location.Location?>(null) }

    @SuppressLint("MissingPermission")
    fun fetchLocation(onDone: ((android.location.Location?) -> Unit)? = null) {
        val hasFine = ContextCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val hasCoarse = ContextCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        if (hasFine || hasCoarse) {
            fusedLocationClient.lastLocation.addOnSuccessListener { loc ->
                if (loc != null) {
                    currentUserLocation = loc
                    onDone?.invoke(loc)
                } else {
                    val req = CurrentLocationRequest.Builder()
                        .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
                        .setMaxUpdateAgeMillis(20000)
                        .build()
                    fusedLocationClient.getCurrentLocation(req, null)
                        .addOnSuccessListener { fresh ->
                            currentUserLocation = fresh
                            onDone?.invoke(fresh)
                        }
                        .addOnFailureListener { onDone?.invoke(null) }
                }
            }.addOnFailureListener { onDone?.invoke(null) }
        } else {
            onDone?.invoke(null)
        }
    }

    LaunchedEffect(Unit) {
        fetchLocation()
    }

    // URI temporal para la foto de cámara
    var tempImageUri by remember { mutableStateOf<Uri?>(null) }

    // Launcher de la cámara del sistema
    val takePictureLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success && tempImageUri != null) {
            val uri = tempImageUri!!
            if (currentUserLocation != null) {
                viewModel.onPhotoCaptured(
                    uri = uri,
                    userLat = currentUserLocation?.latitude,
                    userLng = currentUserLocation?.longitude
                )
            } else {
                fetchLocation { loc ->
                    viewModel.onPhotoCaptured(
                        uri = uri,
                        userLat = loc?.latitude,
                        userLng = loc?.longitude
                    )
                }
            }
        } else {
            viewModel.onPhotoFailed()
        }
    }

    // Launcher de permiso de cámara
    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            tempImageUri?.let { takePictureLauncher.launch(it) }
        }
    }

    // Función que crea la URI temporal y lanza la cámara
    fun launchCamera() {
        val cacheDir = File(context.cacheDir, "camera_temp").also { it.mkdirs() }
        val tempFile = File(cacheDir, "scan_${System.currentTimeMillis()}.jpg")
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.provider", tempFile)
        tempImageUri = uri

        val hasCameraPermission = ContextCompat.checkSelfPermission(
            context, Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED

        if (hasCameraPermission) {
            takePictureLauncher.launch(uri)
        } else {
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Analizá tu Residuo 📸",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Foto → EcoAsistente IA → Acción",
                            style = MaterialTheme.typography.labelSmall,
                            color = EmeraldPrimaryDeep,
                            fontSize = 11.sp
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (uiState.phase) {
                ScanPhase.IDLE   -> IdleContent(onLaunchCamera = { launchCamera() })
                ScanPhase.LOADING -> LoadingContent(imageUri = uiState.capturedImageUri)
                ScanPhase.RESULT -> ResultContent(
                    result = uiState.result!!,
                    imageUri = uiState.capturedImageUri,
                    onScanAgain = { viewModel.resetScan() },
                    onNavigateToPickup = onNavigateToPickup,
                    onNavigateBack = onNavigateBack
                )
                ScanPhase.ERROR  -> ErrorContent(
                    message = uiState.errorMessage ?: "Algo salió mal.",
                    onRetry = { launchCamera() },
                    onBack = onNavigateBack
                )
            }
        }
    }
}

// ─── Pantalla inicial ─────────────────────────────────────────────────────────

@Composable
private fun IdleContent(onLaunchCamera: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("🤖", fontSize = 64.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "¡Hola! Soy EcoAsistente",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Sacá una foto a cualquier residuo y te digo al instante si podés llevarlo a un punto de reciclaje o si mandamos un vehículo a buscarlo 🚛",
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
            lineHeight = 22.sp
        )
        Spacer(modifier = Modifier.height(40.dp))

        // Indicadores de lo que puede detectar
        ScanCapabilityChip("🏠 Muebles y colchones")
        ScanCapabilityChip("🧊 Electrodomésticos")
        ScanCapabilityChip("🍾 Vidrio, plástico, latas")
        ScanCapabilityChip("🔋 Pilas y baterías")
        ScanCapabilityChip("📦 Cajas y cartón")

        Spacer(modifier = Modifier.height(40.dp))

        Button(
            onClick = onLaunchCamera,
            colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
        ) {
            Icon(Icons.Filled.CameraAlt, contentDescription = null, tint = Color.White)
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = "Sacar foto ahora",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = Color.White
            )
        }
    }
}

@Composable
private fun ScanCapabilityChip(label: String) {
    Surface(
        shape = RoundedCornerShape(50),
        color = EmeraldLight.copy(alpha = 0.4f),
        modifier = Modifier.padding(vertical = 3.dp)
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp),
            fontSize = 13.sp,
            color = EmeraldPrimaryDeep
        )
    }
}

// ─── Pantalla de carga ────────────────────────────────────────────────────────

@Composable
private fun LoadingContent(imageUri: Uri?) {
    val infiniteTransition = rememberInfiniteTransition(label = "spin")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Preview de la foto tomada
        imageUri?.let { uri ->
            AsyncImage(
                model = uri,
                contentDescription = "Foto analizada",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(180.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .border(2.dp, EmeraldPrimary, RoundedCornerShape(16.dp))
            )
            Spacer(modifier = Modifier.height(32.dp))
        }

        Box(contentAlignment = Alignment.Center) {
            CircularProgressIndicator(
                color = EmeraldPrimary,
                strokeWidth = 4.dp,
                modifier = Modifier.size(72.dp)
            )
            Text("🤖", fontSize = 28.sp, modifier = Modifier.rotate(rotation))
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text(
            text = "EcoAsistente analizando...",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Identificando el residuo y buscando la mejor opción para vos 🌿",
            style = MaterialTheme.typography.bodySmall,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
        )
    }
}

// ─── Pantalla de resultado ────────────────────────────────────────────────────

@Composable
private fun ResultContent(
    result: ClassifyImageResult,
    imageUri: Uri?,
    onScanAgain: () -> Unit,
    onNavigateToPickup: (String) -> Unit,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val isPickup = result.action == "SOLICITAR_RETIRO"

    val accentColor = if (isPickup) Color(0xFFE65100) else EmeraldPrimary
    val bgColor = if (isPickup) Color(0xFFFFF3E0) else Color(0xFFE8F5E9)
    val actionEmoji = if (isPickup) "🚛" else "🗺️"
    val actionLabel = if (isPickup) "Programar Retiro a Domicilio" else "Ver punto en el Mapa"

    AnimatedVisibility(
        visible = true,
        enter = fadeIn() + slideInVertically(initialOffsetY = { it / 4 })
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Foto tomada
            imageUri?.let { uri ->
                AsyncImage(
                    model = uri,
                    contentDescription = "Foto analizada",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .border(2.dp, accentColor.copy(alpha = 0.5f), RoundedCornerShape(16.dp))
                )
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Badge de acción (retiro o punto verde)
            Surface(
                shape = RoundedCornerShape(50),
                color = accentColor,
                modifier = Modifier.padding(bottom = 12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(actionEmoji, fontSize = 18.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isPickup) "Retiro a Domicilio" else "Punto de Reciclaje",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }

            // Nombre del item detectado
            Text(
                text = result.itemDetectado,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Text(
                text = result.categoria,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                modifier = Modifier.padding(top = 2.dp, bottom = 16.dp)
            )

            // Mensaje amigable de EcoAsistente
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = bgColor,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Text("🤖", fontSize = 28.sp)
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = result.friendlyMessage,
                        style = MaterialTheme.typography.bodyMedium,
                        lineHeight = 22.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Instrucciones
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "📋 ¿Qué hacer?",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = accentColor
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = result.instrucciones,
                        style = MaterialTheme.typography.bodySmall,
                        lineHeight = 20.sp
                    )
                }
            }

            // Punto sugerido (solo para PUNTO_RECICLAJE)
            result.suggestedPoint?.let { point ->
                Spacer(modifier = Modifier.height(12.dp))
                val containerDrawable = ColorMapper.getContainerDrawableRes(point.type, point.color)
                val emoji = ColorMapper.getContainerEmoji(point.type, point.color)

                Surface(
                    onClick = {
                        launchGoogleMapsNavigation(context, point.latitude, point.longitude)
                    },
                    shape = RoundedCornerShape(16.dp),
                    color = EmeraldLight.copy(alpha = 0.45f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldPrimary.copy(alpha = 0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Image(
                            painter = painterResource(id = containerDrawable),
                            contentDescription = point.name,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .size(72.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .border(1.5.dp, EmeraldPrimary, RoundedCornerShape(12.dp))
                        )
                        Spacer(modifier = Modifier.width(14.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = "📍 $emoji Contenedor sugerido",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = EmeraldPrimaryDark
                                )
                                Text(
                                    text = "Abrir GPS 🧭",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 11.sp,
                                    color = EmeraldPrimaryDeep
                                )
                            }
                            Spacer(modifier = Modifier.height(3.dp))
                            Text(
                                text = point.name,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            point.address?.let { addr ->
                                Text(
                                    text = addr,
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                                    lineHeight = 16.sp
                                )
                            }
                            point.distanceKm?.let { dist ->
                                Text(
                                    text = "📏 ${"%.1f".format(dist)} km de tu ubicación",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = EmeraldPrimaryDeep,
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }
                        }
                    }
                }
            }

            // EcoPoints estimados
            Spacer(modifier = Modifier.height(12.dp))
            Surface(
                shape = RoundedCornerShape(50),
                color = Color(0xFFFFF9C4),
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = Color(0xFFF57F17),
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Ganás +${result.ecopointsEstimados} EcoPuntos 🌟",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = Color(0xFFF57F17)
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            if (isPickup) {
                // Modo Retiro a Domicilio (voluminosos: muebles, colchones, heladeras)
                Button(
                    onClick = {
                        val pickupType = mapCategoryToPickupType(result.categoria)
                        onNavigateToPickup(pickupType)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = accentColor),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.LocalShipping,
                        contentDescription = null,
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "🚛 Programar Retiro a Domicilio",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedButton(
                    onClick = onScanAgain,
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, accentColor.copy(alpha = 0.5f))
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null, tint = accentColor)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Analizar otro objeto", color = accentColor, fontWeight = FontWeight.Medium)
                }
            } else {
                // Modo Punto de Reciclaje (plásticos, vidrios, cartón, electrónicos, etc.)
                val suggestedPoint = result.suggestedPoint

                if (suggestedPoint != null) {
                    // Botón 1: Navegación GPS directa en Google Maps (Turn-by-turn)
                    Button(
                        onClick = {
                            launchGoogleMapsNavigation(
                                context,
                                suggestedPoint.latitude,
                                suggestedPoint.longitude
                            )
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.NearMe,
                            contentDescription = null,
                            tint = Color.White
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "🧭 Cómo llegar al contenedor (Google Maps)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.5.sp,
                            color = Color.White
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Botón 2: Ver en el mapa interactivo de EcoMapa
                    OutlinedButton(
                        onClick = onNavigateBack,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        border = androidx.compose.foundation.BorderStroke(1.5.dp, EmeraldPrimary)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Map,
                            contentDescription = null,
                            tint = EmeraldPrimary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "🗺️ Ver en el mapa de EcoMapa",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = EmeraldPrimary
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Botón 3: Analizar otro objeto
                    OutlinedButton(
                        onClick = onScanAgain,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color.Gray.copy(alpha = 0.4f))
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, tint = Color.Gray)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Analizar otro objeto",
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                            fontWeight = FontWeight.Medium
                        )
                    }
                } else {
                    // Fallback si no hay punto específico sugerido
                    Button(
                        onClick = onNavigateBack,
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                    ) {
                        Icon(Icons.Filled.Map, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "🗺️ Ver puntos en el Mapa",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = Color.White
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedButton(
                        onClick = onScanAgain,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldPrimary.copy(alpha = 0.5f))
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, tint = EmeraldPrimary)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Analizar otro objeto", color = EmeraldPrimary, fontWeight = FontWeight.Medium)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

// ─── Pantalla de error ────────────────────────────────────────────────────────

@Composable
private fun ErrorContent(message: String, onRetry: () -> Unit, onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("😕", fontSize = 64.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = message,
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
        )
        Spacer(modifier = Modifier.height(32.dp))
        Button(
            onClick = onRetry,
            colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth().height(50.dp)
        ) {
            Icon(Icons.Default.CameraAlt, contentDescription = null, tint = Color.White)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Intentar de nuevo", color = Color.White, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(10.dp))
        OutlinedButton(
            onClick = onBack,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth().height(48.dp)
        ) {
            Text("Volver")
        }
    }
}

// ─── Helper: mapear categoría de IA a tipo de PickupViewModel ────────────────

private fun mapCategoryToPickupType(categoria: String): String {
    val lower = categoria.lowercase()
    return when {
        lower.contains("electrodoméstico") || lower.contains("raee") ||
        lower.contains("heladera") || lower.contains("lavarropas") ||
        lower.contains("línea blanca")
            -> "electrodomesticos_grandes"
        lower.contains("mueble") || lower.contains("sillón") ||
        lower.contains("sofá") || lower.contains("colchón") || lower.contains("cama")
            -> "muebles"
        lower.contains("chatarra") || lower.contains("metal") ||
        lower.contains("hierro") || lower.contains("bicicleta")
            -> "chatarra"
        lower.contains("escombro") || lower.contains("obra") || lower.contains("ladrillo")
            -> "escombros"
        lower.contains("poda") || lower.contains("rama") || lower.contains("árbol")
            -> "madera_poda"
        else -> "muebles" // fallback razonable para objetos voluminosos
    }
}

/**
 * Lanza la aplicación Google Maps directamente en modo navegación GPS paso a paso (Turn-by-Turn).
 * Si Google Maps no está instalado, abre cualquier visor de mapas instalado en el dispositivo.
 */
private fun launchGoogleMapsNavigation(context: android.content.Context, latitude: Double, longitude: Double) {
    val navUri = Uri.parse("google.navigation:q=$latitude,$longitude")
    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, navUri).apply {
        setPackage("com.google.android.apps.maps")
    }
    try {
        context.startActivity(intent)
    } catch (_: Exception) {
        val fallbackUri = Uri.parse("geo:$latitude,$longitude?q=$latitude,$longitude")
        val fallbackIntent = android.content.Intent(android.content.Intent.ACTION_VIEW, fallbackUri)
        try {
            context.startActivity(fallbackIntent)
        } catch (_: Exception) {}
    }
}
