package com.example.aplicacionnuevaprueba1.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Circle
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Pending
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api

import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ClipboardManager
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.TopAppBarDefaults
import com.example.aplicacionnuevaprueba1.data.model.Order
import com.example.aplicacionnuevaprueba1.data.model.OrderStatus
import com.example.aplicacionnuevaprueba1.data.model.DeliveryPerson
import com.example.aplicacionnuevaprueba1.data.model.Restaurant
import com.example.aplicacionnuevaprueba1.data.model.Client
import com.example.aplicacionnuevaprueba1.ui.theme.CardBackground
import com.example.aplicacionnuevaprueba1.ui.theme.WarningAmber
import com.example.aplicacionnuevaprueba1.ui.theme.DangerRed
import com.example.aplicacionnuevaprueba1.ui.theme.SuccessGreen
import com.example.aplicacionnuevaprueba1.ui.screens.MessagesScreen
import com.example.aplicacionnuevaprueba1.ui.viewmodel.AdminViewModel
import com.example.aplicacionnuevaprueba1.utils.OrderParser
import com.example.aplicacionnuevaprueba1.utils.WhatsAppLinkGenerator
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

fun OrderStatus.toSpanish(): String {
    return when (this) {
        OrderStatus.PENDING -> "Pendiente"
        OrderStatus.ASSIGNED -> "Asignado"
        OrderStatus.MANUAL_ASSIGNED -> "Asignado Manualmente"
        OrderStatus.ACCEPTED -> "Aceptado"
        OrderStatus.ON_THE_WAY_TO_STORE -> "En Camino al Restaurante"
        OrderStatus.ARRIVED_AT_STORE -> "Llegó al Restaurante"
        OrderStatus.PICKING_UP_ORDER -> "Recogiendo Pedido"
        OrderStatus.ON_THE_WAY_TO_CUSTOMER -> "En Camino al Cliente"
        OrderStatus.DELIVERED -> "Entregado"
        OrderStatus.CANCELLED -> "Cancelado"
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminScreen(viewModel: AdminViewModel) {
    val orders by viewModel.orders.collectAsState()
    val deliveryPersons by viewModel.deliveryPersons.collectAsState()
    val restaurants by viewModel.restaurants.collectAsState()
    val message by viewModel.message.collectAsState()
    
    var selectedTab by remember { mutableStateOf(0) }
    
    message?.let {
        LaunchedEffect(it) {
            viewModel.clearMessage()
        }
        Snackbar(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(it)
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text("App Administrador ", fontSize = MaterialTheme.typography.titleMedium.fontSize)
                        Text("🚚", fontSize = MaterialTheme.typography.titleMedium.fontSize) // Emoticón como en la app del repartidor
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF34C759), // Usar el color verde de la app del repartidor (md_theme_dark_primary)
                    titleContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Añadir espacio superior para mejor visibilidad de las pestañas
            Spacer(modifier = Modifier.height(4.dp))  // Reducir espacio superior para bajar las pestañas
            TabRow(
                selectedTabIndex = selectedTab,
                modifier = Modifier.padding(horizontal = 8.dp)  // Añadir padding horizontal
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { 
                        Text(
                            "Pedidos",
                            fontWeight = FontWeight.Bold,  // Hacer el texto más destacado
                            fontSize = MaterialTheme.typography.titleMedium.fontSize  // Aumentar tamaño de fuente
                        )
                    }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { 
                        Text(
                            "Pegar Pedido",
                            fontWeight = FontWeight.Bold,
                            fontSize = MaterialTheme.typography.titleMedium.fontSize
                        )
                    }
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    text = { 
                        Text(
                            "Crear Manual",
                            fontWeight = FontWeight.Bold,
                            fontSize = MaterialTheme.typography.titleMedium.fontSize
                        )
                    }
                )
                Tab(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    text = { 
                        Text(
                            "Repartidores",
                            fontWeight = FontWeight.Bold,
                            fontSize = MaterialTheme.typography.titleMedium.fontSize
                        )
                    }
                )
                Tab(
                    selected = selectedTab == 4,
                    onClick = { selectedTab = 4 },
                    text = { 
                        Text(
                            "Clientes",
                            fontWeight = FontWeight.Bold,
                            fontSize = MaterialTheme.typography.titleMedium.fontSize
                        )
                    }
                )
                Tab(
                    selected = selectedTab == 5,
                    onClick = { selectedTab = 5 },
                    text = { 
                        Text(
                            "Restaurantes",
                            fontWeight = FontWeight.Bold,
                            fontSize = MaterialTheme.typography.titleMedium.fontSize
                        )
                    }
                )
                Tab(
                    selected = selectedTab == 6,
                    onClick = { selectedTab = 6 },
                    text = { 
                        Text(
                            "Mensajes",
                            fontWeight = FontWeight.Bold,
                            fontSize = MaterialTheme.typography.titleMedium.fontSize
                        )
                    }
                )
            }
            Spacer(modifier = Modifier.height(4.dp))  // Espacio adicional bajo las pestañas
            
            when (selectedTab) {
                0 -> {
                    // Show active orders and history tabs within the orders section
                    OrdersMainScreen(viewModel)
                }
                1 -> PasteOrderScreen(viewModel)
                2 -> CreateOrderScreen(viewModel)
                3 -> DeliveryPersonsManagementScreen(deliveryPersons, viewModel)
                4 -> ClientsManagementScreen(viewModel)
                5 -> RestaurantsManagementScreen(restaurants, viewModel)
                6 -> MessagesScreen(deliveryPersons, viewModel)
            }
        }
    }
}

@Composable
fun OrdersMainScreen(viewModel: AdminViewModel) {
    val activeOrders by viewModel.activeOrders.collectAsState()
    val orderHistory by viewModel.orderHistory.collectAsState()
    val deliveryPersons by viewModel.deliveryPersons.collectAsState()
    
    var selectedOrderTab by remember { mutableStateOf(0) }
    
    Column(modifier = Modifier.fillMaxSize()) {
        // Tabs for Active Orders and History
        TabRow(selectedTabIndex = selectedOrderTab) {
            Tab(
                selected = selectedOrderTab == 0,
                onClick = { selectedOrderTab = 0 },
                text = { Text("Activos (${activeOrders.size})") }
            )
            Tab(
                selected = selectedOrderTab == 1,
                onClick = { selectedOrderTab = 1 },
                text = { Text("Historial (${orderHistory.size})") }
            )
        }
        
        when (selectedOrderTab) {
            0 -> OrdersListScreen(activeOrders, deliveryPersons, viewModel)
            1 -> OrdersListScreen(orderHistory, deliveryPersons, viewModel)
        }
    }
}

