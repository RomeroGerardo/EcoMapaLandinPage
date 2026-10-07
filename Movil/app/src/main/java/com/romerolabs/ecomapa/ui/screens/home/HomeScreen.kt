package com.romerolabs.ecomapa.ui.screens.home

import android.Manifest
import android.annotation.SuppressLint
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.google.android.gms.location.CurrentLocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.romerolabs.ecomapa.ui.components.gamification.BadgeUnlockDialog
import com.romerolabs.ecomapa.ui.components.gamification.EcoPointsCounter
import com.romerolabs.ecomapa.ui.components.map.EcoMapView
import com.romerolabs.ecomapa.ui.theme.EmeraldLight
import com.romerolabs.ecomapa.ui.theme.EmeraldPrimary
import com.romerolabs.ecomapa.ui.theme.EmeraldPrimaryDark
import com.romerolabs.ecomapa.ui.theme.EmeraldPrimaryDeep

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToChat: () -> Unit,
    onNavigateToBadges: () -> Unit,
    onNavigateToRewards: () -> Unit,
    onNavigateToPickup: () -> Unit,
    onNavigateToScan: () -> Unit,
    viewModel: HomeViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    var selectedCategory by remember { mutableStateOf("todos") }

    LaunchedEffect(uiState.errorMessage) {
        uiState.errorMessage?.let { message ->
            snackbarHostState.showSnackbar(message)
            viewModel.clearError()
        }
    }

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
        if (fineGranted || coarseGranted) {
            requestLocation(context, viewModel)
        }
    }

    LaunchedEffect(Unit) {
        locationPermissionLauncher.launch(
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            )
        )
    }

    uiState.newBadgeUnlocked?.let { badge ->
        BadgeUnlockDialog(
            badge = badge,
            onDismiss = { viewModel.dismissBadgeDialog() }
        )
    }

    // Filtrar puntos en el mapa según la categoría seleccionada
    val filteredPoints = remember(uiState.recyclingPoints, selectedCategory) {
        if (selectedCategory == "todos") {
            uiState.recyclingPoints
        } else {
            uiState.recyclingPoints.filter {
                it.type.contains(selectedCategory, ignoreCase = true) ||
                it.color.contains(selectedCategory, ignoreCase = true)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "EcoMapa",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "🌿",
                            fontSize = 20.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                ),
                actions = {
                    EcoPointsCounter(
                        points = uiState.totalPoints,
                        onClick = onNavigateToRewards,
                        modifier = Modifier.padding(end = 4.dp)
                    )

                    IconButton(onClick = onNavigateToBadges) {
                        Icon(
                            imageVector = Icons.Filled.EmojiEvents,
                            contentDescription = "Mis Insignias",
                            tint = EmeraldPrimaryDark
                        )
                    }
                }
            )
        },
        snackbarHost = {
            SnackbarHost(hostState = snackbarHostState) { data ->
                Snackbar(
                    snackbarData = data,
                    containerColor = MaterialTheme.colorScheme.errorContainer,
                    contentColor = MaterialTheme.colorScheme.onErrorContainer
                )
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = true,
                    onClick = { /* Ya estamos en mapa */ },
                    icon = { Icon(Icons.Filled.Map, contentDescription = "Mapa") },
                    label = { Text("Mapa", fontWeight = FontWeight.Bold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = EmeraldPrimaryDark,
                        selectedTextColor = EmeraldPrimaryDark,
                        indicatorColor = EmeraldPrimary.copy(alpha = 0.15f)
                    )
                )

                NavigationBarItem(
                    selected = false,
                    onClick = onNavigateToChat,
                    icon = { Icon(Icons.Filled.AutoAwesome, contentDescription = "EcoIA") },
                    label = { Text("EcoIA") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = EmeraldPrimaryDark,
                        selectedTextColor = EmeraldPrimaryDark
                    )
                )

                NavigationBarItem(
                    selected = false,
                    onClick = onNavigateToPickup,
                    icon = { Icon(Icons.Filled.LocalShipping, contentDescription = "Retiros") },
                    label = { Text("Retiros") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = EmeraldPrimaryDark,
                        selectedTextColor = EmeraldPrimaryDark
                    )
                )

                NavigationBarItem(
                    selected = false,
                    onClick = onNavigateToRewards,
                    icon = { Icon(Icons.Filled.CardGiftcard, contentDescription = "Premios") },
                    label = { Text("Premios") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = EmeraldPrimaryDark,
                        selectedTextColor = EmeraldPrimaryDark
                    )
                )
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Mapa interactivo OSM a pantalla completa
            EcoMapView(
                recyclingPoints = filteredPoints,
                userLocation = uiState.userLocation,
                centerOnPoint = uiState.centerOnPoint,
                modifier = Modifier.fillMaxSize()
            )

            // Filtros de categoría flotantes sobre la parte superior del mapa
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 10.dp, start = 12.dp, end = 12.dp)
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                val filterChips = listOf(
                    "todos" to "🌱 Todos",
                    "amarillo" to "🟡 Plásticos",
                    "azul" to "🔵 Vidrio",
                    "rojo" to "🔴 Pilas / RAEE",
                    "verde" to "🟢 Orgánicos"
                )

                filterChips.forEach { (catId, label) ->
                    val isSelected = selectedCategory == catId
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedCategory = catId },
                        label = {
                            Text(
                                text = label,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = EmeraldPrimary.copy(alpha = 0.9f),
                            selectedLabelColor = Color.White,
                            containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.92f),
                            labelColor = MaterialTheme.colorScheme.onSurface
                        ),
                        shape = RoundedCornerShape(16.dp),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = isSelected,
                            borderColor = if (isSelected) EmeraldPrimary else MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                        )
                    )
                }
            }

            // Botón flotante de GPS Centrar
            FloatingActionButton(
                onClick = { requestLocation(context, viewModel) },
                containerColor = EmeraldPrimaryDark,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(bottom = 96.dp, end = 16.dp)
                    .shadow(6.dp, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Filled.MyLocation,
                    contentDescription = "Mi ubicación",
                    tint = Color.White
                )
            }

            // Área inferior: píldora de EcoIA + botón de Escanear con IA
            Column(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(horizontal = 12.dp, vertical = 10.dp)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Botón de Escanear con IA (destacado, superior)
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigateToScan() },
                    shape = RoundedCornerShape(20.dp),
                    color = EmeraldPrimaryDark,
                    shadowElevation = 10.dp,
                    tonalElevation = 6.dp
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text("📸", fontSize = 22.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Analizá tu residuo con IA",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "Sacá una foto → te decimos qué hacer 🚛",
                                style = MaterialTheme.typography.labelSmall,
                                fontSize = 11.sp,
                                color = Color.White.copy(alpha = 0.85f)
                            )
                        }
                        androidx.compose.material.icons.Icons.Filled.AutoAwesome.let { icon ->
                            Icon(
                                imageVector = icon,
                                contentDescription = null,
                                tint = Color(0xFFFFD740),
                                modifier = Modifier.size(22.dp)
                            )
                        }
                    }
                }

                // Píldora de consulta a EcoIA (chat de texto, inferior)
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigateToChat() },
                    shape = RoundedCornerShape(20.dp),
                    color = MaterialTheme.colorScheme.surface,
                    shadowElevation = 6.dp,
                    tonalElevation = 3.dp,
                    border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldPrimary.copy(alpha = 0.35f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(CircleShape)
                                .background(EmeraldLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("🤖", fontSize = 16.sp)
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "¿Qué residuo querés reciclar?",
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Consultá a EcoIA con texto 🌿",
                                style = MaterialTheme.typography.labelSmall,
                                fontSize = 10.sp,
                                color = EmeraldPrimaryDeep
                            )
                        }
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Consultar a EcoIA",
                            tint = EmeraldPrimaryDark,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}

@SuppressLint("MissingPermission")
fun requestLocation(
    context: android.content.Context,
    viewModel: HomeViewModel
) {
    val fusedClient = LocationServices.getFusedLocationProviderClient(context)

    fusedClient.lastLocation.addOnSuccessListener { location ->
        if (location != null) {
            viewModel.updateUserLocation(location.latitude, location.longitude)
        } else {
            val request = CurrentLocationRequest.Builder()
                .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
                .setMaxUpdateAgeMillis(0)
                .build()

            fusedClient.getCurrentLocation(request, null)
                .addOnSuccessListener { freshLocation ->
                    if (freshLocation != null) {
                        viewModel.updateUserLocation(
                            freshLocation.latitude,
                            freshLocation.longitude
                        )
                    }
                }
        }
    }
}
