package com.romerolabs.ecomapa.ui.screens.home

import android.Manifest
import android.annotation.SuppressLint
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material3.BottomSheetScaffold
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SheetValue
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberBottomSheetScaffoldState
import androidx.compose.material3.rememberStandardBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.google.android.gms.location.CurrentLocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.romerolabs.ecomapa.ui.components.chat.ChatPanel
import com.romerolabs.ecomapa.ui.components.gamification.BadgeUnlockDialog
import com.romerolabs.ecomapa.ui.components.gamification.EcoPointsCounter
import com.romerolabs.ecomapa.ui.components.map.EcoMapView
import com.romerolabs.ecomapa.ui.theme.PrimaryGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToBadges: () -> Unit,
    onNavigateToRewards: () -> Unit,
    onNavigateToPickup: () -> Unit,
    viewModel: HomeViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }

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

    val scaffoldState = rememberBottomSheetScaffoldState(
        bottomSheetState = rememberStandardBottomSheetState(
            initialValue = SheetValue.PartiallyExpanded
        )
    )

    BottomSheetScaffold(
        scaffoldState = scaffoldState,
        topBar = {
            TopAppBar(
                title = { Text("EcoMapa 🌿") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryGreen,
                    titleContentColor = Color.White
                ),
                actions = {
                    // Botón Retiro a Domicilio (Fase 2)
                    IconButton(onClick = onNavigateToPickup) {
                        Icon(
                            imageVector = Icons.Filled.LocalShipping,
                            contentDescription = "Retiro a Domicilio",
                            tint = Color.White
                        )
                    }
                    // Botón Canje de Recompensas (Fase 2)
                    IconButton(onClick = onNavigateToRewards) {
                        Icon(
                            imageVector = Icons.Filled.CardGiftcard,
                            contentDescription = "Recompensas",
                            tint = Color.White
                        )
                    }
                    // Botón Insignias
                    IconButton(onClick = onNavigateToBadges) {
                        Icon(
                            imageVector = Icons.Filled.EmojiEvents,
                            contentDescription = "Insignias",
                            tint = Color.White
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
        sheetContent = {
            ChatPanel(
                messages = uiState.chatMessages,
                inputValue = uiState.chatInput,
                onInputChange = { viewModel.updateChatInput(it) },
                onSend = { viewModel.sendMessage() },
                isLoading = uiState.isLoading,
                modifier = Modifier
                    .height(400.dp)
                    .navigationBarsPadding()
                    .imePadding()
            )
        },
        sheetPeekHeight = 120.dp
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            EcoMapView(
                recyclingPoints = uiState.recyclingPoints,
                userLocation = uiState.userLocation,
                centerOnPoint = uiState.centerOnPoint,
                modifier = Modifier.fillMaxSize()
            )

            EcoPointsCounter(
                points = uiState.totalPoints,
                onClick = onNavigateToRewards,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(12.dp)
            )

            FloatingActionButton(
                onClick = { requestLocation(context, viewModel) },
                containerColor = PrimaryGreen,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(16.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.MyLocation,
                    contentDescription = "Mi ubicación",
                    tint = Color.White
                )
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