@Composable
fun OrdersListScreen(
    orders: List<Order>,
    deliveryPersons: List<DeliveryPerson>,
    viewModel: AdminViewModel
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(items = orders, key = { it.id }) { order ->
            OrderCard(order, deliveryPersons, viewModel)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderCard(
    order: Order,
    deliveryPersons: List<DeliveryPerson>,
    viewModel: AdminViewModel
) {
    var showDialog by remember { mutableStateOf(false) }
    var showDeleteDialog by remember { mutableStateOf(false) }
    var showOrderDetails by remember { mutableStateOf(false) }
    val context = LocalContext.current
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = { showOrderDetails = true },
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
        colors = CardDefaults.cardColors(
            containerColor = com.example.aplicacionnuevaprueba1.ui.theme.CardBackground
        )
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text = "Pedido #${order.orderId}",
                style = MaterialTheme.typography.titleMedium
            )
            Text(text = "Restaurante: ${order.restaurantName}")
            Text(text = "Cliente: ${order.customer.name}")
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(text = "Teléfono: ${order.customer.phone}")
                Text(text = "Ganancia: $${order.deliveryCost}", color = MaterialTheme.colorScheme.primary)
            }
            Text(text = "Total: $${order.total}")
            
            order.items.forEach { item ->
                Text(text = "• ${item.name} x${item.quantity} - $${item.subtotal}")
            }
            
            if (order.items.isNotEmpty()) {
                Text(text = "Producto: ${order.items[0].name}", fontSize = MaterialTheme.typography.bodySmall.fontSize)
            }
            if (order.deliveryAddress.isNotEmpty()) {
                Text(text = "Dir. Entrega: ${order.deliveryAddress}", fontSize = MaterialTheme.typography.bodySmall.fontSize)
            }
            if (order.pickupLocationUrl.isNotEmpty()) {
                Text(text = "URL Recojo: ${order.pickupLocationUrl}", fontSize = MaterialTheme.typography.bodySmall.fontSize)
            }
            if (order.customerUrl.isNotEmpty()) {
                Text(text = "URL Cliente: ${order.customerUrl}", fontSize = MaterialTheme.typography.bodySmall.fontSize)
            }
            if (order.deliveryReferences.isNotEmpty()) {
                Text(text = "Refs. Entrega: ${order.deliveryReferences}", fontSize = MaterialTheme.typography.bodySmall.fontSize)
            }
            
            Text(
                text = "Estado: ${order.status.toSpanish()}",
                color = when (order.status) {
                    OrderStatus.PENDING -> MaterialTheme.colorScheme.error
                    OrderStatus.ASSIGNED -> MaterialTheme.colorScheme.primary
                    OrderStatus.MANUAL_ASSIGNED -> MaterialTheme.colorScheme.tertiary
                    OrderStatus.ACCEPTED -> MaterialTheme.colorScheme.primary
                    OrderStatus.ON_THE_WAY_TO_STORE -> MaterialTheme.colorScheme.primary
                    OrderStatus.ARRIVED_AT_STORE -> MaterialTheme.colorScheme.primary
                    OrderStatus.PICKING_UP_ORDER -> MaterialTheme.colorScheme.tertiary
                    OrderStatus.ON_THE_WAY_TO_CUSTOMER -> MaterialTheme.colorScheme.tertiary
                    OrderStatus.DELIVERED -> MaterialTheme.colorScheme.secondary
                    OrderStatus.CANCELLED -> MaterialTheme.colorScheme.outline
                }
            )
            
            if (order.assignedToDeliveryName.isNotEmpty()) {
                Text(text = "Repartidor: ${order.assignedToDeliveryName}")
            }
            
            // Botones de acción
            if (order.status != OrderStatus.DELIVERED && order.status != OrderStatus.CANCELLED) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Button(
                        onClick = { viewModel.cancelOrder(order.id) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = com.example.aplicacionnuevaprueba1.ui.theme.WarningAmber
                        )
                    ) {
                        Text(
                            text = "Cancelar",
                            fontWeight = FontWeight.Bold
                        )
                    }
                    
                    Button(
                        onClick = { showDeleteDialog = true },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = com.example.aplicacionnuevaprueba1.ui.theme.DangerRed
                        )
                    ) {
                        Text(
                            text = "Eliminar",
                            fontWeight = FontWeight.Bold
                        )
                    }
                    
                    // Botón NUEVO para compartir pedido con repartidores por WhatsApp
                    IconButton(
                        onClick = {
                            // Formatear fecha y hora de creación del pedido
                            val creationDateTime = formatOrderCreationTime(order.id.toLongOrNull() ?: System.currentTimeMillis())
                            
                            val message = "🚨 *¡NUEVO PEDIDO CREADO!* 🚨\n\n" +
                                         "📦 Pedido #: *#${order.orderId}*\n" +
                                         "📅 Fecha/Hora: *${creationDateTime}*\n\n" +
                                         "🏪 Restaurante: ${order.restaurantName}\n\n" +
                                         "🛍️ Producto: ${order.items.joinToString(", ") { "${it.name} (x${it.quantity})" }}\n\n" +
                                         "🚴 Envío: *\$${String.format("%.2f", order.deliveryCost)}*\n\n" +
                                         "🌐 Revisa tu pedido en la app web del repartidor:\n" +
                                         "https://repartidor-web.vercel.app/\n\n" +
                                         "_Entra con tu ID y revisa los datos del cliente_"
                            
                            // Abrir WhatsApp para seleccionar contacto/grupo SIN número específico
                            val encodedMessage = Uri.encode(message)
                            val whatsappUrl = "https://wa.me/?text=${encodedMessage}"
                            
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(whatsappUrl))
                            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                            context.startActivity(intent)
                        },
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(
                            Icons.Filled.Share,
                            contentDescription = "Compartir pedido con repartidores",
                            tint = Color(0xFF25D366)  // WhatsApp Green
                        )
                    }
                    
                    // Botón para compartir enlace de WhatsApp
                    IconButton(
                        onClick = {
                            val message = "Estado del pedido #${order.orderId}: Su pedido está actualmente en estado ${order.status.name}."
                            WhatsAppLinkGenerator.openWhatsAppDirectly(context, order.customer.phone, message)
                        },
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(
                            Icons.Filled.Send,
                            contentDescription = "Compartir seguimiento por WhatsApp",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                    
                    // Menú desplegable para mensajes personalizados por estado
                    Box {
                        var expanded by remember { mutableStateOf(false) }
                        
                        IconButton(onClick = { expanded = true }) {
                            Icon(
                                Icons.Filled.MoreVert,
                                contentDescription = "Mensajes personalizados"
                            )
                        }
                        
                        DropdownMenu(
                            expanded = expanded,
                            onDismissRequest = { expanded = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("1. En camino al restaurante") },
                                onClick = {
                                    expanded = false
                                    val message = "Hola, tu repartidor asignado es ${order.assignedToDeliveryName} y tu repartidor va en camino al restaurante para recoger tu pedido."
                                    WhatsAppLinkGenerator.openWhatsAppDirectly(context, order.customer.phone, message)
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("2. Preparando pedido") },
                                onClick = {
                                    expanded = false
                                    val message = "Hola, tu pedido está siendo preparado en este momento. Tu repartidor ${order.assignedToDeliveryName} espera por ti."
                                    WhatsAppLinkGenerator.openWhatsAppDirectly(context, order.customer.phone, message)
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("3. Pedido listo para recoger") },
                                onClick = {
                                    expanded = false
                                    val message = "Hola, tu pedido ya está listo para ser recogido. Tu repartidor ${order.assignedToDeliveryName} está por recogerlo."
                                    WhatsAppLinkGenerator.openWhatsAppDirectly(context, order.customer.phone, message)
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("4. En camino a tu ubicación") },
                                onClick = {
                                    expanded = false
                                    val message = "Hola, tu repartidor ${order.assignedToDeliveryName} ya recogió tu pedido y está en camino a tu ubicación. ¡Pronto recibirás tu pedido!"
                                    WhatsAppLinkGenerator.openWhatsAppDirectly(context, order.customer.phone, message)
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("5. Pedido entregado") },
                                onClick = {
                                    expanded = false
                                    val message = "Hola, tu pedido ha sido entregado con éxito. Gracias por confiar en nuestro servicio."
                                    WhatsAppLinkGenerator.openWhatsAppDirectly(context, order.customer.phone, message)
                                }
                            )
                        }
                    }
                }
            }
        }
    }
    
    // Modal de detalles del pedido
    if (showOrderDetails) {
        OrderDetailsModal(
            order = order,
            onDismiss = { showOrderDetails = false },
            onAssignClick = { 
                showOrderDetails = false
                showDialog = true 
            }
        )
    }
    
    if (showDialog) {
        AssignDeliveryDialog(
            order = order,
            deliveryPersons = deliveryPersons,
            onDismiss = { showDialog = false },
            onAssign = { deliveryPerson ->
                viewModel.assignOrder(order, deliveryPerson)
                showDialog = false
            },
            onAssignManual = { deliveryIds ->
                viewModel.assignOrderManually(order.id, deliveryIds)
            }
        )
    }
    
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("¿Eliminar Pedido?") },
            text = { Text("Esta acción no se puede deshacer. El pedido se eliminará permanentemente.") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteOrder(order.id)
                        showDeleteDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Eliminar")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderDetailsModal(
    order: Order,
    onDismiss: () -> Unit,
    onAssignClick: () -> Unit
) {
    val context = LocalContext.current
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Detalles del Pedido #${order.orderId}") },
        text = {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 400.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    // Información general del pedido
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp)
                        ) {
                            Text(
                                text = "Información General",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text("Estado: ${order.status.toSpanish()}")
                            Text("ID Pedido: ${order.id}")
                            Text("ID Pedido Externo: ${order.orderId}")
                            Text("Fecha/Hora: ${order.dateTime}")
                        }
                    }
                    
                    // Mostrar código del cliente si existe
                    if (order.customerCode.isNotEmpty()) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp)
                            ) {
                                Text(
                                    text = "Código del Cliente",
                                    style = MaterialTheme.typography.titleMedium
                                )
                                Text("Código: ${order.customerCode}")
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                    
                    // Botón para compartir datos del pedido por WhatsApp
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = {
                            // Crear mensaje con los datos solicitados
                            val message = "Detalles del Pedido:\n" +
                                         "Teléfono: ${order.customer.phone}\n" +
                                         "Restaurante: ${order.restaurantName}\n" +
                                         "URL del Maps donde hay que recojer: ${order.pickupLocationUrl}\n" +
                                         "Dirección de entrega: ${order.deliveryAddress}\n" +
                                         "Referencias de entrega: ${order.deliveryReferences}\n" +
                                         "URL del cliente: ${order.customerUrl}\n" +
                                         "Método de pago: ${order.paymentMethod}\n" +
                                         "Costo de envío: \$${String.format("%.2f", order.deliveryCost)}\n" +
                                         "Código del cliente: ${order.customerCode}\n" +
                                         "Productos: " + order.items.joinToString(", ") { "${it.name} (x${it.quantity})" }
                            
                            // Abrir WhatsApp para enviar a cualquier número
                            val encodedMessage = Uri.encode(message)
                            val whatsappUrl = "https://wa.me/?text=${encodedMessage}"
                            
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(whatsappUrl))
                            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                            
                            try {
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                println("Error al abrir WhatsApp: ${e.message}")
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF25D366)  // WhatsApp Green
                        )
                    ) {
                        Icon(Icons.Filled.Share, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Compartir datos del pedido por WhatsApp")
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Información del cliente
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp)
                        ) {
                            Text(
                                text = "Cliente",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text("Nombre: ${order.customer.name}")
                            Text("Teléfono: ${order.customer.phone}")
                            Text("Email: ${order.customer.email}")
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Información del restaurante
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp)
                        ) {
                            Text(
                                text = "Restaurante",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text("Nombre: ${order.restaurantName}")
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Detalles del pago
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp)
                        ) {
                            Text(
                                text = "Detalles de Pago",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text("Método de Pago: ${order.paymentMethod}")
                            Text("Subtotal: $${String.format("%.2f", order.subtotal)}")
                            Text("Costo de Envío: $${String.format("%.2f", order.deliveryCost)}")
                            Text("Total: $${String.format("%.2f", order.total)}")
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Productos del pedido
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp)
                        ) {
                            Text(
                                text = "Productos",
                                style = MaterialTheme.typography.titleMedium
                            )
                            if (order.items.isNotEmpty()) {
                                order.items.forEach { item ->
                                    Text("• ${item.name}")
                                    Text("  Cantidad: ${item.quantity}, Precio unitario: $${String.format("%.2f", item.unitPrice)}, Subtotal: $${String.format("%.2f", item.subtotal)}")
                                }
                            } else {
                                Text("No hay productos")
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Información de ubicación
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp)
                        ) {
                            Text(
                                text = "Ubicación",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text("Latitud: ${order.customerLocation.latitude}")
                            Text("Longitud: ${order.customerLocation.longitude}")
                            
                            // Añadir información adicional de ubicación
                            if (order.pickupLocationUrl.isNotEmpty()) {
                                if (order.pickupLocationUrl.startsWith("http")) {
                                    // Si es una URL de Maps, hacerla clickeable
                                    Text(
                                        text = "URL de Recojo: ${order.pickupLocationUrl}",
                                        modifier = Modifier.clickable {
                                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(order.pickupLocationUrl))
                                            context.startActivity(intent)
                                        },
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                } else {
                                    Text("URL de Recojo: ${order.pickupLocationUrl}")
                                }
                            }
                            
                            if (order.deliveryAddress.isNotEmpty()) {
                                Text("Dirección de Entrega: ${order.deliveryAddress}")
                            }
                            
                            if (order.customerUrl.isNotEmpty()) {
                                if (order.customerUrl.startsWith("http")) {
                                    // Si es una URL de Maps, hacerla clickeable
                                    Text(
                                        text = "URL del Cliente: ${order.customerUrl}",
                                        modifier = Modifier.clickable {
                                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(order.customerUrl))
                                            context.startActivity(intent)
                                        },
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                } else {
                                    Text("URL del Cliente: ${order.customerUrl}")
                                }
                            }
                            
                            if (order.deliveryReferences.isNotEmpty()) {
                                Text("Referencias de Entrega: ${order.deliveryReferences}")
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Información de asignación
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp)
                        ) {
                            Text(
                                text = "Asignación",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text("Repartidor Asignado: ${order.assignedToDeliveryName}")
                            Text("ID Repartidor: ${order.assignedToDeliveryId}")
                            Text("Candidatos: ${order.candidateDeliveryIds.size}")
                        }
                    }
                }
            }
        },
        confirmButton = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Botón NUEVO para compartir pedido con repartidores por WhatsApp
                IconButton(
                    onClick = {
                        // Formatear fecha y hora de creación del pedido
                        val creationDateTime = formatOrderCreationTime(order.id.toLongOrNull() ?: System.currentTimeMillis())
                        
                        val message = "🚨 *¡NUEVO PEDIDO CREADO!* 🚨\n\n" +
                                     "📦 Pedido #: *#${order.orderId}*\n" +
                                     "📅 Fecha/Hora: *${creationDateTime}*\n\n" +
                                     "🏪 Restaurante: ${order.restaurantName}\n\n" +
                                     "🛍️ Producto: ${order.items.joinToString(", ") { "${it.name} (x${it.quantity})" }}\n\n" +
                                     "🚴 Envío: *\$${String.format("%.2f", order.deliveryCost)}*\n\n" +
                                     "🌐 Revisa tu pedido en la app web del repartidor:\n" +
                                     "https://repartidor-web.vercel.app/\n\n" +
                                     "_Entra con tu ID y revisa los datos del cliente_"
                        
                        // Abrir WhatsApp para seleccionar contacto/grupo SIN número específico
                        val encodedMessage = Uri.encode(message)
                        val whatsappUrl = "https://wa.me/?text=${encodedMessage}"
                        
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(whatsappUrl))
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        context.startActivity(intent)
                    },
                    modifier = Modifier.size(48.dp)
                ) {
                    Icon(
                        Icons.Filled.Share,
                        contentDescription = "Compartir pedido con repartidores",
                        tint = Color(0xFF25D366)  // WhatsApp Green
                    )
                }
                
                Spacer(modifier = Modifier.width(4.dp))
                
                // Botón de compartir por WhatsApp
                IconButton(
                    onClick = {
                        val message = "Estado del pedido #${order.orderId}: Su pedido está actualmente en estado ${order.status.name}."
                        WhatsAppLinkGenerator.openWhatsAppDirectly(context, order.customer.phone, message)
                    },
                    modifier = Modifier.size(48.dp)
                ) {
                    Icon(
                        Icons.Filled.Send,
                        contentDescription = "Compartir seguimiento por WhatsApp",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                
                Spacer(modifier = Modifier.width(8.dp))
                
                // Botón de acción principal
                if (order.status == OrderStatus.PENDING) {
                    Button(
                        onClick = onAssignClick,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Asignar Pedido")
                    }
                } else {
                    Button(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cerrar")
                    }
                }
            }
        },
        dismissButton = {
            TextButton(
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
fun AssignDeliveryDialog(
    order: Order,
    deliveryPersons: List<DeliveryPerson>,
    onDismiss: () -> Unit,
    onAssign: (DeliveryPerson) -> Unit,
    onAssignManual: ((List<String>) -> Unit)? = null
) {
    var selectedTab by remember { mutableStateOf(0) }
    var selectedDeliveryIds by remember { mutableStateOf(setOf<String>()) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Asignar Pedido #${order.orderId}") },
        text = {
            Column {
                // Tabs
                TabRow(selectedTabIndex = selectedTab) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = { Text("Directa") }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = { Text("Manual") }
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                when (selectedTab) {
                    0 -> {
                        // Asignación Directa
                        Text("Selecciona un repartidor:")
                        Spacer(modifier = Modifier.height(8.dp))
                        deliveryPersons.forEach { person ->
                            Button(
                                onClick = { onAssign(person) },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("${person.name} - ${person.phone}")
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                        }
                    }
                    1 -> {
                        // Asignación Manual
                        Text("Selecciona repartidores (múltiples):")
                        Spacer(modifier = Modifier.height(8.dp))
                        deliveryPersons.forEach { person ->
                            val isSelected = selectedDeliveryIds.contains(person.id)
                            OutlinedButton(
                                onClick = {
                                    if (isSelected) {
                                        selectedDeliveryIds = selectedDeliveryIds - person.id
                                    } else {
                                        selectedDeliveryIds = selectedDeliveryIds + person.id
                                    }
                                },
                                modifier = Modifier.fillMaxWidth(),
                                colors = if (isSelected) {
                                    ButtonDefaults.outlinedButtonColors(
                                        contentColor = MaterialTheme.colorScheme.primary
                    )
                                } else {
                                    ButtonDefaults.outlinedButtonColors()
                                }
                            ) {
                                Text("${person.name} - ${person.phone}")
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                        }
                        
                        if (selectedDeliveryIds.isNotEmpty()) {
                            Button(
                                onClick = { 
                                    onAssignManual?.invoke(selectedDeliveryIds.toList())
                                    onDismiss()
                                },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary
                                )
                            ) {
                                Text("Enviar a ${selectedDeliveryIds.size} repartidores")
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}

@Composable
fun CreateOrderScreen(viewModel: AdminViewModel) {
    var restaurantName by remember { mutableStateOf("") }
    var pickupLocationUrl by remember { mutableStateOf("") }
    var paymentMethod by remember { mutableStateOf("") }
    var customerPhone by remember { mutableStateOf("") }
    var productName by remember { mutableStateOf("") }
    var productQuantity by remember { mutableStateOf("") }
    var productPrice by remember { mutableStateOf("") }
    var profit by remember { mutableStateOf("") }
    var deliveryAddress by remember { mutableStateOf("") }
    var customerUrl by remember { mutableStateOf("") }
    var deliveryReferences by remember { mutableStateOf("") }
    var customerCode by remember { mutableStateOf("") }
    
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Crear Pedido Manual", style = MaterialTheme.typography.headlineSmall)
        }
        
        item {
            Text("Información del Negocio", style = MaterialTheme.typography.titleMedium)
        }
        
        item {
            OutlinedTextField(
                value = restaurantName,
                onValueChange = { restaurantName = it },
                label = { Text("Restaurante o negocio") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        item {
            OutlinedTextField(
                value = pickupLocationUrl,
                onValueChange = { pickupLocationUrl = it },
                label = { Text("URL del Maps donde hay que recojer") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        item {
            Text("Información del Pedido", style = MaterialTheme.typography.titleMedium)
        }
        
        item {
            OutlinedTextField(
                value = paymentMethod,
                onValueChange = { paymentMethod = it },
                label = { Text("Método de Pago") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp),
                shape = RoundedCornerShape(12.dp)
            )
        }
        
        item {
            OutlinedTextField(
                value = customerPhone,
                onValueChange = { customerPhone = it },
                label = { Text("Teléfono") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp),
                shape = RoundedCornerShape(12.dp)
            )
        }
        
        item {
            Text("Productos", style = MaterialTheme.typography.titleMedium)
        }
        
        item {
            OutlinedTextField(
                value = productName,
                onValueChange = { productName = it },
                label = { Text("Producto que requiere el cliente") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = productQuantity,
                    onValueChange = { productQuantity = it },
                    label = { Text("Cantidad") },
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = productPrice,
                    onValueChange = { productPrice = it },
                    label = { Text("Precio") },
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        item {
            OutlinedTextField(
                value = profit,
                onValueChange = { profit = it },
                label = { Text("Ganancia del pedido") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        item {
            Text("Entrega", style = MaterialTheme.typography.titleMedium)
        }
        
        item {
            OutlinedTextField(
                value = deliveryAddress,
                onValueChange = { deliveryAddress = it },
                label = { Text("Dirección donde se tiene que entregar") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp),
                shape = RoundedCornerShape(12.dp)
            )
        }
        
        item {
            OutlinedTextField(
                value = customerUrl,
                onValueChange = { customerUrl = it },
                label = { Text("URL del cliente") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        item {
            OutlinedTextField(
                value = deliveryReferences,
                onValueChange = { deliveryReferences = it },
                label = { Text("Referencias del domicilio") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        item {
            OutlinedTextField(
                value = customerCode,
                onValueChange = { 
                    // Validar que solo contenga números y tenga máximo 4 dígitos
                    if (it.length <= 4 && it.all { char -> char.isDigit() }) {
                        customerCode = it
                    }
                },
                label = { Text("Código del cliente") },
                placeholder = { Text("Ingrese 4 dígitos") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        item {
            // Botón para llenar con datos de pedido simulado
            Button(
                onClick = {
                    // Llenar todos los campos con la información del pedido simulado
                    restaurantName = "Little Caesars Fresnillo"
                    pickupLocationUrl = "https://maps.app.goo.gl/UqbzBAke8c93foUB7"
                    paymentMethod = "Efectivo"
                    customerPhone = "4931093541"
                    productName = "3 Gorditas, 1 de Mole con queso, 1 de deshebrada con queso, 1 de Nopalitos con Huevo"
                    productQuantity = "3"
                    productPrice = "50"
                    profit = "50"
                    deliveryAddress = "Niño artillero 505 Col Industrial"
                    customerUrl = "https://maps.app.goo.gl/hKRd7FiGdoFiRjBw6"
                    deliveryReferences = "Casa azul portón Negro"
                    customerCode = "1234"
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(55.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF2196F3) // Color azul para distinguirlo
                )
            ) {
                Text(
                    text = "Pedido Simulado",
                    fontWeight = FontWeight.Bold
                )
            }
        }
        
        item {
            Button(
                onClick = {
                    // Generar ID único para el pedido
                    val orderId = "PEDIDO-${System.currentTimeMillis()}"
                    // Calcular subtotal como cantidad * precio
                    val quantity = productQuantity.toIntOrNull() ?: 0
                    val price = productPrice.toDoubleOrNull() ?: 0.0
                    val calculatedSubtotal = quantity * price
                    
                    viewModel.createOrder(
                        orderId = orderId,
                        restaurantName = restaurantName,
                        dateTime = "Manual-${System.currentTimeMillis()}", // Fecha/hora será generada automáticamente
                        paymentMethod = paymentMethod,
                        customerName = "Cliente Manual", // Nombre predeterminado
                        customerPhone = customerPhone,
                        customerEmail = "manual@example.com", // Email predeterminado
                        items = listOf(
                            com.example.aplicacionnuevaprueba1.data.model.OrderItem(
                                name = productName,
                                quantity = quantity,
                                unitPrice = price,
                                subtotal = calculatedSubtotal
                            )
                        ),
                        subtotal = calculatedSubtotal,
                        deliveryCost = profit.toDoubleOrNull() ?: 0.0, // Usar ganancia como costo de envío
                        latitude = 0.0, // Latitud predeterminada
                        longitude = 0.0, // Longitud predeterminada
                        pickupLocationUrl = pickupLocationUrl,
                        deliveryAddress = deliveryAddress,
                        customerUrl = customerUrl,
                        deliveryReferences = deliveryReferences,
                        customerCode = customerCode
                    )
                    
                    // Limpiar formulario
                    restaurantName = ""
                    pickupLocationUrl = ""
                    paymentMethod = ""
                    customerPhone = ""
                    productName = ""
                    productQuantity = ""
                    productPrice = ""
                    profit = ""
                    deliveryAddress = ""
                    customerUrl = ""
                    deliveryReferences = ""
                    customerCode = ""
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(55.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = com.example.aplicacionnuevaprueba1.ui.theme.SuccessGreen
                )
            ) {
                Text(
                    text = "Crear Pedido",
                    fontWeight = FontWeight.Bold
                )
            }
        }
        
        // Botón para compartir el último pedido creado por WhatsApp
        item {
            val context = LocalContext.current
            val clipboardManager = LocalClipboardManager.current
            
            Button(
                onClick = {
                    // Mensaje MEJORADO con TODA la información completa del pedido
                    val quantity = productQuantity.toDoubleOrNull() ?: 0.0
                    val price = productPrice.toDoubleOrNull() ?: 0.0
                    val profitAmount = profit.toDoubleOrNull() ?: 0.0
                    val total = quantity * price + profitAmount
                    
                    val message = "📦 *NUEVO PEDIDO CREADO* 📦\n\n" +
                                 "🏪 *Negocio:* ${restaurantName.ifEmpty { "No especificado" }}\n\n" +
                                 "👤 *Información del Cliente:*\n" +
                                 "   Teléfono: ${customerPhone.ifEmpty { "No registrado" }}\n" +
                                 "   Dirección: ${deliveryAddress.ifEmpty { "No especificada" }}\n\n" +
                                 "🛍️ *Producto(s):*\n" +
                                 "   • ${productName.ifEmpty { "No especificado" }} (x${productQuantity.ifEmpty { "0" }})\n" +
                                 "   • Precio unitario: \$${String.format("%.2f", price)}\n" +
                                 "   • Subtotal: \$${String.format("%.2f", quantity * price)}\n\n" +
                                 "💰 *Costos:*\n" +
                                 "   • Envío: \$${String.format("%.2f", profitAmount)}\n" +
                                 "   • *TOTAL: \$${String.format("%.2f", total)}*\n\n" +
                                 "💳 *Método de pago:* ${paymentMethod.ifEmpty { "No especificado" }}\n\n" +
                                 "📍 *Ubicaciones:*\n" +
                                 "   • Recoger en: ${pickupLocationUrl.ifEmpty { "No especificada" }}\n" +
                                 "   • Mapa cliente: ${customerUrl.ifEmpty { "No disponible" }}\n\n" +
                                 "📝 *Referencias:* ${deliveryReferences.ifEmpty { "Sin referencias" }}\n\n" +
                                 "🔢 *Código cliente:* ${customerCode.ifEmpty { "Sin código" }}\n\n" +
                                 "_Pedido creado manualmente desde App Administrador_"
                    
                    // Abrir WhatsApp con el mensaje completo predefinido
                    val encodedMessage = Uri.encode(message)
                    val formattedNumber = customerPhone.replace("[^+0-9]".toRegex(), "")
                    val whatsappUrl = "https://wa.me/${formattedNumber}?text=${encodedMessage}"
                    
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(whatsappUrl))
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    
                    try {
                        context.startActivity(intent)
                    } catch (e: Exception) {
                        println("Error al abrir WhatsApp: ${e.message}")
                        // Si falla, copiar al portapapeles como alternativa
                        clipboardManager.setText(AnnotatedString(message))
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF25D366)  // WhatsApp Green
                )
            ) {
                Icon(
                    Icons.Filled.Share,
                    contentDescription = "Compartir por WhatsApp",
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Compartir Pedido Completo por WhatsApp",
                    fontWeight = FontWeight.Bold,
                    fontSize = MaterialTheme.typography.bodyLarge.fontSize
                )
            }
        }
    }
}

@Composable
fun DeliveryPersonsManagementScreen(
    deliveryPersons: List<DeliveryPerson>,
    viewModel: AdminViewModel
) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var showCopiedMessage by remember { mutableStateOf(false) }
    val clipboardManager = LocalClipboardManager.current
    
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Text(
                text = "Gestión de Repartidores",
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            Text(
                text = "Crea cuentas de repartidores y asigna pedidos",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = "⚠️ Las cuentas creadas aquí se activan automáticamente",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.tertiary
            )
        }
        
        // Create new delivery person section
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Crear Nuevo Repartidor",
                        style = MaterialTheme.typography.titleMedium
                    )
                    
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Nombre completo") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Número de teléfono") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    Button(
                        onClick = {
                            if (name.isNotBlank() && phone.isNotBlank()) {
                                viewModel.addDeliveryPerson(name, phone)
                                name = ""
                                phone = ""
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = name.isNotBlank() && phone.isNotBlank()
                    ) {
                        Text("Crear Cuenta")
                    }
                }
            }
        }
        
        // List of existing delivery persons
        item {
            Text(
                text = "Repartidores Existentes (${deliveryPersons.size})",
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.padding(top = 16.dp, bottom = 8.dp)
            )
            Divider()
        }
        
        if (deliveryPersons.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No hay repartidores creados",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            items(items = deliveryPersons, key = { it.id }) { person ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = person.name,
                            style = MaterialTheme.typography.titleMedium
                        )
                        Text(
                            text = "Teléfono: ${person.phone}",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        
                        // ID with copy button
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "ID de acceso: ${person.id}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.weight(1f)
                            )
                            IconButton(
                                onClick = {
                                    clipboardManager.setText(AnnotatedString(person.id))
                                    showCopiedMessage = true
                                    MainScope().launch {
                                        delay(2000)
                                        showCopiedMessage = false
                                    }
                                }
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.ContentCopy,
                                    contentDescription = "Copiar ID",
                                    tint = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                        
                        // Status indicators
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    imageVector = if (person.isOnline) Icons.Filled.Circle else Icons.Filled.RadioButtonUnchecked,
                                    contentDescription = null,
                                    tint = if (person.isOnline) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline,
                                    modifier = Modifier.size(12.dp)
                                )
                                Text(
                                    text = if (person.isOnline) "Repartidor conectado" else "Repartidor desconectado",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = if (person.isOnline) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
                                )
                            }
                            
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    imageVector = if (person.isActive) Icons.Filled.Check else Icons.Filled.Pending,
                                    contentDescription = null,
                                    tint = if (person.isActive) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.outline,
                                    modifier = Modifier.size(12.dp)
                                )
                                Text(
                                    text = if (person.isActive) "Repartidor dentro de la app" else "Repartidor fuera de la app",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = if (person.isActive) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.outline
                                )
                            }
                        }
                        
                        // Delete button
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.End
                        ) {
                            Button(
                                onClick = { viewModel.deleteDeliveryPerson(person.id, person.name) },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.error
                                ),
                                modifier = Modifier.padding(top = 8.dp)
                            ) {
                                Text("Eliminar Cuenta", color = MaterialTheme.colorScheme.onError)
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Copied message snackbar
    if (showCopiedMessage) {
        Snackbar(
            modifier = Modifier.padding(16.dp)
        ) {
            Text("ID copiado al portapapeles")
        }
    }
}

@Composable
fun ApprovedDeliveryPersonCard(
    person: DeliveryPerson,
    viewModel: AdminViewModel
) {
    var showDeleteDialog by remember { mutableStateOf(false) }
    var showCopiedMessage by remember { mutableStateOf(false) }
    val clipboardManager = LocalClipboardManager.current
    
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = person.name, style = MaterialTheme.typography.titleMedium)
            Text(text = "Teléfono: ${person.phone}")
            
            // ID with copy button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "ID: ${person.id}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.secondary,
                    modifier = Modifier.weight(1f)
                )
                
                IconButton(
                    onClick = {
                        clipboardManager.setText(AnnotatedString(person.id))
                        showCopiedMessage = true
                        // Hide message after 2 seconds
                        kotlinx.coroutines.MainScope().launch {
                            kotlinx.coroutines.delay(2000)
                            showCopiedMessage = false
                        }
                    }
                ) {
                    Icon(
                        imageVector = Icons.Filled.ContentCopy,
                        contentDescription = "Copiar ID",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "✓ Aprobado",
                        color = MaterialTheme.colorScheme.primary
                    )
                    Icon(
                        imageVector = Icons.Filled.Check,
                        contentDescription = "Aprobado",
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                
                Text(
                    text = if (person.isAvailable) "Disponible" else "Ocupado",
                    color = if (person.isAvailable) 
                        MaterialTheme.colorScheme.primary 
                    else 
                        MaterialTheme.colorScheme.error
                )
            }
            
            person.registrationDate.takeIf { it.isNotEmpty() }?.let { date ->
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Registrado: ${date.take(10)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = { showDeleteDialog = true },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                )
            ) {
                Text("Eliminar Repartidor")
            }
        }
    }
    
    // Show copied message
    if (showCopiedMessage) {
        Snackbar(
            modifier = Modifier.padding(16.dp)
        ) {
            Text("ID copiado al portapapeles")
        }
    }
    
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("¿Eliminar Repartidor?") },
            text = { 
                Text("Se eliminará al repartidor ${person.name} y se cancelarán todos sus pedidos asignados.") 
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteDeliveryPerson(person.id, person.name)
                        showDeleteDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Eliminar")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }
}

@Composable
fun PendingDeliveryPersonCard(
    person: DeliveryPerson,
    viewModel: AdminViewModel
) {
    var showCopiedMessage by remember { mutableStateOf(false) }
    val clipboardManager = LocalClipboardManager.current
    
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = person.name, style = MaterialTheme.typography.titleMedium)
            Text(text = "Teléfono: ${person.phone}")
            
            // ID with copy button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "ID: ${person.id}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.secondary,
                    modifier = Modifier.weight(1f)
                )
                
                IconButton(
                    onClick = {
                        clipboardManager.setText(AnnotatedString(person.id))
                        showCopiedMessage = true
                        // Hide message after 2 seconds
                        kotlinx.coroutines.MainScope().launch {
                            kotlinx.coroutines.delay(2000)
                            showCopiedMessage = false
                        }
                    }
                ) {
                    Icon(
                        imageVector = Icons.Filled.ContentCopy,
                        contentDescription = "Copiar ID",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "○ Pendiente",
                    color = MaterialTheme.colorScheme.tertiary
                )
                
                Text(
                    text = if (person.isAvailable) "Disponible" else "Ocupado",
                    color = if (person.isAvailable) 
                        MaterialTheme.colorScheme.primary 
                    else 
                        MaterialTheme.colorScheme.error
                )
            }
            
            person.registrationDate.takeIf { it.isNotEmpty() }?.let { date ->
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Registrado: ${date.take(10)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = { 
                        viewModel.approveDeliveryPerson(person.id)
                        viewModel.refreshDeliveryPersons()
                    },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Text("Aprobar")
                }
                
                Button(
                    onClick = { 
                        viewModel.rejectDeliveryPerson(person.id, person.name)
                    },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Rechazar")
                }
            }
        }
    }
    
    // Show copied message
    if (showCopiedMessage) {
        Snackbar(
            modifier = Modifier.padding(16.dp)
        ) {
            Text("ID copiado al portapapeles")
        }
    }
}

@Composable
fun PasteOrderScreen(viewModel: AdminViewModel) {
    var orderText by remember { mutableStateOf("") }
    var parsedOrder by remember { mutableStateOf<OrderParser.ParsedOrder?>(null) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Pegar Texto del Pedido", style = MaterialTheme.typography.headlineSmall)
        
        Text(
            "Pega aquí el texto completo del pedido y se llenará automáticamente:",
            style = MaterialTheme.typography.bodyMedium
        )
        
        OutlinedTextField(
            value = orderText,
            onValueChange = { orderText = it },
            label = { Text("Texto del Pedido") },
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp),
            maxLines = 15
        )
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = {
                    parsedOrder = OrderParser.parseOrderText(orderText)
                },
                modifier = Modifier.weight(1f)
            ) {
                Text("Analizar Pedido")
            }
            
            Button(
                onClick = {
                    orderText = ""
                    parsedOrder = null
                },
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.secondary
                )
            ) {
                Text("Limpiar")
            }
        }
        
        parsedOrder?.let { order ->
            Divider(modifier = Modifier.padding(vertical = 8.dp))
            
            Text("Datos Extraídos:", style = MaterialTheme.typography.titleMedium)
            
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                item {
                    Text("ID: ${order.orderId}")
                    Text("Restaurante: ${order.restaurantName}")
                    Text("Fecha: ${order.dateTime}")
                    Text("Pago: ${order.paymentMethod}")
                    Text("Cliente: ${order.customerName}")
                    Text("Teléfono: ${order.customerPhone}")
                    if (order.customerEmail.isNotEmpty()) {
                        Text("Email: ${order.customerEmail}")
                    }
                    Text("Productos:")
                    order.items.forEach { item ->
                        Text("  • ${item.name} x${item.quantity} - $${item.subtotal}")
                    }
                    Text("Subtotal: $${order.subtotal}")
                    Text("Envío: $${order.deliveryCost}")
                    Text("Total: $${order.subtotal + order.deliveryCost}")
                    Text("Ubicación: ${order.latitude}, ${order.longitude}")
                }
            }
            
            Button(
                onClick = {
                    viewModel.createOrder(
                        orderId = order.orderId,
                        restaurantName = order.restaurantName,
                        dateTime = order.dateTime,
                        paymentMethod = order.paymentMethod,
                        customerName = order.customerName,
                        customerPhone = order.customerPhone,
                        customerEmail = order.customerEmail,
                        items = order.items,
                        subtotal = order.subtotal,
                        deliveryCost = order.deliveryCost,
                        latitude = order.latitude,
                        longitude = order.longitude
                    )
                    orderText = ""
                    parsedOrder = null
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Crear Pedido")
            }
        }
    }
}

@Composable
fun RiderStatusScreen(
    deliveryPersons: List<DeliveryPerson>,
    viewModel: AdminViewModel
) {
    val approvedPersons = deliveryPersons.filter { it.isApproved }
    val onlinePersons = approvedPersons.filter { it.isOnline }
    val offlinePersons = approvedPersons.filter { !it.isOnline }
    val activePersons = approvedPersons.filter { it.isActive }
    val inactivePersons = approvedPersons.filter { !it.isActive && it.isOnline }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Summary Cards
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Circle,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Text(
                            text = "${onlinePersons.size}",
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            text = "En Línea",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }

                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Filled.RadioButtonUnchecked,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.error,
                            modifier = Modifier.size(24.dp)
                        )
                        Text(
                            text = "${offlinePersons.size}",
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                        Text(
                            text = "Desconectados",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.secondaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Check,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.secondary,
                            modifier = Modifier.size(24.dp)
                        )
                        Text(
                            text = "${activePersons.size}",
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                        Text(
                            text = "Trabajando",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                    }
                }

                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.tertiaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Pending,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.tertiary,
                            modifier = Modifier.size(24.dp)
                        )
                        Text(
                            text = "${inactivePersons.size}",
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.onTertiaryContainer
                        )
                        Text(
                            text = "Inactivos",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onTertiaryContainer
                        )
                    }
                }
            }
        }

        // Online Riders Section
        item {
            Text(
                text = "Repartidores En Línea (${onlinePersons.size})",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(top = 8.dp)
            )
            Divider(modifier = Modifier.padding(vertical = 8.dp))
        }

        if (onlinePersons.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No hay repartidores en línea",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            items(items = onlinePersons, key = { it.id }) { person ->
                RiderStatusCard(person, true) { rider ->
                    viewModel.disconnectDeliveryPerson(rider.id, rider.name)
                }
            }
        }

        // Offline Riders Section
        item {
            Text(
                text = "Repartidores Desconectados (${offlinePersons.size})",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(top = 16.dp)
            )
            Divider(modifier = Modifier.padding(vertical = 8.dp))
        }

        if (offlinePersons.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Todos los repartidores están en línea",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            items(items = offlinePersons, key = { it.id }) { person ->
                RiderStatusCard(person, false) { rider ->
                    // No hacer nada para repartidores desconectados
                }
            }
        }

        // Refresh button
        item {
            Spacer(modifier = Modifier.height(24.dp))
            Button(
                onClick = { viewModel.refreshDeliveryPersons() },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.secondary
                )
            ) {
                Text("Actualizar Estado")
            }
        }
    }
}



@Composable
fun RiderStatusCard(
    person: DeliveryPerson, 
    isOnline: Boolean,
    onDisconnectClick: (DeliveryPerson) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isOnline) 
                MaterialTheme.colorScheme.surface 
            else 
                MaterialTheme.colorScheme.surfaceVariant
        )
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
                    text = person.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = if (isOnline) 
                        MaterialTheme.colorScheme.onSurface 
                    else 
                        MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (isOnline) Icons.Filled.Circle else Icons.Filled.RadioButtonUnchecked,
                        contentDescription = if (isOnline) "En línea" else "Desconectado",
                        modifier = Modifier.size(12.dp),
                        tint = if (isOnline) 
                            if (person.isActive) MaterialTheme.colorScheme.primary 
                            else MaterialTheme.colorScheme.tertiary
                        else 
                            MaterialTheme.colorScheme.outline
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (isOnline) 
                            if (person.isActive) "Trabajando" else "Inactivo" 
                        else 
                            "Desconectado",
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isOnline) 
                            if (person.isActive) MaterialTheme.colorScheme.primary 
                            else MaterialTheme.colorScheme.tertiary
                        else 
                            MaterialTheme.colorScheme.outline
                    )
                }
            }
            
            Text(
                text = "Teléfono: ${person.phone}",
                style = MaterialTheme.typography.bodyMedium,
                color = if (isOnline) 
                    MaterialTheme.colorScheme.onSurface 
                else 
                    MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Text(
                text = "ID: ${person.id}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            person.lastSeen.takeIf { it > 0 }?.let { lastSeen ->
                val lastSeenText = formatLastSeen(lastSeen)
                Text(
                    text = "Última conexión: $lastSeenText",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            if (isOnline) {  // Mostrar botón de desconexión solo si el repartidor está en línea
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = { onDisconnectClick(person) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Desconectar Repartidor", color = Color.White)
                }
            }
        }
    }
}

