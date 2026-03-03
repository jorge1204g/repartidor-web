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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.repartidor.data.model.Order
import com.example.repartidor.ui.viewmodel.DeliveryViewModel
import com.example.repartidor.ui.theme.md_theme_dark_primary
import com.example.repartidor.ui.theme.md_theme_dark_surface
import com.example.repartidor.ui.theme.md_theme_dark_surfaceVariant

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WalletScreen(
    viewModel: DeliveryViewModel,
    onBackToDashboard: () -> Unit
) {
    val completedOrders by viewModel.completedOrders.collectAsState()
    val totalEarnings = completedOrders.sumOf { it.deliveryCost }
    
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
                text = "Billetera",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            // Empty space to balance the layout
            Spacer(modifier = Modifier.width(40.dp))
        }
        
        // Wallet balance card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = md_theme_dark_surfaceVariant
            ),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Saldo Disponible",
                    style = MaterialTheme.typography.titleMedium,
                    color = Color(0xFFD0D0D0) // Gris más claro
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "\$${String.format("%.2f", totalEarnings)}",
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Bold,
                    color = Color.White // Blanco Puro para montos de dinero
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "Suma de todos los pedidos finalizados",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFFD0D0D0) // Gris más claro
                )
            }
        }
        
        // Completed orders history
        Text(
            text = "Historial de Pedidos Finalizados",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface
        )
        
        // Completed orders list
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(completedOrders) { order ->
                CompletedOrderHistoryItem(
                    order = order
                )
            }
        }
    }
}

@Composable
fun CompletedOrderHistoryItem(
    order: Order
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
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
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Pedido #${order.orderId.ifEmpty { order.id.take(8) }}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = order.restaurantName,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                val formatter = java.text.SimpleDateFormat("dd/MM/yyyy HH:mm", java.util.Locale.getDefault())
                Text(
                    text = formatter.format(java.util.Date(order.createdAt)),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            Text(
                text = "+\$${String.format("%.2f", order.deliveryCost)}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Bold,
                color = Color.Green // Verde Neón para ganancias
            )
        }
    }
}