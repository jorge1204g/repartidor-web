package com.example.repartidor.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import android.Manifest
import android.content.pm.PackageManager
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.example.repartidor.data.model.Order
import com.example.repartidor.ui.theme.*
import com.example.repartidor.utils.translateOrderStatus
import kotlinx.coroutines.launch

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
    onOrderDetailClick: (Order) -> Unit = {}
) {
    val orders by viewModel.orders.collectAsState()
    val deliveryPerson by viewModel.deliveryPerson.collectAsState()
    var activeTab by remember { mutableStateOf("active") }
    val context = LocalContext.current
    
    // Detectar pedidos activos para iniciar/detener seguimiento de ubicacion
    val hasActiveDeliveryOrder = orders.any { order ->
        order.status in listOf("ACCEPTED", "ON_THE_WAY_TO_STORE", "ARRIVED_AT_STORE", "PICKING_UP_ORDER", "ON_THE_WAY_TO_CUSTOMER")
    }
    
    // Iniciar o detener seguimiento de ubicacion segun el estado del pedido
    LaunchedEffect(hasActiveDeliveryOrder) {
        val hasLocationPermission = 
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        
        if (hasActiveDeliveryOrder && hasLocationPermission) {
            viewModel.startLocationTracking(context)
        } else if (!hasActiveDeliveryOrder) {
            viewModel.stopLocationTracking(context)
        }
    }
    
    // Filtrar pedidos activos y asignados manualmente/por restaurante
    val activeOrders = orders.filter { order ->
        order.status != "DELIVERED"
    }
    val assignedOrders = orders.filter { order ->
        order.orderType == "MANUAL" || order.orderType == "RESTAURANT"
    }
    
    // Determinar el texto del botón según el tipo de asignación
    val hasManualAssigned = assignedOrders.any { it.orderType == "MANUAL" }
    val hasRestaurantAssigned = assignedOrders.any { it.orderType == "RESTAURANT" }
    
    val assignedButtonText = when {
        hasManualAssigned && hasRestaurantAssigned -> "📋 Ambos (${assignedOrders.size})"
        hasManualAssigned -> "👤 Manual (${assignedOrders.size})"
        hasRestaurantAssigned -> "🏪 Restaurante (${assignedOrders.size})"
        else -> "📋 Asignados (${assignedOrders.size})"
    }
    
    // Fondo oscuro profesional usando el color del tema existente
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .background(md_theme_dark_background),  // #121418 - Gris casi negro
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Header profesional con saludo y estado
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = md_theme_dark_surfaceVariant),  // #1E2228 - Gris oscuro azulado
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = "¡Hola, ${deliveryPerson?.name ?: "Repartidor"}!",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = md_theme_dark_onBackground  // #E1E2E6 - Blanco grisáceo
                        )
                        Row(
                            modifier = Modifier.padding(top = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // ID Badge
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = null,
                                    tint = md_theme_dark_outline,  // #8D9197 - Gris medio
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(
                                    text = "ID: ${deliveryPerson?.id ?: "N/A"}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = md_theme_dark_onSurfaceVariant  // #C3C7CD - Gris claro
                                )
                            }
                            // Estado Online/Offline
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(10.dp)
                                        .clip(RoundedCornerShape(50))
                                        .background(if (deliveryPerson?.isOnline == true) md_theme_dark_primary else WarningOrange)  // Verde o Naranja de alerta
                                )
                                Text(
                                    text = if (deliveryPerson?.isOnline == true) "Disponible" else "No disponible",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = if (deliveryPerson?.isOnline == true) md_theme_dark_primary else WarningOrange,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                    
                    // Switch de estado - Diseño moderno
                    Switch(
                        checked = deliveryPerson?.isOnline ?: false,
                        onCheckedChange = { isChecked ->
                            deliveryPerson?.let { person ->
                                viewModel.updatePresence(isChecked, person.isActive)
                            }
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = md_theme_dark_primary,  // Verde brillante
                            checkedTrackColor = md_theme_dark_primary.copy(alpha = 0.5f),
                            uncheckedThumbColor = md_theme_dark_outline,  // Gris medio
                            uncheckedTrackColor = md_theme_dark_outline.copy(alpha = 0.3f)
                        ),
                        modifier = Modifier.padding(start = 12.dp)
                    )
                }
            }
        }
        
        // Tarjetas de ganancias - Diseño profesional de 3 tarjetas
        item {
            // Fila superior: Hoy y Semana
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Ganancias Hoy
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = md_theme_dark_surfaceVariant),  // #1E2228
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.Start
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Icon(
                                imageVector = Icons.Default.Today,
                                contentDescription = null,
                                tint = md_theme_dark_primary,  // Verde brillante #34C759
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Hoy",
                            style = MaterialTheme.typography.labelMedium,
                            color = md_theme_dark_onSurfaceVariant  // #C3C7CD
                        )
                        Text(
                            text = "$${String.format("%.2f", dailyEarnings)}",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = md_theme_dark_onBackground  // #E1E2E6
                        )
                        Text(
                            text = "${orders.count { it.status != "DELIVERED" }} pedidos",
                            style = MaterialTheme.typography.bodySmall,
                            color = md_theme_dark_outline  // #8D9197
                        )
                    }
                }
                
                // Ganancias Semana
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = md_theme_dark_surfaceVariant),  // #1E2228
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.Start
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Icon(
                                imageVector = Icons.Default.BarChart,
                                contentDescription = null,
                                tint = AccentBlue,  // Azul #2196F3
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Semana",
                            style = MaterialTheme.typography.labelMedium,
                            color = md_theme_dark_onSurfaceVariant
                        )
                        Text(
                            text = "$${String.format("%.2f", weeklyEarnings)}",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = md_theme_dark_onBackground
                        )
                        Text(
                            text = "ganados",
                            style = MaterialTheme.typography.bodySmall,
                            color = md_theme_dark_outline
                        )
                    }
                }
            }
            
            // Fila inferior: Mes (más grande)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = md_theme_dark_surfaceVariant),  // #1E2228
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.TrendingUp,
                                contentDescription = null,
                                tint = WarningOrange,  // Naranja #FF9800
                                modifier = Modifier.size(22.dp)
                            )
                            Text(
                                text = "Este Mes",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = md_theme_dark_onBackground
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "$${String.format("%.2f", monthlyEarnings)}",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = md_theme_dark_onBackground
                        )
                        Text(
                            text = "ganados en total",
                            style = MaterialTheme.typography.bodySmall,
                            color = md_theme_dark_onSurfaceVariant
                        )
                    }
                    // Gráfico decorativo
                    Icon(
                        imageVector = Icons.Default.PieChart,
                        contentDescription = null,
                        tint = WarningOrange.copy(alpha = 0.3f),  // Naranja suave
                        modifier = Modifier.size(56.dp)
                    )
                }
            }
        }
        
        // Pestañas de pedidos - Diseño moderno
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = { activeTab = "active" },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTab == "active") md_theme_dark_primaryContainer else md_theme_dark_surfaceVariant,  // Verde oscuro o Gris azulado
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(16.dp),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                ) {
                    Text(
                        text = "Activos (${activeOrders.size})",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                }
                
                Button(
                    onClick = { activeTab = "assigned" },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTab == "assigned") md_theme_dark_tertiaryContainer else md_theme_dark_surfaceVariant,  // Azul oscuro o Gris azulado
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(16.dp),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                ) {
                    Text(
                        text = assignedButtonText,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                }
            }
        }
        
        // Lista de pedidos activos o asignados
        items(if (activeTab == "active") activeOrders else assignedOrders) { order ->
            OrderCard(
                order = order,
                onOrderClick = onOrderDetailClick,
                viewModel = viewModel
            )
        }
        
        // Mensaje cuando no hay pedidos - Diseño minimalista
        if ((activeTab == "active" && activeOrders.isEmpty()) || (activeTab == "assigned" && assignedOrders.isEmpty())) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 40.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = md_theme_dark_surfaceVariant),  // #1E2228
                    elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(40.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Ilustración minimalista (emoji grande)
                        Text(
                            text = "🛵",
                            fontSize = 72.sp
                        )
                        Text(
                            text = if (activeTab == "active") "¡No tienes pedidos activos!" else "No hay pedidos asignados",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = md_theme_dark_onBackground  // #E1E2E6
                        )
                        Text(
                            text = if (activeTab == "active") 
                                "Aprovecha para descansar mientras llegan nuevos pedidos" 
                             else 
                                "Los pedidos asignados manualmente o por el restaurante aparecerán aquí",
                            style = MaterialTheme.typography.bodyMedium,
                            color = md_theme_dark_onSurfaceVariant,  // #C3C7CD
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun OrderCard(
    order: Order,
    onOrderClick: (Order) -> Unit,
    viewModel: com.example.repartidor.ui.viewmodel.DeliveryViewModel
) {
    val context = LocalContext.current
    var showCodeDialog by remember { mutableStateOf(false) }
    var enteredCode by remember { mutableStateOf("") }
    var codeError by remember { mutableStateOf("") }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onOrderClick(order) },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E2638)),  // Azul oscuro profundo
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Título principal
            Text(
                text = "🔔 Nuevos pedidos recibidos",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF4CAF50)  // Verde brillante
            )
            
            // Información del cliente y restaurante
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "👤 Cliente: ${order.customer.name}",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF4CAF50)
                )
                Text(
                    text = "📞 Teléfono: ${order.customer.phone}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF9CA3AF)
                )
                Text(
                    text = "🏪 Restaurante: ${order.restaurantName}",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF4CAF50)
                )
            }
            
            // Botones de acción rápida - Solo mostrar si el pedido ya fue aceptado
            if (order.status != "MANUAL_ASSIGNED" || order.assignedToDeliveryId.isNotEmpty()) {
                // Botón: Llamar al cliente
                Button(
                    onClick = {
                        val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${order.customer.phone}"))
                        context.startActivity(intent)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2196F3)),  // Azul
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Phone,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "📞 Llamar al cliente",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = Color.White
                    )
                }
                
                // Botón: Copiar teléfono
                Button(
                    onClick = {
                        val clipboardManager = context.getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                        clipboardManager.setPrimaryClip(android.content.ClipData.newPlainText("Teléfono cliente", order.customer.phone))
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9C27B0)),  // Morado
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ContentCopy,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "📋 Copiar número de teléfono",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = Color.White
                    )
                }
                
                // Botón: Dirección del cliente
                Button(
                    onClick = {
                        // Abrir Google Maps con la dirección del cliente
                        val address = Uri.encode(order.deliveryAddress)
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/maps/search/?api=1&query=$address"))
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        context.startActivity(intent)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50)),  // Verde
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "📍 Dirección del cliente",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = Color.White
                    )
                }
                
                // Botón: Dirección del restaurante
                Button(
                    onClick = {
                        // Abrir Google Maps con la dirección del restaurante
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/maps/search/?api=1&query=${Uri.encode(order.restaurantName)}"))
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        context.startActivity(intent)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF9800)),  // Naranja
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Store,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "🏪 Dirección del restaurante",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = Color.White
                    )
                }
            }
            
            // Productos
            if (order.items.isNotEmpty()) {
                Column(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "📦 Productos:",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF4CAF50)  // Verde
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    order.items.forEach { item ->
                        Text(
                            text = "• ${item.name} x${item.quantity}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color(0xFF4CAF50),  // Verde
                            modifier = Modifier.padding(start = 16.dp)
                        )
                    }
                }
            }
            
            // Mensaje informativo
            if (order.status == "MANUAL_ASSIGNED" && order.assignedToDeliveryId.isEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF4CAF50).copy(alpha = 0.1f)),  // Verde transparente
                    border = BorderStroke(1.dp, Color(0xFF4CAF50).copy(alpha = 0.3f)),  // Verde suave
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "ℹ️", fontSize = 16.sp)
                        Text(
                            text = "Toca \"Aceptar pedido\" para ver más información de contacto y dirección",
                            color = Color(0xFF4CAF50),  // Verde
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
            
            // Botón de aceptar
            if (order.status == "MANUAL_ASSIGNED" && order.assignedToDeliveryId.isEmpty()) {
                Button(
                    onClick = {
                        viewModel.acceptOrder(order.id)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50)),  // Verde
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        modifier = Modifier.size(24.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "Aceptar pedido",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Color.White
                    )
                }
            }
            
            // Botones del flujo de entrega
            if (order.status == "ACCEPTED") {
                // Botón: En camino al restaurante
                Button(
                    onClick = {
                        viewModel.goToStore(order.id)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2196F3)),  // Azul
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.DirectionsBike,
                        contentDescription = null,
                        modifier = Modifier.size(24.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "#1 En camino al restaurante",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Color.White
                    )
                }
            }
            
            if (order.status == "ON_THE_WAY_TO_STORE") {
                // Botón: Llegué al restaurante
                Button(
                    onClick = {
                        viewModel.arrivedAtStore(order.id)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF9800)),  // Naranja
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Store,
                        contentDescription = null,
                        modifier = Modifier.size(24.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "#2 Llegué al restaurante",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Color.White
                    )
                }
            }
            
            if (order.status == "ARRIVED_AT_STORE") {
                // Botón: Recogiendo pedido
                Button(
                    onClick = {
                        viewModel.pickingUpOrder(order.id)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9C27B0)),  // Morado
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Restaurant,
                        contentDescription = null,
                        modifier = Modifier.size(24.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "#3 Repartidor con alimentos en mochila",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Color.White
                    )
                }
            }
            
            if (order.status == "PICKING_UP_ORDER") {
                // Botón: En camino al cliente
                Button(
                    onClick = {
                        viewModel.goToCustomer(order.id)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00BCD4)),  // Cian
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.DirectionsCar,
                        contentDescription = null,
                        modifier = Modifier.size(24.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "#4 En camino al cliente",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Color.White
                    )
                }
            }
            
            if (order.status == "ON_THE_WAY_TO_CUSTOMER") {
                // Botón: Pedido entregado (con validación de código)
                Button(
                    onClick = {
                        showCodeDialog = true
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50)),  // Verde
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        modifier = Modifier.size(24.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "#5 Pedido entregado",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Color.White
                    )
                }
                
                // Código de confirmación
                if (order.customerCode.isNotEmpty()) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF4CAF50).copy(alpha = 0.2f)),
                        border = BorderStroke(2.dp, Color(0xFF4CAF50)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "✅ Código de Confirmación",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF4CAF50)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = order.customerCode,
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF4CAF50)
                            )
                            Text(
                                text = "Muestra este código al cliente",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFF4CAF50)
                            )
                        }
                    }
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
            
            // Botones específicos para MOTOCICLETA (servicio de pasajeros)
            if (order.serviceType == "MOTORCYCLE_TAXI") {
                if (order.status == "ACCEPTED") {
                    // Botón: En camino a recoger pasajero
                    Button(
                        onClick = {
                            viewModel.goToPickup(order.id)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),  // Azul
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.DirectionsBike,
                            contentDescription = null,
                            modifier = Modifier.size(24.dp),
                            tint = Color.White
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "🏍️ #1 En camino a recoger pasajero",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = Color.White
                        )
                    }
                }
                
                if (order.status == "ON_THE_WAY_TO_PICKUP") {
                    // Botón: Llegué al punto de recogida
                    Button(
                        onClick = {
                            viewModel.arrivedAtPickup(order.id)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),  // Verde
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            modifier = Modifier.size(24.dp),
                            tint = Color.White
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "📍 #2 Llegué al punto de recogida",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = Color.White
                        )
                    }
                }
                
                if (order.status == "ARRIVED_AT_PICKUP") {
                    // Botón: En camino al destino
                    Button(
                        onClick = {
                            viewModel.goToDestination(order.id)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),  // Naranja
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.DirectionsCar,
                            contentDescription = null,
                            modifier = Modifier.size(24.dp),
                            tint = Color.White
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "🛣️ #3 En camino al destino",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = Color.White
                        )
                    }
                }
                
                if (order.status == "ON_THE_WAY_TO_DESTINATION") {
                    // Botón: Viaje completado
                    Button(
                        onClick = {
                            viewModel.deliveredOrder(order.id)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),  // Rojo
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            modifier = Modifier.size(24.dp),
                            tint = Color.White
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "🎯 #4 Viaje completado",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}