@Composable
fun RestaurantsManagementScreen(
    restaurants: List<Restaurant>,
    viewModel: AdminViewModel
) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var mapUrl by remember { mutableStateOf("") } // URL de Google Maps
    
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Text(
                text = "Gestión de Restaurantes",
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            Text(
                text = "Crea cuentas de restaurantes y genera IDs de acceso",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = "⚠️ Las cuentas creadas aquí se activan automáticamente",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.tertiary
            )
        }
        
        // Create new restaurant section
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Crear Nuevo Restaurante",
                        style = MaterialTheme.typography.titleMedium
                    )
                    
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Nombre del restaurante") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Teléfono") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("Dirección") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    OutlinedTextField(
                        value = mapUrl,
                        onValueChange = { mapUrl = it },
                        label = { Text("📍 URL de Google Maps del Negocio") },
                        placeholder = { Text("https://maps.app.goo.gl/...") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = false,
                        maxLines = 2
                    )
                    
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email (opcional)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Notas (opcional)") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2
                    )
                    
                    Button(
                        onClick = {
                            if (name.isNotBlank() && phone.isNotBlank()) {
                                viewModel.createRestaurant(name, phone, address, email, notes, mapUrl)
                                name = ""
                                phone = ""
                                address = ""
                                email = ""
                                notes = ""
                                mapUrl = ""
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = name.isNotBlank() && phone.isNotBlank()
                    ) {
                        Text("Crear Cuenta de Restaurante")
                    }
                }
            }
        }
        
        // List of existing restaurants
        item {
            Text(
                text = "Restaurantes Existentes (${restaurants.size})",
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.padding(top = 16.dp, bottom = 8.dp)
            )
            Divider()
        }
        
        if (restaurants.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No hay restaurantes registrados",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            items(items = restaurants, key = { it.id }) { restaurant ->
                RestaurantCard(restaurant, viewModel)
            }
        }
    }
}

