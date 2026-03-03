package com.example.repartidor.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.repartidor.ui.theme.md_theme_dark_primary
import com.example.repartidor.ui.theme.md_theme_dark_surface
import com.example.repartidor.ui.theme.md_theme_dark_surfaceVariant

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HelpScreen(
    onBackToSettings: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBackToSettings) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Volver a ajustes",
                    tint = md_theme_dark_primary
                )
            }
            
            Text(
                text = "Ayuda",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            // Empty space to balance the layout
            Spacer(modifier = Modifier.width(40.dp))
        }
        
        // Help content
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = md_theme_dark_surface
            ),
            shape = MaterialTheme.shapes.medium,
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Centro de Ayuda",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Divider(color = MaterialTheme.colorScheme.onSurfaceVariant)
                
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        HelpItem(
                            title = "¿Cómo acepto un pedido?",
                            description = "Cuando recibes una notificación de nuevo pedido, ve a la sección 'Inicio' y presiona el botón 'Aceptar Pedido'."
                        )
                    }
                    
                    item {
                        HelpItem(
                            title = "¿Cómo actualizo mi estado?",
                            description = "Durante la entrega, puedes actualizar tu estado pulsando los botones en orden: 'En camino al restaurante', 'Llegué al restaurante', 'Con alimentos en mochila', 'En camino al cliente' y 'Pedido entregado'."
                        )
                    }
                    
                    item {
                        HelpItem(
                            title = "¿Cómo contacto al cliente?",
                            description = "En la pantalla de detalles del pedido, puedes llamar al cliente o ver su ubicación."
                        )
                    }
                    
                    item {
                        HelpItem(
                            title = "¿Cómo veo mis ganancias?",
                            description = "Las ganancias se muestran en la pantalla de 'Inicio', donde puedes ver tus ganancias diarias, semanales y mensuales."
                        )
                    }
                    
                    item {
                        HelpItem(
                            title = "¿Cómo contacto al administrador?",
                            description = "Ve a la sección 'Mensajes' para comunicarte con el administrador."
                        )
                    }
                    
                    item {
                        HelpItem(
                            title = "¿Por qué no recibo pedidos?",
                            description = "Asegúrate de que tu estado esté marcado como 'En Línea' en la pantalla de inicio."
                        )
                    }
                }
            }
        }
        
        // Contact support
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = md_theme_dark_surface
            ),
            shape = MaterialTheme.shapes.medium,
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Contactar Soporte",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Button(
                    onClick = { /* Implementar contacto con soporte */ },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = md_theme_dark_primary
                    )
                ) {
                    Icon(Icons.Default.Email, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Enviar mensaje al soporte")
                }
            }
        }
    }
}

@Composable
fun HelpItem(title: String, description: String) {
    Column(
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface
        )
        
        Text(
            text = description,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}