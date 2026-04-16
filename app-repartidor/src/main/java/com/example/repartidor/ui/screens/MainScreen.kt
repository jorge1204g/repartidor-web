package com.example.repartidor.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.repartidor.data.model.DeliveryPerson
import com.example.repartidor.data.model.Order
import com.example.repartidor.ui.viewmodel.DeliveryViewModel
import com.example.repartidor.ui.screens.MapScreen
import com.example.repartidor.ui.screens.MessagesScreen
import com.example.repartidor.ui.screens.OrderDetailScreen
import com.example.repartidor.ui.screens.WalletScreen
import com.example.repartidor.ui.screens.SettingsScreen
import com.example.repartidor.utils.translateOrderStatus

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    deliveryPerson: DeliveryPerson?,
    viewModel: DeliveryViewModel,
    onLogout: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    var selectedOrder by remember { mutableStateOf<Order?>(null) }
    var showClientChat by remember { mutableStateOf(false) }
    var currentClientName by remember { mutableStateOf("") }
    var currentOrderId by remember { mutableStateOf("") }
    
    // Ganancias diarias - Movido aquí para que esté disponible en todo el composable
    val dailyEarnings by viewModel.dailyEarnings.collectAsState()
    val dailyOrdersCount by viewModel.dailyOrdersCount.collectAsState()
    
    Scaffold(
        bottomBar = {
            BottomNavigationComponent(
                selectedTab = selectedTab,
                onTabSelected = { tabIndex ->
                    selectedTab = tabIndex
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Top App Bar
            TopAppBar(
            title = { 
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Repartidor App")
                }
            },
            actions = {
                // Botón para alternar estado de conexión/desconexión
                deliveryPerson?.let { person ->
                    val isOnline = person.isOnline
                    // Switch para controlar el estado de conexión
                    Switch(
                        checked = isOnline,
                        onCheckedChange = { checked ->
                            // Alternar el estado de conexión
                            viewModel.updatePresence(checked, person.isActive)
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = MaterialTheme.colorScheme.primary,
                            checkedTrackColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
                            uncheckedThumbColor = MaterialTheme.colorScheme.onSurfaceVariant,
                            uncheckedTrackColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    )
                }
                
                IconButton(onClick = onLogout) {
                    Icon(
                        imageVector = Icons.Filled.ExitToApp,
                        contentDescription = "Cerrar Sesión"
                    )
                }
            }
        )
        
            
            // Content based on selected tab
            if (selectedOrder != null) {
                // Mostrar pantalla de detalles del pedido
                OrderDetailScreen(
                    order = selectedOrder!!,
                    deliveryPerson = deliveryPerson,
                    onBack = { selectedOrder = null },
                    viewModel = viewModel
                )
            } else {
                when (selectedTab) {
                    0 -> {
                        DashboardScreen(
                            dailyEarnings = dailyEarnings,
                            weeklyEarnings = viewModel.weeklyEarnings.collectAsState().value,
                            monthlyEarnings = viewModel.monthlyEarnings.collectAsState().value,
                            onMapClick = { /* Navigate to map */ },
                            onWalletClick = { /* Navigate to wallet */ },
                            onSettingsClick = { /* Navigate to settings */ },
                            onSupportClick = { /* Handle support click */ },
                            viewModel = viewModel,
                            onOrderDetailClick = { order ->
                                selectedOrder = order
                            }
                        )
                    }
                    1 -> OrderHistoryScreen(
                        deliveryId = viewModel.deliveryId.value ?: "",
                        viewModel = viewModel
                    )
                    2 -> {
                        if (showClientChat) {
                            ClientChatScreen(
                                viewModel = viewModel,
                                clientName = currentClientName,
                                orderId = currentOrderId,
                                onBack = {
                                    showClientChat = false
                                }
                            )
                        } else {
                            ClientChatListScreen(
                                viewModel = viewModel,
                                onBack = { /* Stay in main screen */ },
                                onClientClick = { clientName, orderId ->
                                    currentClientName = clientName
                                    currentOrderId = orderId
                                    showClientChat = true
                                }
                            )
                        }
                    }
                    3 -> MessagesScreen(
                        viewModel = viewModel,
                        onBackToDashboard = { /* Navigate back to dashboard */ }
                    )
                }
            }
        }
    }
}

@Composable
fun OrdersScreen(
    deliveryId: String,
    viewModel: DeliveryViewModel
) {
    val orders by viewModel.filteredOrders.collectAsState()
    var previousOrdersCount by remember { mutableIntStateOf(0) }
    var selectedOrder by remember { mutableStateOf<Order?>(null) }
    
    // Detectar nuevos pedidos y mostrar notificaciones
    LaunchedEffect(orders) {
        val newOrdersCount = orders.size - previousOrdersCount
        if (newOrdersCount > 0) {
            // Aquí podríamos llamar a la función de notificación si tuviéramos contexto
            // viewModel.showNotificationForNewOrder(context, newOrdersCount)
        }
        previousOrdersCount = orders.size
    }
    
    // Aquí conectar con Firebase para obtener pedidos reales
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        if (orders.isEmpty()) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.Info,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                
                Text(
                    text = "No tienes pedidos asignados",
                    style = MaterialTheme.typography.headlineSmall
                )
                
                Text(
                    text = "ID de Repartidor: $deliveryId",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.primary
                )
                
                Text(
                    text = "Espera a que el administrador te asigne pedidos",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(orders) { order ->
                    OrderItem(
                        order = order,
                        hasActiveOrder = orders.any { order -> 
                            order.status in listOf("ACCEPTED", "ON_THE_WAY_TO_STORE", "ARRIVED_AT_STORE", "PICKING_UP_ORDER", "ON_THE_WAY_TO_CUSTOMER")
                        },
                        onAccept = { orderId ->
                            viewModel.acceptOrder(orderId)
                        },
                        onGoToStore = { orderId ->
                            viewModel.goToStore(orderId)
                        },
                        onArrivedAtStore = { orderId ->
                            viewModel.arrivedAtStore(orderId)
                        },
                        onPickingUpOrder = { orderId ->
                            viewModel.pickingUpOrder(orderId)
                        },
                        onGoToCustomer = { orderId ->
                            viewModel.goToCustomer(orderId)
                        },
                        onDelivered = { orderId ->
                            viewModel.deliveredOrder(orderId)
                        },
                        onShowDetails = { order ->
                            selectedOrder = order
                        }
                    )
                }
            }
        }
    }
    
    // Mostrar detalles del pedido seleccionado
    val deliveryPerson by viewModel.deliveryPerson.collectAsState()
    selectedOrder?.let { order ->
        OrderDetailsModal(
            order = order,
            deliveryPerson = deliveryPerson,
            onDismiss = { selectedOrder = null }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderDetailsModal(
    order: Order,
    deliveryPerson: com.example.repartidor.data.model.DeliveryPerson?,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val snackbarHostState = remember { SnackbarHostState() }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { 
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Detalles del Pedido #${order.orderId.ifEmpty { order.id }}")
                IconButton(
                    onClick = {
                        val orderInfo = "Pedido #${order.orderId.ifEmpty { order.id }}\n" +
                                     "Cliente: ${order.customer.name}\n" +
                                     "Teléfono: ${order.customer.phone}\n" +
                                     "Restaurante: ${order.restaurantName}\n" +
                                     "Total: \$${String.format("%.2f", order.total)}"
                        clipboardManager.setText(AnnotatedString(orderInfo))
                        // Mostrar snackbar para informar que se copió
                    }
                ) {
                    Icon(Icons.Filled.ContentCopy, contentDescription = "Copiar info")
                }
            }
        },
        text = {
            Column {
                // Snackbar para mostrar mensajes
                SnackbarHost(
                    hostState = snackbarHostState,
                    modifier = Modifier
                        .align(Alignment.CenterHorizontally)
                        .padding(8.dp)
                )
                
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 500.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        // Botones de acción rápida
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                // Botón para llamar al cliente
                                Button(
                                    onClick = {
                                        val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${order.customer.phone}"))
                                        context.startActivity(intent)
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = MaterialTheme.colorScheme.primary
                                    )
                                ) {
                                    Icon(Icons.Filled.Phone, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Llamar al cliente")
                                }
                                
                                // Botón para ver ubicación del cliente
                                if (order.customerUrl.isNotEmpty()) {
                                    Button(
                                        onClick = {
                                            if (order.customerUrl.startsWith("http")) {
                                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(order.customerUrl))
                                                context.startActivity(intent)
                                            } else {
                                                clipboardManager.setText(AnnotatedString(order.customerUrl))
                                            }
                                        },
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = MaterialTheme.colorScheme.secondary
                                        )
                                    ) {
                                        Icon(Icons.Filled.LocationOn, contentDescription = null, modifier = Modifier.size(18.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Ubicación del cliente")
                                    }
                                }
                                
                                // Botón para ver dirección del restaurante
                                if (order.pickupLocationUrl.isNotEmpty()) {
                                    Button(
                                        onClick = {
                                            if (order.pickupLocationUrl.startsWith("http")) {
                                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(order.pickupLocationUrl))
                                                context.startActivity(intent)
                                            } else {
                                                clipboardManager.setText(AnnotatedString(order.pickupLocationUrl))
                                            }
                                        },
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = MaterialTheme.colorScheme.tertiary
                                        )
                                    ) {
                                        Icon(Icons.Filled.Restaurant, contentDescription = null, modifier = Modifier.size(18.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Dirección del restaurante")
                                    }
                                }
                                
                                // Botón para contactar al cliente por WhatsApp
                                Button(
                                    onClick = {
                                        val repartidorName = deliveryPerson?.name ?: "tu repartidor"
                                        val message = "Hola, soy ${repartidorName}, tu repartidor. Estoy en camino a entregar tu pedido. ¿Cómo estás?"
                                        val encodedMessage = Uri.encode(message)
                                        val formattedNumber = order.customer.phone.replace("[^+0-9]".toRegex(), "")
                                        val whatsappUrl = "https://wa.me/$formattedNumber?text=" + encodedMessage
                                        
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(whatsappUrl))
                                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                        
                                        try {
                                            context.startActivity(intent)
                                        } catch (e: Exception) {
                                            println("Error al abrir WhatsApp: ${'$'}{e.message}")
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = com.example.repartidor.ui.theme.WhatsAppGreen
                                    )
                                ) {
                                    Icon(Icons.Filled.Chat, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Contactar por WhatsApp")
                                }
                                
                                // Botón para ver destino del cliente
                                Button(
                                    onClick = {
                                        clipboardManager.setText(AnnotatedString(order.customer.phone))
                                        // Aquí podrías mostrar un snackbar indicando que se copió
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = MaterialTheme.colorScheme.secondary
                                    )
                                ) {
                                    Icon(Icons.Filled.ContentCopy, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Destino del cliente")
                                }
                                
                                
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss
            ) {
                Text("Cerrar")
            }
        },
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    )
}





@Composable
fun OrderItem(
    order: Order,
    hasActiveOrder: Boolean = false,
    onAccept: (String) -> Unit = {},
    onGoToStore: (String) -> Unit = {},
    onArrivedAtStore: (String) -> Unit = {},
    onPickingUpOrder: (String) -> Unit = {},
    onGoToCustomer: (String) -> Unit = {},
    onDelivered: (String) -> Unit = {},
    onShowDetails: (Order) -> Unit = {}
) {
    var showCodeDialog by remember { mutableStateOf(false) }
    var enteredCode by remember { mutableStateOf("") }
    var codeError by remember { mutableStateOf("") }
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onShowDetails(order) },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Título del pedido con numeración [#4.0]
            Text(
                text = "[#4.0] Pedido #${order.orderId.ifEmpty { order.id }}",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            // Estado del pedido con color según orderType y tipo de producto [#4.5]
            val firstItemName = if (order.items.isNotEmpty()) order.items[0].name else ""
            
            // Detectar tipo de pedido por contenido del producto
            val isMotorcycle = order.serviceType == "MOTORCYCLE_TAXI" || 
                firstItemName.contains("Motocicleta") || firstItemName.contains("Taxi")
            val isGasoline = firstItemName.contains("Combustible") || 
                firstItemName.contains("Gasolina") || firstItemName.contains("Magna") || 
                firstItemName.contains("Premium") || firstItemName.contains("Diesel")
            val isStationery = firstItemName.contains("Artículos")
            val isMedicine = firstItemName.contains("Medicamentos")
            val isBeerAndCigarettes = firstItemName.contains("Cervezas")
            val isWaterJugs = firstItemName.contains("Garrafones")
            val isGasLP = firstItemName.contains("Tanque") || firstItemName.contains("Gas LP") || 
                firstItemName.contains("Gas")
            val isServicePayment = firstItemName.contains("Tipo de pago")
            val isFavorOrGift = firstItemName.contains("Tipo de favor")
            
            val stateText = when {
                isMotorcycle -> "🏍️ Viaje en moto"
                isGasoline -> "⛽ Pedido de Gasolina"
                isStationery -> "📝 Pedido de Papelería"
                isMedicine -> "💊 Pedido de Medicamentos"
                isBeerAndCigarettes -> "🍺 Pedido de Cerveza y Cigarros"
                isWaterJugs -> "💧 Pedido de Garrafón de Agua"
                isGasLP -> "🔥 Pedido de Gas LP"
                isServicePayment -> "💳 Pago de Servicios"
                isFavorOrGift -> "🎁 Favor o Regalos"
                order.orderType == "MANUAL" && order.restaurantName == "Pedido del cliente" -> "🍔 Favor de comida"
                order.orderType == "MANUAL" -> "👨‍💼 Creado por Administrador"
                order.orderType == "RESTAURANT" -> "🍔 Favor de comida"
                else -> translateOrderStatus(order.status)
            }
            
            val stateColor = when {
                isMotorcycle -> Color(0xFFf093fb)
                isGasoline -> Color(0xFFFF6B35)
                isStationery -> Color(0xFF4ECDC4)
                isMedicine -> Color(0xFF95E1D3)
                isBeerAndCigarettes -> Color(0xFFF38181)
                isWaterJugs -> Color(0xFF00B4DB)
                isGasLP -> Color(0xFFFF4500)
                isServicePayment -> Color(0xFF6C63FF)
                isFavorOrGift -> Color(0xFFFF69B4)
                order.orderType == "MANUAL" -> Color(0xFFFF9800)
                order.orderType == "RESTAURANT" -> Color(0xFF9C27B0)
                else -> MaterialTheme.colorScheme.primary
            }
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = stateColor),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = "[#4.5] $stateText",
                    modifier = Modifier.padding(8.dp),
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
            }
            
            // Información del restaurante [#4.1]
            Text(
                text = "[#4.1] 🏪 Restaurante: ${order.restaurantName}",
                color = Color.White,
                fontWeight = FontWeight.Medium
            )
            
            // Ganancia [#4.2]
            Text(
                text = "[#4.2] 💰 Ganancia: \$${order.deliveryCost}",
                color = Color(0xFF4CAF50),
                fontWeight = FontWeight.Bold,
                fontSize = MaterialTheme.typography.bodyLarge.fontSize
            )
            
            // Productos o descripción del servicio [#4.3]
            if (order.items.isNotEmpty()) {
                // Detectar si es pedido de motocicleta
                val isMotorcycle = order.serviceType == "MOTORCYCLE_TAXI" || order.distance != null
                
                if (isMotorcycle) {
                    // Para servicio de motocicleta, mostrar la ruta
                    Text(
                        text = "[#4.3] 🏍️ Servicio de Motocicleta:",
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFf093fb)
                    )
                    // Mostrar primer elemento del array items (contiene la descripción de la ruta)
                    Text(
                        text = "  ${order.items[0].name}",
                        fontSize = MaterialTheme.typography.bodySmall.fontSize,
                        color = Color.White,
                        modifier = Modifier.padding(start = 8.dp)
                    )
                    // Mostrar distancia si está disponible
                    if (order.distance != null) {
                        Text(
                            text = "  Distancia: ${order.distance} km",
                            fontSize = MaterialTheme.typography.bodySmall.fontSize,
                            color = Color(0xFF9CA3AF),
                            modifier = Modifier.padding(start = 8.dp, top = 4.dp)
                        )
                    }
                } else {
                    // Para pedidos normales de restaurante, mostrar lista de productos
                    Text(
                        text = "[#4.3] Productos:",
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFf093fb)
                    )
                    order.items.forEach { item ->
                        Text(
                            text = "  • ${item.name} x${item.quantity} (\$${String.format("%.2f", item.unitPrice)} c/u)",
                            fontSize = MaterialTheme.typography.bodySmall.fontSize,
                            color = Color.White
                        )
                    }
                }
            }
            
            // Mensaje cuando el pedido está asignado manualmente pero no aceptado [#4.4]
            if (order.status in listOf("MANUAL_ASSIGNED", "ASSIGNED", "PENDING") && order.assignedToDeliveryId.isEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFC107).copy(alpha = 0.1f)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFFC107).copy(alpha = 0.3f))
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "⚠️",
                            fontSize = 20.sp
                        )
                        Text(
                            text = "[#4.4] Toca \"Aceptar Pedido\" para ver información de contacto y dirección",
                            color = Color(0xFFFFC107),
                            fontWeight = FontWeight.Medium,
                            fontSize = MaterialTheme.typography.bodySmall.fontSize
                        )
                    }
                }
            }
            
            // Mostrar botón según el estado actual del pedido
            when (order.status) {
                "MANUAL_ASSIGNED", "ASSIGNED", "PENDING" -> {
                    if (order.assignedToDeliveryId.isEmpty() && !hasActiveOrder) {
                        // Botón para aceptar pedido manualmente asignado [#3.1]
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = { onAccept(order.id) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp),
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF11998e)
                            ),
                            elevation = ButtonDefaults.buttonElevation(
                                defaultElevation = 6.dp,
                                pressedElevation = 4.dp
                            )
                        ) {
                            Icon(
                                imageVector = Icons.Filled.CheckCircle,
                                contentDescription = null,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = "[#3.1] Aceptar Pedido",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        }
                    } else if (order.assignedToDeliveryId.isEmpty() && hasActiveOrder) {
                        // Mostrar mensaje si hay un pedido activo
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Ya tienes un pedido activo. Finalízalo antes de aceptar otro.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }
                "ACCEPTED" -> {
                    // Botón para ir en camino al restaurante [#3.2]
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { onGoToStore(order.id) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFf093fb)
                        ),
                        elevation = ButtonDefaults.buttonElevation(
                            defaultElevation = 6.dp,
                            pressedElevation = 4.dp
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Filled.DirectionsBike,
                            contentDescription = null,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "[#3.2] 1. En camino al restaurante",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }
                "ON_THE_WAY_TO_STORE" -> {
                    // Botón para indicar que llegó al restaurante [#3.4]
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { onArrivedAtStore(order.id) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF2193b0)
                        ),
                        elevation = ButtonDefaults.buttonElevation(
                            defaultElevation = 6.dp,
                            pressedElevation = 4.dp
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Store,
                            contentDescription = null,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "[#3.4] 2. Llegué al restaurante",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }
                "ARRIVED_AT_STORE" -> {
                    // Botón para indicar que el repartidor tiene los alimentos [#3.5]
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { onPickingUpOrder(order.id) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF8e2de2)
                        ),
                        elevation = ButtonDefaults.buttonElevation(
                            defaultElevation = 6.dp,
                            pressedElevation = 4.dp
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Filled.ShoppingBag,
                            contentDescription = null,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "[#3.5] 3. Repartidor con alimentos en mochila",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }
                "PICKING_UP_ORDER" -> {
                    // Botón para indicar que va en camino al cliente [#3.6]
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { onGoToCustomer(order.id) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF00c6ff)
                        ),
                        elevation = ButtonDefaults.buttonElevation(
                            defaultElevation = 6.dp,
                            pressedElevation = 4.dp
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Filled.DirectionsBike,
                            contentDescription = null,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "[#3.6] 4. En camino al cliente",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }
                "ON_THE_WAY_TO_CUSTOMER" -> {
                    // Botón para indicar que el pedido fue entregado [#3.7]
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { showCodeDialog = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFcb2d3e)
                        ),
                        elevation = ButtonDefaults.buttonElevation(
                            defaultElevation = 6.dp,
                            pressedElevation = 4.dp
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Filled.CheckCircle,
                            contentDescription = null,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "[#3.7] 5. Pedido entregado",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
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
                                            onDelivered(order.id)
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
                "DELIVERED" -> {
                    // Estado final, mostrar mensaje
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Pedido completado",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderDetailScreen(
    order: Order,
    deliveryPerson: com.example.repartidor.data.model.DeliveryPerson?,
    onBack: () -> Unit,
    viewModel: DeliveryViewModel
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Detalles del Pedido #${order.orderId}") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Volver")
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                // Botones de acción
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Botón para llamar al cliente
                        Button(
                            onClick = {
                                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${order.customer.phone}"))
                                context.startActivity(intent)
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary
                            )
                        ) {
                            Icon(Icons.Filled.Phone, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Llamar al cliente")
                        }
                        
                        // Botón para ver ubicación del cliente
                        if (order.customerUrl.isNotEmpty()) {
                            Button(
                                onClick = {
                                    if (order.customerUrl.startsWith("http")) {
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(order.customerUrl))
                                        context.startActivity(intent)
                                    } else {
                                        clipboardManager.setText(AnnotatedString(order.customerUrl))
                                    }
                                },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.secondary
                                )
                            ) {
                                Icon(Icons.Filled.LocationOn, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Ubicación del cliente")
                            }
                        }
                        
                        // Botón para ver dirección del restaurante
                        if (order.pickupLocationUrl.isNotEmpty()) {
                            Button(
                                onClick = {
                                    if (order.pickupLocationUrl.startsWith("http")) {
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(order.pickupLocationUrl))
                                        context.startActivity(intent)
                                    } else {
                                        clipboardManager.setText(AnnotatedString(order.pickupLocationUrl))
                                    }
                                },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.tertiary
                                )
                            ) {
                                Icon(Icons.Filled.Restaurant, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Dirección del restaurante")
                            }
                        }
                        
                        // Botón para ver destino del cliente
                        Button(
                            onClick = {
                                clipboardManager.setText(AnnotatedString(order.customer.phone))
                                // Aquí podrías mostrar un snackbar indicando que se copió
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.secondary
                            )
                        ) {
                            Icon(Icons.Filled.ContentCopy, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Destino del cliente")
                        }
                    }
                }
            }
            
            item {
                // Información del pedido
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Datos del Pedido",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Text("Restaurante: ${order.restaurantName}", color = Color.White)
                        
                        if (order.deliveryAddress.isNotEmpty()) {
                            Text("Dirección de entrega: ${order.deliveryAddress}", color = Color.White)
                        }
                        
                        if (order.items.isNotEmpty()) {
                            // Detectar si es pedido de motocicleta
                            val isMotorcycle = order.serviceType == "MOTORCYCLE_TAXI" || order.distance != null
                            
                            if (isMotorcycle) {
                                Text(
                                    text = "🏍️ Servicio de Motocicleta:",
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFF4CAF50)
                                )
                                Text(
                                    text = "  ${order.items[0].name}",
                                    color = Color.White
                                )
                                if (order.distance != null) {
                                    Text(
                                        text = "  Distancia: ${order.distance} km",
                                        color = Color(0xFF9CA3AF),
                                        fontSize = MaterialTheme.typography.bodySmall.fontSize
                                    )
                                }
                            } else {
                                Text(
                                    text = "Productos:",
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color.White
                                )
                                order.items.forEach { item ->
                                    Text("• ${item.name} x${item.quantity} - \$${item.subtotal}", color = Color.White)
                                }
                            }
                        }
                        
                        Text("Método de pago: ${order.paymentMethod}", color = Color.White)
                        
                        if (order.deliveryReferences.isNotEmpty()) {
                            Text("Referencias del domicilio: ${order.deliveryReferences}", color = Color.White)
                        }
                        
                        Text("Ganancia: \$${order.deliveryCost}", color = Color.White)
                    }
                }
            }
            
            item {
                // Botón para contactar al cliente por WhatsApp
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Contactar al cliente",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Button(
                            onClick = {
                                val message = "Hola, soy ${deliveryPerson?.name}, tu repartidor. Estoy en camino a entregar tu pedido. ¿Cómo estás?"
                                val formattedNumber = order.customer.phone.replace("[^+0-9]".toRegex(), "")
                                val whatsappUrl = "https://wa.me/$formattedNumber?text=${Uri.encode(message)}"
                                
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(whatsappUrl))
                                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                
                                try {
                                    context.startActivity(intent)
                                } catch (e: Exception) {
                                    // Si no se puede abrir WhatsApp, mostrar mensaje
                                    println("Error al abrir WhatsApp: ${e.message}")
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = com.example.repartidor.ui.theme.WhatsAppGreen
                            )
                        ) {
                            Icon(Icons.Filled.Chat, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Contactar por WhatsApp")
                        }
                    }
                }
            }
            
            // Botones de estado basados en el estado actual del pedido
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Actualizar Estado",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        
                        when (order.status) {
                            "MANUAL_ASSIGNED" -> {
                                if (order.assignedToDeliveryId.isEmpty()) {
                                    Button(
                                        onClick = { viewModel.acceptOrder(order.id) },
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = com.example.repartidor.ui.theme.PrimaryGreen
                                        )
                                    ) {
                                        Text("Aceptar Pedido")
                                    }
                                }
                            }
                            "ACCEPTED" -> {
                                Button(
                                    onClick = { viewModel.goToStore(order.id) },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = com.example.repartidor.ui.theme.SecondaryGreen
                                    )
                                ) {
                                    Text("1. En camino al restaurante")
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
                                    Text("2. Llegué al restaurante")
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
                                    Text("3. Repartidor con alimentos en mochila")
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
                                    Text("4. En camino al cliente")
                                }
                            }
                            "ON_THE_WAY_TO_CUSTOMER" -> {
                                Button(
                                    onClick = { viewModel.deliveredOrder(order.id) },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = com.example.repartidor.ui.theme.DangerRed
                                    )
                                ) {
                                    Text("5. Pedido entregado")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun OrderHistoryScreen(
    deliveryId: String,
    viewModel: DeliveryViewModel
) {
    val completedOrders by viewModel.completedOrders.collectAsState()
    
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        if (completedOrders.isEmpty()) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.Info,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                
                Text(
                    text = "No tienes pedidos completados",
                    style = MaterialTheme.typography.headlineSmall
                )
                
                Text(
                    text = "Los pedidos completados aparecerán aquí",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(completedOrders) { order ->
                    CompletedOrderItem(
                        order = order
                    )
                }
            }
        }
    }
}

