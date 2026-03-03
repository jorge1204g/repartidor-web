package com.example.repartidor.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color


import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.repartidor.ui.theme.md_theme_dark_primary
import com.example.repartidor.ui.theme.md_theme_dark_surface
import com.example.repartidor.ui.theme.md_theme_dark_surfaceVariant

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen(
    onBackToDashboard: () -> Unit
) {
    val context = LocalContext.current
    
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
                text = "Mapa de Entregas",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            // Empty space to balance the layout
            Spacer(modifier = Modifier.width(40.dp))
        }
        
        // Map placeholder with dark theme
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            colors = CardDefaults.cardColors(
                containerColor = md_theme_dark_surfaceVariant
            ),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                // Placeholder for map
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color(0xFF2A2F3D)) // Dark blue-gray for map placeholder
                )
                
                // Center marker
                FloatingActionButton(
                    onClick = { /* Handle center on current location */ },
                    containerColor = md_theme_dark_primary,
                    contentColor = Color.White,
                    modifier = Modifier.size(56.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.MyLocation,
                        contentDescription = "Ubicación actual",
                        modifier = Modifier.size(24.dp)
                    )
                }
                
                // Radar effect in center
                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .clip(RoundedCornerShape(50))
                        .background(Color.Black.copy(alpha = 0.3f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationSearching,
                        contentDescription = "Radar",
                        modifier = Modifier
                            .size(60.dp),
                        tint = md_theme_dark_primary
                    )
                }
            }
        }
        
        // Quick actions for delivery zones
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedCard(
                modifier = Modifier
                    .weight(1f)
                    .height(60.dp),
                shape = RoundedCornerShape(12.dp),
                border = CardDefaults.outlinedCardBorder()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = "Zona Caliente",
                        tint = md_theme_dark_primary
                    )
                    Text(
                        text = "Zonas Calientes",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
            
            OutlinedCard(
                modifier = Modifier
                    .weight(1f)
                    .height(60.dp),
                shape = RoundedCornerShape(12.dp),
                border = CardDefaults.outlinedCardBorder()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Notifications,
                        contentDescription = "Alertas",
                        tint = md_theme_dark_primary
                    )
                    Text(
                        text = "Alertas",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}