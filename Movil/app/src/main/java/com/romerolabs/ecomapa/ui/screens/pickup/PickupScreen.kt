package com.romerolabs.ecomapa.ui.screens.pickup

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.romerolabs.ecomapa.ui.theme.EmeraldPrimary
import com.romerolabs.ecomapa.ui.theme.EmeraldPrimaryDark

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PickupScreen(
    onNavigateBack: () -> Unit,
    prefilledWasteType: String? = null,
    viewModel: PickupViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scrollState = rememberScrollState()

    // Si llegamos desde el escáner de IA, pre-cargar el tipo de residuo detectado
    LaunchedEffect(prefilledWasteType) {
        prefilledWasteType?.let { viewModel.prefillFromScan(it) }
    }

    LaunchedEffect(uiState.errorMessage) {
        uiState.errorMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearError()
        }
    }

    if (uiState.isSuccess) {
        AlertDialog(
            onDismissRequest = {
                viewModel.resetSuccess()
                onNavigateBack()
            },
            icon = {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = EmeraldPrimary,
                    modifier = Modifier.size(52.dp)
                )
            },
            title = {
                Text(
                    "¡Solicitud Enviada con Éxito!",
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
            },
            text = {
                Text(
                    "Una cuadrilla municipal o cooperativa de recicladores urbanos se pondrá en contacto contigo para coordinar el retiro.",
                    textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.bodyMedium
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.resetSuccess()
                        onNavigateBack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimaryDark),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Volver al Inicio")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Retiro a Domicilio 🚛",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Cuadrillas Urbanas & Economía Circular",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Volver",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(paddingValues)
                .padding(horizontal = 20.dp)
                .verticalScroll(scrollState)
        ) {
            Spacer(modifier = Modifier.height(12.dp))

            // Banner informativo GovTech
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(EmeraldPrimary.copy(alpha = 0.10f))
                    .border(1.dp, EmeraldPrimary.copy(alpha = 0.25f), RoundedCornerShape(16.dp))
                    .padding(14.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.LocalShipping,
                        contentDescription = null,
                        tint = EmeraldPrimaryDark,
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "¿Tienes residuos voluminosos o pesados?",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Muebles en desuso, escombros embolsados, ramas o chatarra recolectados sin costo.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Tipo de Residuo
            Text(
                text = "Tipo de Material a Retirar",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            val wasteOptions = listOf(
                "muebles" to "🛋️ Muebles / Madera",
                "escombros" to "🧱 Escombros Limpios",
                "electrodomesticos_grandes" to "🧊 Línea Blanca / RAEE",
                "chatarra" to "⚙️ Chatarra / Metales",
                "madera_poda" to "🌿 Restos de Poda / Ramas"
            )

            Column(
                modifier = Modifier.padding(vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                wasteOptions.forEach { (key, label) ->
                    val isSelected = uiState.wasteType == key
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.updateField(wasteType = key) },
                        label = {
                            Text(
                                text = label,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = EmeraldPrimary.copy(alpha = 0.15f),
                            selectedLabelColor = EmeraldPrimaryDark
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = isSelected,
                            borderColor = if (isSelected) EmeraldPrimary else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Datos de Contacto
            Text(
                text = "Tus Datos de Contacto",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            val textFieldColors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = EmeraldPrimary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.4f),
                focusedContainerColor = MaterialTheme.colorScheme.surface,
                unfocusedContainerColor = MaterialTheme.colorScheme.surface
            )

            OutlinedTextField(
                value = uiState.userName,
                onValueChange = { viewModel.updateField(name = it) },
                label = { Text("Nombre y Apellido") },
                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = EmeraldPrimary) },
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                shape = RoundedCornerShape(14.dp),
                colors = textFieldColors
            )

            OutlinedTextField(
                value = uiState.userPhone,
                onValueChange = { viewModel.updateField(phone = it) },
                label = { Text("Teléfono de Contacto (WhatsApp)") },
                leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = EmeraldPrimary) },
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                shape = RoundedCornerShape(14.dp),
                colors = textFieldColors
            )

            OutlinedTextField(
                value = uiState.address,
                onValueChange = { viewModel.updateField(address = it) },
                label = { Text("Dirección Exacta de Retiro") },
                leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = null, tint = EmeraldPrimary) },
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                shape = RoundedCornerShape(14.dp),
                colors = textFieldColors
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Turno Preferido
            Text(
                text = "Franja Horaria Preferida",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val isManana = uiState.preferredTimeSlot == "manana"
                val isTarde = uiState.preferredTimeSlot == "tarde"

                FilterChip(
                    selected = isManana,
                    onClick = { viewModel.updateField(timeSlot = "manana") },
                    label = { Text("🌅 Mañana (09-13hs)") },
                    shape = RoundedCornerShape(12.dp),
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = EmeraldPrimary.copy(alpha = 0.15f),
                        selectedLabelColor = EmeraldPrimaryDark
                    ),
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = isTarde,
                    onClick = { viewModel.updateField(timeSlot = "tarde") },
                    label = { Text("🌇 Tarde (14-18hs)") },
                    shape = RoundedCornerShape(12.dp),
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = EmeraldPrimary.copy(alpha = 0.15f),
                        selectedLabelColor = EmeraldPrimaryDark
                    ),
                    modifier = Modifier.weight(1f)
                )
            }

            OutlinedTextField(
                value = uiState.notes,
                onValueChange = { viewModel.updateField(notes = it) },
                label = { Text("Notas adicionales para la cuadrilla (opcional)") },
                placeholder = { Text("Ej. El mueble está en el garaje con acceso directo...") },
                modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                shape = RoundedCornerShape(14.dp),
                colors = textFieldColors,
                maxLines = 3
            )

            Spacer(modifier = Modifier.height(28.dp))

            Button(
                onClick = { viewModel.submitRequest() },
                enabled = !uiState.isLoading,
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimaryDark),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(14.dp)
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Enviando Solicitud...")
                } else {
                    Icon(
                        imageVector = Icons.Default.LocalShipping,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Confirmar Solicitud de Retiro",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(36.dp))
        }
    }
}