@Composable
fun CompletedOrderItem(
    order: Order
) {
    Card(
        modifier = Modifier
            .fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Pedido #${order.orderId.ifEmpty { order.id }}",
                style = MaterialTheme.typography.titleMedium
            )
            Text(text = "Cliente: ${order.customer.name}", color = Color.White)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(text = "Teléfono: ${order.customer.phone}", color = Color.White)
                Text(text = "Ganancia: \$${order.deliveryCost}", color = MaterialTheme.colorScheme.primary)
            }
            Text(text = "Restaurante: ${order.restaurantName}", color = Color.White)
            Text(text = "Total: \$${order.total}", color = Color.White)
            Text(text = "Fecha: ${order.dateTime}", color = Color.White)
            if (order.items.isNotEmpty()) {
                Text(text = "Producto: ${order.items[0].name}", fontSize = MaterialTheme.typography.bodySmall.fontSize, color = Color.White)
            }
            if (order.deliveryAddress.isNotEmpty()) {
                Text(text = "Dir. Entrega: ${order.deliveryAddress}", fontSize = MaterialTheme.typography.bodySmall.fontSize, color = Color.White)
            }
            Text(
                text = "Estado: ${order.status}",
                color = MaterialTheme.colorScheme.secondary
            )
        }
    }
}