@Composable
fun RestaurantCard(
    restaurant: Restaurant,
    viewModel: AdminViewModel
) {
    var showCopiedMessage by remember { mutableStateOf(false) }
    val clipboardManager = LocalClipboardManager.current
    val context = LocalContext.current
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = { },
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = restaurant.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                IconButton(onClick = {
                    clipboardManager.setText(AnnotatedString(restaurant.id))
                    showCopiedMessage = true
                }) {
                    Icon(
                        imageVector = Icons.Default.ContentCopy,
                        contentDescription = "Copiar ID"
                    )
                }
            }
            
            Text(
                text = "ID: ${restaurant.id}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary
            )
            
            Text(text = "📞 ${restaurant.phone}")
            Text(text = "📍 ${restaurant.address}")
            
            if (restaurant.email.isNotEmpty()) {
                Text(text = "✉️ ${restaurant.email}")
            }
            
            if (restaurant.notes.isNotEmpty()) {
                Text(
                    text = "📝 ${restaurant.notes}",
                    style = MaterialTheme.typography.bodySmall
                )
            }
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Estado: ${if (restaurant.isApproved) "✅ Aprobado" else "❌ No aprobado"}",
                    style = MaterialTheme.typography.bodySmall,
                    color = if (restaurant.isApproved) Color.Green else Color.Red
                )
                
                Text(
                    text = "📅 ${restaurant.registrationDate}",
                    style = MaterialTheme.typography.bodySmall
                )
            }
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = {
                        clipboardManager.setText(AnnotatedString(restaurant.id))
                        showCopiedMessage = true
                    },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Copiar ID")
                }
                
                if (!restaurant.isApproved) {
                    Button(
                        onClick = { viewModel.approveRestaurant(restaurant.id) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Aprobar")
                    }
                }
                
                IconButton(onClick = {
                    viewModel.deleteRestaurant(restaurant.id, restaurant.name)
                }) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Eliminar",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }
            
            if (showCopiedMessage) {
                Text(
                    text = "✅ ID copiado al portapapeles",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary
                )
                LaunchedEffect(Unit) {
                    kotlinx.coroutines.delay(2000)
                    showCopiedMessage = false
                }
            }
        }
    }
}

