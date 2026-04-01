package com.example.repartidor.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.repartidor.data.model.Order
import com.example.repartidor.ui.viewmodel.DeliveryViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClientChatListScreen(
    viewModel: DeliveryViewModel,
    onBack: () -> Unit,
    onClientClick: (String, String) -> Unit  // clientId, clientName
) {
    val orders by viewModel.orders.collectAsState()
    val deliveryPerson by viewModel.deliveryPerson.collectAsState()
    
    // Filtrar pedidos activos del repartidor
    val activeOrders = remember(orders, deliveryPerson) {
        orders.filter { order ->
            order.assignedToDeliveryId == deliveryPerson?.id &&
            order.status !in listOf("DELIVERED", "CANCELLED")
        }
    }
    
    // Agrupar por cliente único
    val uniqueClients = remember(activeOrders) {
        activeOrders.groupBy { order ->
            order.customer.name to order.customer.phone
        }.mapNotNull { (_, clientOrders) ->
            clientOrders.maxByOrNull { it.createdAt }
        }.sortedByDescending { it.createdAt }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "💬 Chats con Clientes",
                        fontWeight = FontWeight.Bold
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Volver")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (uniqueClients.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "📭",
                        fontSize = 64.sp
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "No hay chats activos",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "Los clientes aparecerán aquí cuando tengas pedidos asignados",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 32.dp)
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(uniqueClients) { order ->
                    ClientChatItem(
                        order = order,
                        onClick = {
                            // Usar el teléfono del cliente como ID (es único y consistente)
                            // Se agrega prefijo "phone_" para distinguir de otros tipos de ID
                            val customerId = "phone_${order.customer.phone}"
                            onClientClick(customerId, order.id)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun ClientChatItem(
    order: Order,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar del cliente
            Box(
                modifier = Modifier
                    .size(50.dp)
                    .width(50.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = order.customer.name.firstOrNull()?.toString() ?: "👤",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Información del cliente
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = order.customer.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = "📦 Pedido: ${order.orderId}",
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Spacer(modifier = Modifier.height(2.dp))
                
                Text(
                    text = "📞 ${order.customer.phone}",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            // Estado del pedido
            Box(
                modifier = Modifier
                    .padding(start = 8.dp)
                    .wrapContentSize(),
                contentAlignment = Alignment.CenterEnd
            ) {
                Text(
                    text = when (order.status) {
                        "ACCEPTED" -> "✅"
                        "ON_THE_WAY_TO_STORE" -> "🛵"
                        "ARRIVED_AT_STORE" -> "🏪"
                        "PICKING_UP_ORDER" -> "📦"
                        "ON_THE_WAY_TO_CUSTOMER" -> "🏠"
                        else -> "⏳"
                    },
                    fontSize = 24.sp
                )
            }
        }
    }
}
