package com.example.repartidor.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.remember
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
import com.example.repartidor.utils.translateOrderStatus

// Clase de datos para vista previa de pedidos
data class OrderPreview(
    val id: String,
    val restaurantName: String,
    val earning: Double,
    val products: List<String>,
    val pickupUrl: String,
    val deliveryAddress: String
)



// Función para comprobar si una marca de tiempo corresponde a hoy
fun isToday(timestamp: Long): Boolean {
    val today = java.util.Calendar.getInstance()
    today.timeInMillis = System.currentTimeMillis()
    
    val orderDay = java.util.Calendar.getInstance()
    orderDay.timeInMillis = timestamp
    
    return orderDay.get(java.util.Calendar.YEAR) == today.get(java.util.Calendar.YEAR) &&
           orderDay.get(java.util.Calendar.DAY_OF_YEAR) == today.get(java.util.Calendar.DAY_OF_YEAR)
}

// Función para comprobar si un pedido fue entregado hoy
fun isOrderDeliveredToday(order: com.example.repartidor.data.model.Order): Boolean {
    return order.deliveredAt != null && isToday(order.deliveredAt)
}

@Composable
fun ReceivedOrdersSection(
    viewModel: com.example.repartidor.ui.viewmodel.DeliveryViewModel,
    onOrderDetailClick: (com.example.repartidor.data.model.Order) -> Unit = {}
) {
    val orders by viewModel.orders.collectAsState()
    
    // Filtrar pedidos que están pendientes o asignados manualmente
    val receivedOrders = orders.filter { order ->
        order.status in listOf("PENDING", "ASSIGNED", "MANUAL_ASSIGNED") &&
        order.assignedToDeliveryId.isEmpty()
    }
    
    if (receivedOrders.isNotEmpty()) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Nuevos Pedidos Recibidos",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            receivedOrders.forEach { order ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = order.restaurantName,
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Ganancia: \$${String.format("%.2f", order.deliveryCost)}",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color.Green // Verde Neón para ganancias
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = "Productos:",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        
                        order.items.forEach { item ->
                            Text(
                                text = "• ${item.name} x${item.quantity} (\$${String.format("%.2f", item.unitPrice)} c/u)",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        // Solo mostrar información sensible después de aceptar el pedido
                        Text(
                            text = "Toca \"Aceptar Pedido\" para ver información de contacto y dirección",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error,
                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                        )
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Button(
                            onClick = { 
                                // Aceptar el pedido y luego permitir ver detalles
                                viewModel.acceptOrder(order.id)
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = md_theme_dark_primary
                            )
                        ) {
                            Text(
                                text = "Aceptar Pedido",
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
    
    // Mostrar pedidos activos con opciones de seguimiento
    val activeOrders = orders.filter { order ->
        order.status in listOf("ACCEPTED", "ON_THE_WAY_TO_STORE", "ARRIVED_AT_STORE", "PICKING_UP_ORDER", "ON_THE_WAY_TO_CUSTOMER")
    }
    
    if (activeOrders.isNotEmpty()) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Pedidos en Proceso",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            activeOrders.forEach { order ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOrderDetailClick(order) },
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "Pedido #${order.orderId.ifEmpty { order.id }}",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        
                        Text(
                            text = "Restaurante: ${order.restaurantName}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        
                        Text(
                            text = "Estado: ${translateOrderStatus(order.status)}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        // Botones de acción según el estado del pedido
                        when (order.status) {
                            "ACCEPTED" -> {
                                Button(
                                    onClick = { viewModel.goToStore(order.id) },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = com.example.repartidor.ui.theme.SecondaryGreen
                                    )
                                ) {
                                    Text(
                                        text = "1. En camino al restaurante",
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            "ON_THE_WAY_TO_STORE" -> {
                                Button(
                                    onClick = { viewModel.arrivedAtStore(order.id) },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = com.example.repartidor.ui.theme.WarningOrange
                                    )
                                ) {
                                    Text(
                                        text = "2. Llegué al restaurante",
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            "ARRIVED_AT_STORE" -> {
                                Button(
                                    onClick = { viewModel.pickingUpOrder(order.id) },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = com.example.repartidor.ui.theme.AccentBlue
                                    )
                                ) {
                                    Text(
                                        text = "3. Repartidor con alimentos en mochila",
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            "PICKING_UP_ORDER" -> {
                                Button(
                                    onClick = { viewModel.goToCustomer(order.id) },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = com.example.repartidor.ui.theme.LightBlue
                                    )
                                ) {
                                    Text(
                                        text = "4. En camino al cliente",
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            "ON_THE_WAY_TO_CUSTOMER" -> {
                                // Botón para entregar pedido con código de confirmación
                                var showCodeDialog by remember { mutableStateOf(false) }
                                var enteredCode by remember { mutableStateOf("") }
                                var codeError by remember { mutableStateOf("") }
                                
                                Button(
                                    onClick = { showCodeDialog = true },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = com.example.repartidor.ui.theme.DangerRed
                                    )
                                ) {
                                    Text(
                                        text = "5. Pedido entregado",
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                
                                // Diálogo para ingresar código del cliente
                                if (showCodeDialog) {
                                    AlertDialog(
                                        onDismissRequest = { 
                                            showCodeDialog = false
                                            codeError = ""
                                            enteredCode = ""
                                        },
                                        title = { Text("Código de Confirmación") },
                                        text = {
                                            Column {
                                                Text("Por favor ingrese el código del cliente para confirmar la entrega:")
                                                Spacer(modifier = Modifier.height(16.dp))
                                                OutlinedTextField(
                                                    value = enteredCode,
                                                    onValueChange = { newValue ->
                                                        // Validar que solo contenga números y tenga máximo 4 dígitos
                                                        if (newValue.length <= 4 && newValue.all { char -> char.isDigit() }) {
                                                            enteredCode = newValue
                                                        }
                                                    },
                                                    label = { Text("Código del cliente") },
                                                    placeholder = { Text("Ingrese 4 dígitos") },
                                                    isError = codeError.isNotEmpty(),
                                                    supportingText = {
                                                        if (codeError.isNotEmpty()) {
                                                            Text(
                                                                text = codeError,
                                                                color = MaterialTheme.colorScheme.error
                                                            )
                                                        }
                                                    }
                                                )
                                            }
                                        },
                                        confirmButton = {
                                            Button(
                                                onClick = {
                                                    if (enteredCode == order.customerCode) {
                                                        // Código correcto, completar la entrega
                                                        viewModel.deliveredOrder(order.id)
                                                        showCodeDialog = false
                                                        codeError = ""
                                                        enteredCode = ""
                                                    } else {
                                                        // Código incorrecto
                                                        codeError = "Código incorrecto. Inténtelo de nuevo."
                                                    }
                                                }
                                            ) {
                                                Text("Confirmar")
                                            }
                                        },
                                        dismissButton = {
                                            Button(
                                                onClick = { 
                                                    showCodeDialog = false
                                                    codeError = ""
                                                    enteredCode = ""
                                                }
                                            ) {
                                                Text("Cancelar")
                                            }
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    dailyEarnings: Double,
    weeklyEarnings: Double,
    monthlyEarnings: Double,
    onMapClick: () -> Unit,
    onWalletClick: () -> Unit,
    onSettingsClick: () -> Unit,
    onSupportClick: () -> Unit,
    viewModel: com.example.repartidor.ui.viewmodel.DeliveryViewModel,
    onOrderDetailClick: (com.example.repartidor.data.model.Order) -> Unit = {}
) {
    val context = LocalContext.current
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header with user info and switch
        val deliveryPerson by viewModel.deliveryPerson.collectAsState()
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // User info section
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Placeholder for CircleImageView
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(RoundedCornerShape(50))
                        .background(md_theme_dark_surfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Foto del repartidor",
                        modifier = Modifier
                            .size(36.dp),
                        tint = md_theme_dark_primary
                    )
                }
                
                Text(
                    text = "¡Hola, ${deliveryPerson?.name ?: "Repartidor"}!",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
            
            // Online toggle switch
            Switch(
                checked = deliveryPerson?.isOnline ?: true,
                onCheckedChange = { isChecked ->
                    deliveryPerson?.let { person ->
                        viewModel.updatePresence(isChecked, person.isActive)
                    }
                },
                colors = SwitchDefaults.colors(
                    checkedThumbColor = md_theme_dark_primary,
                    checkedTrackColor = md_theme_dark_primary.copy(alpha = 0.5f),
                    uncheckedThumbColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    uncheckedTrackColor = MaterialTheme.colorScheme.surfaceVariant
                )
            )
        }
        
        // Última entrega
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Start
        ) {
            Text(
                text = "Última entrega: hace 15 min",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        
        // Dashboard Cards Section
        Text(
            text = "Ganancias Hoy",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )
        
        // Horizontal layout for earnings cards
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Daily Earnings Card
            Card(
                modifier = Modifier
                    .weight(1f)
                    .height(120.dp),
                colors = CardDefaults.cardColors(
                    containerColor = md_theme_dark_surfaceVariant
                ),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.SpaceEvenly,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Today,
                        contentDescription = "Ganancias Diarias",
                        tint = Color.Green // Verde Neón para ganancias
                    )
                    Text(
                        text = "\$${String.format("%.2f", dailyEarnings)}",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color.White // Blanco Puro para montos de dinero
                    )
                    Text(
                        text = "Hoy",
                        style = MaterialTheme.typography.labelMedium,
                        color = Color(0xFFD0D0D0) // Gris más claro
                    )
                }
            }
            
            // Weekly Earnings Card
            Card(
                modifier = Modifier
                    .weight(1f)
                    .height(120.dp),
                colors = CardDefaults.cardColors(
                    containerColor = md_theme_dark_surfaceVariant
                ),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.SpaceEvenly,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.DateRange,
                        contentDescription = "Ganancias Semanales",
                        tint = Color.Green // Verde Neón para ganancias
                    )
                    Text(
                        text = "\$${String.format("%.2f", weeklyEarnings)}",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color.White // Blanco Puro para montos de dinero
                    )
                    Text(
                        text = "Esta semana",
                        style = MaterialTheme.typography.labelMedium,
                        color = Color(0xFFD0D0D0) // Gris más claro
                    )
                }
            }
        }
        
        // Monthly Earnings Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(100.dp),
            colors = CardDefaults.cardColors(
                containerColor = md_theme_dark_surfaceVariant
            ),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Ganancias Mensuales",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Medium,
                        color = Color.Yellow // Amarillo Brillante para ganancias mensuales
                    )
                    Text(
                        text = "\$${String.format("%.2f", monthlyEarnings)}",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = Color.White // Blanco Puro para montos de dinero
                    )
                }
                Icon(
                    imageVector = Icons.Default.BarChart,
                    contentDescription = "Gráfico de ganancias",
                    tint = Color.Yellow // Amarillo Brillante para ganancias mensuales
                )
            }
        }
        
        // Nuevos pedidos recibidos
        val allOrders by viewModel.orders.collectAsState()
        
        ReceivedOrdersSection(
            viewModel = viewModel,
            onOrderDetailClick = onOrderDetailClick
        )
        
        // Map Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp),
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
                
                // Radar effect in center
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(RoundedCornerShape(50))
                        .background(Color.Black.copy(alpha = 0.3f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationSearching,
                        contentDescription = "Radar",
                        modifier = Modifier
                            .size(40.dp),
                        tint = md_theme_dark_primary
                    )
                }
                
                // Floating action button for map
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.BottomEnd
                ) {
                    FloatingActionButton(
                        onClick = onMapClick,
                        modifier = Modifier
                            .padding(16.dp),
                        containerColor = md_theme_dark_primary,
                        contentColor = Color.White
                    ) {
                        Icon(
                            imageVector = Icons.Default.Map,
                            contentDescription = "Abrir Mapa"
                        )
                    }
                }
            }
        }
        
        // Botón de Iniciar Turno si no hay pedidos activos
        val activeOrders = allOrders.filter { order ->
            order.status in listOf("ACCEPTED", "ON_THE_WAY_TO_STORE", "ARRIVED_AT_STORE", "PICKING_UP_ORDER", "ON_THE_WAY_TO_CUSTOMER")
        }
        
        if (activeOrders.isEmpty()) {
            Button(
                onClick = { /* Acción para iniciar turno */ },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = md_theme_dark_primary
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text(
                    text = "¡Empezar a trabajar!",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Icon(
                    imageVector = Icons.Default.PlayArrow,
                    contentDescription = "Iniciar Turno",
                    modifier = Modifier.padding(start = 8.dp),
                    tint = Color.White
                )
            }
        }
        
        // Quick Action Buttons (convertidos a iconos)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            // Wallet Button
            Box(
                modifier = Modifier
                    .clickable { onWalletClick() }
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountBalanceWallet,
                        contentDescription = "Billetera",
                        tint = md_theme_dark_primary,
                        modifier = Modifier.size(32.dp)
                    )
                    Text(
                        text = "Billetera",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
            
            // Settings Button
            Box(
                modifier = Modifier
                    .clickable { onSettingsClick() }
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "Ajustes",
                        tint = md_theme_dark_primary,
                        modifier = Modifier.size(32.dp)
                    )
                    Text(
                        text = "Ajustes",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
            
            // Map Button
            Box(
                modifier = Modifier
                    .clickable { onMapClick() }
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Map,
                        contentDescription = "Mapa",
                        tint = md_theme_dark_primary,
                        modifier = Modifier.size(32.dp)
                    )
                    Text(
                        text = "Mapa",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
            
            // Support Button
            Box(
                modifier = Modifier
                    .clickable { onSupportClick() }
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Help,
                        contentDescription = "Soporte",
                        tint = md_theme_dark_primary,
                        modifier = Modifier.size(32.dp)
                    )
                    Text(
                        text = "Soporte",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        }
    }
    
    // Support FAB floating above bottom navigation
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.BottomEnd
    ) {
        FloatingActionButton(
            onClick = onSupportClick,
            modifier = Modifier
                .padding(bottom = 80.dp, end = 16.dp), // Positioned above bottom nav
            containerColor = md_theme_dark_primary,
            contentColor = Color.White
        ) {
            Icon(
                imageVector = Icons.Default.Message,
                contentDescription = "Soporte"
            )
        }
    }
}