@Composable
fun ClientsManagementScreen(viewModel: AdminViewModel) {
    val clients by viewModel.clients.collectAsState()
    var showBlockedClients by remember { mutableStateOf(false) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header con título y filtro
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "👥 Gestión de Clientes",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Mostrar bloqueados",
                    style = MaterialTheme.typography.bodyMedium
                )
                Switch(
                    checked = showBlockedClients,
                    onCheckedChange = { showBlockedClients = it }
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Estadísticas
        val activeClients = clients.count { it.status == "active" }
        val blockedClients = clients.count { it.status == "blocked" }
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFE8F5E9))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "✅ Activos",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF2E7D32)
                    )
                    Text(
                        text = "$activeClients",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1B5E20)
                    )
                }
            }
            
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "🚫 Bloqueados",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFFC62828)
                    )
                    Text(
                        text = "$blockedClients",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFB71C1C)
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Lista de clientes
        val filteredClients = if (showBlockedClients) {
            clients
        } else {
            clients.filter { it.status == "active" }
        }
        
        if (filteredClients.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = if (showBlockedClients) "📭" else "😊",
                        fontSize = 48.sp
                    )
                    Text(
                        text = if (showBlockedClients) 
                            "No hay clientes bloqueados" else 
                            "No hay clientes activos",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(items = filteredClients, key = { it.id }) { client ->
                    ClientCard(client, viewModel)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClientCard(
    client: Client,
    viewModel: AdminViewModel
) {
    val context = LocalContext.current
    var showActionsMenu by remember { mutableStateOf(false) }
    var showDeleteDialog by remember { mutableStateOf(false) }
    
    val isBlocked = client.status == "blocked"
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isBlocked) Color(0xFFFFEBEE) else Color(0xFFE8F5E9)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header con nombre y estado
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = client.name.ifEmpty { "Sin nombre" },
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = if (isBlocked) Color(0xFFC62828) else Color(0xFF2E7D32)
                    )
                    Text(
                        text = client.email,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                IconButton(onClick = { showActionsMenu = true }) {
                    Icon(
                        imageVector = Icons.Default.MoreVert,
                        contentDescription = "Más opciones"
                    )
                }
                
                DropdownMenu(
                    expanded = showActionsMenu,
                    onDismissRequest = { showActionsMenu = false }
                ) {
                    DropdownMenuItem(
                        text = { Text(if (isBlocked) "Desbloquear" else "Bloquear") },
                        onClick = {
                            if (isBlocked) {
                                viewModel.unblockClient(client.id, client.name)
                            } else {
                                viewModel.blockClient(client.id, client.name)
                            }
                            showActionsMenu = false
                        },
                        leadingIcon = {
                            Icon(
                                imageVector = if (isBlocked) Icons.Default.Check else Icons.Default.Block,
                                contentDescription = null
                            )
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Eliminar cuenta") },
                        onClick = {
                            showDeleteDialog = true
                            showActionsMenu = false
                        },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error
                            )
                        }
                    )
                }
            }
            
            // Información del cliente
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Column {
                    Text(
                        text = "📱 Teléfono",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = client.phone.ifEmpty { "No registrado" },
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
                
                Column {
                    Text(
                        text = "📅 Fecha creación",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = formatClientTimestamp(client.createdAt),
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
            
            // Badge de estado
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = if (isBlocked) Icons.Default.Block else Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = if (isBlocked) MaterialTheme.colorScheme.error else Color(0xFF2E7D32),
                    modifier = Modifier.size(20.dp)
                )
                Text(
                    text = if (isBlocked) "CUENTA BLOQUEADA" else "CUENTA ACTIVA",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (isBlocked) MaterialTheme.colorScheme.error else Color(0xFF2E7D32)
                )
            }
        }
    }
    
    // Diálogo de confirmación para eliminar
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("¿Eliminar cliente?") },
            text = {
                Column {
                    Text("¿Estás seguro de que deseas eliminar la cuenta de ${client.name}?")
                    Text(
                        text = "Esta acción no se puede deshacer.",
                        color = MaterialTheme.colorScheme.error,
                        fontWeight = FontWeight.Bold
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteClient(client.id, client.name)
                        showDeleteDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Eliminar")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }
}

fun formatLastSeen(lastSeen: Long): String {
    val now = System.currentTimeMillis()
    val diffMinutes = (now - lastSeen) / (1000 * 60)
    
    return when {
        diffMinutes < 1 -> "hace menos de un minuto"
        diffMinutes < 60 -> "hace $diffMinutes minutos"
        diffMinutes < 1440 -> "hace ${diffMinutes / 60} horas"
        else -> "hace ${(diffMinutes / 1440)} días"
    }
}

private fun formatClientTimestamp(timestamp: Long): String {
    try {
        val sdf = java.text.SimpleDateFormat("dd/MM/yyyy HH:mm", java.util.Locale.getDefault())
        return sdf.format(java.util.Date(timestamp))
    } catch (e: Exception) {
        return "N/A"
    }
}

// Función para formatear fecha y hora de creación del pedido
private fun formatOrderCreationTime(orderId: Long): String {
    // Los IDs de pedidos se generan con timestamp actual
    val creationTime = if (orderId > 0) orderId else System.currentTimeMillis()
    try {
        val sdf = java.text.SimpleDateFormat("dd/MM/yyyy HH:mm:ss", java.util.Locale.getDefault())
        return sdf.format(java.util.Date(creationTime))
    } catch (e: Exception) {
        return "N/A"
    }
}




