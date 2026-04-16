package com.example.repartidor.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

@Composable
fun LoginScreen(
    isLoading: Boolean,
    errorMessage: String?,
    onLoginAttempt: (String) -> Unit,
    onClearError: () -> Unit
) {
    var deliveryId by remember { mutableStateOf("") }
    
    // Clear error when user starts typing
    LaunchedEffect(deliveryId) {
        if (errorMessage != null && deliveryId.isNotEmpty()) {
            onClearError()
        }
    }
    
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth(0.8f)
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // TEXTO DE PRUEBA PARA VERIFICAR COMPILACIÓN
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Text(
                    text = "🎉 ¡BIENVENIDOS A TODOS! 🎉\n✅ Versión compilada correctamente",
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
            
            // Title
            Text(
                text = "¡Hola Repartidor!",
                style = MaterialTheme.typography.headlineMedium,
                textAlign = TextAlign.Center,
                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
            )
            
            // Subtitle
            Text(
                text = "Ingresa tu ID y comienza a repartir",
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Center,
                color = com.example.repartidor.ui.theme.TextSecondary
            )
            
            // Instructions
            Text(
                text = "Asegúrate de usar el ID exacto proporcionado por el administrador",
                style = MaterialTheme.typography.bodySmall,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            // Error message
            if (errorMessage != null) {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = com.example.repartidor.ui.theme.DangerRed.copy(alpha = 0.1f)
                    ),
                    shape = androidx.compose.material3.MaterialTheme.shapes.small,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = errorMessage,
                        style = MaterialTheme.typography.bodyMedium,
                        color = com.example.repartidor.ui.theme.DangerRed,
                        modifier = Modifier.padding(12.dp),
                        textAlign = TextAlign.Center
                    )
                }
            }
            
            // ID Input
            OutlinedTextField(
                value = deliveryId,
                onValueChange = { deliveryId = it },
                label = { Text("ID de Repartidor") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp),
                enabled = !isLoading,
                isError = errorMessage != null,
                shape = androidx.compose.material3.MaterialTheme.shapes.medium
            )
            
            // Login Button
            if (isLoading) {
                CircularProgressIndicator()
            } else {
                Button(
                    onClick = {
                        if (deliveryId.isNotBlank()) {
                            onLoginAttempt(deliveryId)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    enabled = deliveryId.isNotBlank(),
                    shape = androidx.compose.material3.MaterialTheme.shapes.medium,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = com.example.repartidor.ui.theme.PrimaryGreen
                    )
                ) {
                    Text(
                        text = "Iniciar Sesión",
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            // Instructions
            Text(
                text = "Contacta con el administrador para obtener tu ID de repartidor",
                style = MaterialTheme.typography.bodySmall,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}