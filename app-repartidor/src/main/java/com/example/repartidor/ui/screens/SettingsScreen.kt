package com.example.repartidor.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.clickable
import com.example.repartidor.ui.theme.md_theme_dark_primary
import com.example.repartidor.ui.theme.md_theme_dark_surface
import com.example.repartidor.ui.theme.md_theme_dark_surfaceVariant

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBackToDashboard: () -> Unit,
    onNavigateToProfile: () -> Unit = {},
    onNavigateToHelp: () -> Unit = {},
    onNavigateToAbout: () -> Unit = {},
    onLogout: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBackToDashboard) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Volver al inicio",
                    tint = md_theme_dark_primary
                )
            }
            
            Text(
                text = "Ajustes",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            // Empty space to balance the layout
            Spacer(modifier = Modifier.width(40.dp))
        }
        
        // Settings options
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(listOf(
                Triple(Icons.Default.AccountCircle, "Perfil", "Editar información personal"),
                Triple(Icons.Default.Notifications, "Notificaciones", "Configurar preferencias de notificaciones"),
                Triple(Icons.Default.LocationOn, "Ubicación", "Administrar permisos de ubicación"),
                Triple(Icons.Default.Payments, "Pagos", "Métodos de pago y retiros"),
                Triple(Icons.Default.Help, "Ayuda", "Centro de ayuda y soporte"),
                Triple(Icons.Default.Info, "Acerca de", "Versión de la app y términos"),
                Triple(Icons.Default.Logout, "Cerrar Sesión", "Salir de la aplicación")
            )) { (icon, title, subtitle) ->
                SettingCard(
                    icon = icon,
                    title = title,
                    subtitle = subtitle,
                    isDangerous = title == "Cerrar Sesión",
                    onClick = {
                        when (title) {
                            "Perfil" -> onNavigateToProfile()
                            "Ayuda" -> onNavigateToHelp()
                            "Acerca de" -> onNavigateToAbout()
                            "Cerrar Sesión" -> onLogout()
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun SettingCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    isDangerous: Boolean = false,
    onClick: () -> Unit = {}
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }, // Hacer que la tarjeta sea clickeable
        colors = CardDefaults.cardColors(
            containerColor = md_theme_dark_surface
        ),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (isDangerous) MaterialTheme.colorScheme.error else md_theme_dark_primary,
                modifier = Modifier.size(24.dp)
            )
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium,
                    color = if (isDangerous) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}