@Composable
fun ProfileScreen(deliveryPerson: DeliveryPerson?) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        deliveryPerson?.let { person ->
            Card {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Información de Perfil",
                        style = MaterialTheme.typography.titleLarge
                    )
                    Text(
                        text = "Nombre: ${person.name}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "Teléfono: ${person.phone}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "ID: ${person.id}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "Estado de Aprobación: ${if (person.isApproved) "Aprobado" else "No Aprobado"}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (person.isApproved) MaterialTheme.colorScheme.primary 
                               else MaterialTheme.colorScheme.error
                    )
                    Text(
                        text = "Fecha de Registro: ${person.registrationDate}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "Correo Electrónico: ${person.email}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "Estado: ${if (person.isActive) "Trabajando" else "Inactivo"}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (person.isActive) MaterialTheme.colorScheme.primary 
                               else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
        
        Card {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Instrucciones",
                    style = MaterialTheme.typography.titleLarge
                )
                Text(
                    text = "• Mantén la app abierta para recibir pedidos",
                    style = MaterialTheme.typography.bodyMedium
                )
                Text(
                    text = "• Acepta los pedidos asignados",
                    style = MaterialTheme.typography.bodyMedium
                )
                Text(
                    text = "• Actualiza el estado del pedido durante la entrega",
                    style = MaterialTheme.typography.bodyMedium
                )
                Text(
                    text = "• Contacta al administrador si tienes problemas",
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
}