package com.romerolabs.ecomapa.ui.screens.pickup

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.romerolabs.ecomapa.ui.theme.PrimaryGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PickupScreen(
    onNavigateBack: () -> Unit,
    viewModel: PickupViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scrollState = rememberScrollState()

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
                    tint = PrimaryGreen,
                    modifier = Modifier.size(48.dp)
                )
            },
            title = {
                Text("¡Solicitud Enviada con Éxito!", fontWeight = FontWeight.Bold)
            },
            text = {
                Text(
                    "Una cuadrilla o cooperativa de recicladores urbanos se pondrá en contacto contigo para coordinar el retiro.",
                    textAlign = TextAlign.Center
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.resetSuccess()
                        onNavigateBack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                ) {
                    Text("Volver al Inicio")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Retiro a Domicilio 🚛") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Volver",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryGreen,
                    titleContentColor = Color.White
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 20.dp)
                .verticalScroll(scrollState)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "¿Tienes residuos voluminosos o pesados?",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Solicita la recolección domiciliaria para muebles, escombros, ramas o chatarra.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
            )

            // Tipo de Residuo
            Text(text = "Tipo de Material", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
            val wasteOptions = listOf(
                "muebles" to "Muebles / Madera",
                "escombros" to "Escombros",
                "electrodomesticos_grandes" to "Línea Blanca",
                "chatarra" to "Chatarra / Metales",
                "madera_poda" to "Ramas / Poda"
            )

            Column(modifier = Modifier.padding(vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                wasteOptions.forEach { (key, label) ->
                    FilterChip(
                        selected = uiState.wasteType == key,
                        onClick = { viewModel.updateField(wasteType = key) },
                        label = { Text(label) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryGreen.copy(alpha = 0.2f),
                            selectedLabelColor = PrimaryGreen
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Datos de Contacto
            Text(text = "Tus Datos de Contacto", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
            
            OutlinedTextField(
                value = uiState.userName,
                onValueChange = { viewModel.updateField(name = it) },
                label = { Text("Nombre y Apellido") },
                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                shape = RoundedCornerShape(8.dp)
            )

            OutlinedTextField(
                value = uiState.userPhone,
                onValueChange = { viewModel.updateField(phone = it) },
                label = { Text("Teléfono de Contacto (WhatsApp)") },
                leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null) },
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                shape = RoundedCornerShape(8.dp)
            )

            OutlinedTextField(
                value = uiState.address,
                onValueChange = { viewModel.updateField(address = it) },
                label = { Text("Dirección Exacta de Retiro") },
                leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = null) },
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                shape = RoundedCornerShape(8.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Turno Preferido
            Text(text = "Franja Horaria Preferida", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
            Row(modifier = Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = uiState.preferredTimeSlot == "manana",
                    onClick = { viewModel.updateField(timeSlot = "manana") },
                    label = { Text("Turno Mañana (09:00 - 13:00)") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = uiState.preferredTimeSlot == "tarde",
                    onClick = { viewModel.updateField(timeSlot = "tarde") },
                    label = { Text("Turno Tarde (14:00 - 18:00)") },
                    modifier = Modifier.weight(1f)
                )
            }

            OutlinedTextField(
                value = uiState.notes,
                onValueChange = { viewModel.updateField(notes = it) },
                label = { Text("Notas adicionales (opcional)") },
                placeholder = { Text("Ej. El sillón está en planta baja...") },
                modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                shape = RoundedCornerShape(8.dp),
                maxLines = 3
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = { viewModel.submitRequest() },
                enabled = !uiState.isLoading,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text(
                    text = if (uiState.isLoading) "Enviando Solicitud..." else "Confirmar Solicitud de Retiro",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
