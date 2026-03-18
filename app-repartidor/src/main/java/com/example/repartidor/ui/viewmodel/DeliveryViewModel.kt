package com.example.repartidor.ui.viewmodel

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import androidx.compose.runtime.mutableStateOf
import androidx.core.app.NotificationCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.repartidor.MainActivity
import com.example.repartidor.data.model.DeliveryPerson
import com.example.repartidor.data.model.Message
import com.example.repartidor.data.model.Order
import com.example.repartidor.utils.NotificationHelper
import com.example.repartidor.utils.WhatsAppIntegration

import com.example.repartidor.data.repository.OrderRepository
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.GenericTypeIndicator
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class DeliveryViewModel : ViewModel() {
    
    private var sharedPreferences: SharedPreferences? = null
    private val database = FirebaseDatabase.getInstance()
    private val deliveryPersonsRef = database.getReference("delivery_persons")
    private val ordersRef = database.getReference("orders")
    private val orderRepository = OrderRepository()
    
    // Función para verificar si el repartidor tiene un pedido activo
    private fun hasActiveOrder(): Boolean {
        return _orders.value.any { order ->
            order.status in listOf("ACCEPTED", "ON_THE_WAY_TO_STORE", "ARRIVED_AT_STORE", "PICKING_UP_ORDER", "ON_THE_WAY_TO_CUSTOMER")
        }
    }
    
    // Nuevo método para aceptar un pedido manualmente
    fun acceptOrder(orderId: String) {
        viewModelScope.launch {
            // Verificar si el repartidor ya tiene un pedido activo
            if (hasActiveOrder()) {
                _errorMessage.value = "Ya tienes un pedido activo. Por favor, finaliza ese pedido antes de aceptar uno nuevo."
                return@launch
            }
            
            _deliveryPerson.value?.let { deliveryPerson ->
                // Llamar al repositorio de admin para aceptar el pedido
                try {
                    val result = repositoryAcceptOrder(orderId, deliveryPerson)
                    result.fold(
                        onSuccess = {
                            _errorMessage.value = "Pedido aceptado exitosamente"
                            // Notificar al usuario que ha aceptado un pedido
                            triggerNotification("¡Pedido Aceptado!", "Has aceptado el pedido con éxito")
                        },
                        onFailure = { exception ->
                            _errorMessage.value = "Error al aceptar pedido: ${exception.message}"
                        }
                    )
                } catch (e: Exception) {
                    _errorMessage.value = "Error al aceptar pedido: ${e.message}"
                }
            }
        }
    }
    
    // Función para actualizar el estado de un pedido
    fun updateOrderStatus(orderId: String, newStatus: String) {
        viewModelScope.launch {
            try {
                // Primero obtener el pedido para tener acceso al número de teléfono del cliente
                val order = orderRepository.getOrderById(orderId)
                
                val result = orderRepository.updateOrderStatus(orderId, newStatus)
                result.fold(
                    onSuccess = {
                        _errorMessage.value = "Estado del pedido actualizado a: $newStatus"
                        
                        // Enviar notificación al administrador sobre el cambio de estado
                        val statusMessage = when (newStatus) {
                            "ON_THE_WAY_TO_STORE" -> "Repartidor en camino al restaurante"
                            "ARRIVED_AT_STORE" -> "Repartidor llegó al restaurante"
                            "PICKING_UP_ORDER" -> "Repartidor recogiendo pedido"
                            "ON_THE_WAY_TO_CUSTOMER" -> "Repartidor en camino a la entrega"
                            "DELIVERED" -> "Pedido entregado"
                            else -> "Estado actualizado: $newStatus"
                        }
                        
                        // Enviar mensaje al administrador
                        sendMessage("admin", "Administrador", "Pedido $orderId - $statusMessage")
                        
                        // Enviar notificación por WhatsApp al cliente si está disponible
                        if (order != null && order.customer.phone.isNotEmpty()) {
                            val clientStatusMessage = when (newStatus) {
                                "ON_THE_WAY_TO_STORE" -> "Hola, tu repartidor asignado es ${order.assignedToDeliveryName} y tu repartidor va en camino al restaurante para recoger tu pedido."
                                "ARRIVED_AT_STORE" -> "Hola, tu pedido está siendo preparado en este momento. Tu repartidor ${order.assignedToDeliveryName} espera por ti."
                                "PICKING_UP_ORDER" -> "Hola, tu pedido ya está listo para ser recogido. Tu repartidor ${order.assignedToDeliveryName} está por recogerlo."
                                "ON_THE_WAY_TO_CUSTOMER" -> "Hola, tu repartidor ${order.assignedToDeliveryName} ya recogió tu pedido y está en camino a tu ubicación. ¡Pronto recibirás tu pedido!"
                                "DELIVERED" -> "Hola, tu pedido ha sido entregado con éxito. Gracias por confiar en nuestro servicio."
                                else -> "Tu pedido ha sido actualizado a: $newStatus"
                            }
                            
                            // Usar el callback estático de WhatsAppIntegration
                            val whatsappCallback = WhatsAppIntegration.getWhatsAppCallback()
                            if (whatsappCallback != null) {
                                println("DEBUG: Intentando enviar mensaje de WhatsApp al cliente: ${order.customer.phone}")
                                println("DEBUG: Mensaje: $clientStatusMessage")
                                whatsappCallback.invoke(order.customer.phone, "$clientStatusMessage")
                            } else {
                                println("DEBUG: Callback de WhatsApp no está inicializado")
                            }
                        } else {
                            println("DEBUG: No hay información del cliente o teléfono vacío para el pedido $orderId")
                        }
                    },
                    onFailure = { exception ->
                        _errorMessage.value = "Error al actualizar estado: ${exception.message}"
                    }
                )
            } catch (e: Exception) {
                _errorMessage.value = "Error al actualizar estado: ${e.message}"
            }
        }
    }
    
    // Función para ir en camino al restaurante
    fun goToStore(orderId: String) {
        updateOrderStatus(orderId, "ON_THE_WAY_TO_STORE")
    }
    
    // Función para indicar que llegó al restaurante
    fun arrivedAtStore(orderId: String) {
        updateOrderStatus(orderId, "ARRIVED_AT_STORE")
    }
    
    // Función para indicar que el repartidor tiene los alimentos
    fun pickingUpOrder(orderId: String) {
        updateOrderStatus(orderId, "PICKING_UP_ORDER")
    }
    
    // Función para indicar que va en camino al cliente
    fun goToCustomer(orderId: String) {
        updateOrderStatus(orderId, "ON_THE_WAY_TO_CUSTOMER")
    }
    
    // Función para indicar que el pedido fue entregado
    fun deliveredOrder(orderId: String) {
        // Primero obtener el pedido para calcular la ganancia
        viewModelScope.launch {
            val order = _orders.value.find { it.id == orderId }
            if (order != null) {
                // Sumar la ganancia del pedido a las ganancias diarias
                addDailyEarning(order.deliveryCost)
                
                // Actualizar el estado del pedido
                updateOrderStatus(orderId, "DELIVERED")
                
                // Esperar brevemente para asegurar que la actualización se procese
                delay(100)
                
                // Forzar una actualización del estado de los pedidos para reflejar la entrega
                val updatedOrders = _orders.value.map { existingOrder ->
                    if (existingOrder.id == orderId) {
                        existingOrder.copy(status = "DELIVERED", deliveredAt = System.currentTimeMillis())
                    } else {
                        existingOrder
                    }
                }
                _orders.value = updatedOrders
            }
        }
    }
    
    // Método auxiliar para aceptar pedido
    private suspend fun repositoryAcceptOrder(orderId: String, deliveryPerson: DeliveryPerson): Result<Unit> {
        return try {
            // Acceder directamente al repositorio de admin para aceptar el pedido
            // Crear una referencia temporal al repositorio de admin
            val database = FirebaseDatabase.getInstance()
            val ordersRef = database.getReference("orders")
            val orderSnapshot = ordersRef.child(orderId).get().await()
            
            val currentStatus = orderSnapshot.child("status").getValue(String::class.java)
            val assignedToId = orderSnapshot.child("assignedToDeliveryId").getValue(String::class.java) ?: ""
            
            // Verificar que el pedido esté disponible para aceptar
            if (currentStatus == "MANUAL_ASSIGNED" && assignedToId.isEmpty()) {
                val updates = mapOf(
                    "assignedToDeliveryId" to deliveryPerson.id,
                    "assignedToDeliveryName" to deliveryPerson.name,
                    "status" to "ACCEPTED",
                    "candidateDeliveryIds" to emptyList<String>()
                )
                ordersRef.child(orderId).updateChildren(updates).await()
                Result.success(Unit)
            } else {
                Result.failure(Exception("Pedido no disponible para aceptar"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    private val _deliveryId = MutableStateFlow<String?>(null)
    val deliveryId: StateFlow<String?> = _deliveryId.asStateFlow()
    
    private val _deliveryPerson = MutableStateFlow<DeliveryPerson?>(null)
    val deliveryPerson: StateFlow<DeliveryPerson?> = _deliveryPerson.asStateFlow()
    
    private val _orders = MutableStateFlow<List<Order>>(emptyList())
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()
    
    // Flujo combinado que filtra los pedidos según el estado de conexión
    private val _filteredOrders = combine(_orders, _deliveryPerson) { orders, deliveryPerson ->
        val isOnline = deliveryPerson?.isOnline ?: false
        
        if (isOnline) {
            // Si está en línea, mostrar todos los pedidos
            orders
        } else {
            // Si está desconectado, solo mostrar pedidos que ya ha aceptado
            orders.filter { order ->
                order.status == "ACCEPTED" || 
                order.status == "ON_THE_WAY_TO_STORE" || 
                order.status == "ARRIVED_AT_STORE" || 
                order.status == "PICKING_UP_ORDER" || 
                order.status == "ON_THE_WAY_TO_CUSTOMER"
            }
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )
    
    val filteredOrders: StateFlow<List<Order>> = _filteredOrders
    
    private val _completedOrders = MutableStateFlow<List<Order>>(emptyList())
    val completedOrders: StateFlow<List<Order>> = _completedOrders.asStateFlow()
    
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()
    
    private val _dailyEarnings = MutableStateFlow<Double>(0.0)
    val dailyEarnings: StateFlow<Double> = _dailyEarnings.asStateFlow()
    
    private val _weeklyEarnings = MutableStateFlow<Double>(0.0)
    val weeklyEarnings: StateFlow<Double> = _weeklyEarnings.asStateFlow()
    
    private val _monthlyEarnings = MutableStateFlow<Double>(0.0)
    val monthlyEarnings: StateFlow<Double> = _monthlyEarnings.asStateFlow()
    
    private val _dailyOrdersCount = MutableStateFlow<Int>(0)
    val dailyOrdersCount: StateFlow<Int> = _dailyOrdersCount.asStateFlow()
    
    fun initialize(context: Context) {
        this.sharedPreferences = context.getSharedPreferences("delivery_prefs", Context.MODE_PRIVATE)
        loadSavedId()
        observeAssignedOrdersWithContext(context)
        observeCompletedOrders()
        observeMessages()
        
        // Cargar estado actual de conexión desde Firebase al inicializar
        _deliveryId.value?.let { deliveryId ->
            if (deliveryId.isNotEmpty()) {
                // Priorizar el estado deseado por el usuario si existe, de lo contrario cargar desde Firebase
                val desiredOnlineStatus = sharedPreferences?.getBoolean("desired_online_status", true) ?: true
                val desiredActiveStatus = sharedPreferences?.getBoolean("desired_active_status", true) ?: true
                
                // Actualizar el estado local con los valores deseados
                _deliveryPerson.value?.let { currentPerson ->
                    val updatedPerson = currentPerson.copy(
                        isOnline = desiredOnlineStatus,
                        isActive = desiredActiveStatus
                    )
                    _deliveryPerson.value = updatedPerson
                }
                
                // Actualizar también en Firebase con los valores deseados
                updatePresence(desiredOnlineStatus, desiredActiveStatus)
            }
        }
        
        // Cargar ganancias diarias
        loadDailyEarnings()
        
        // Iniciar la verificación periódica de validez de la cuenta
        startAccountValidationCheck()
    }
    
    private fun loadDailyEarnings() {
        // Verificar si sharedPreferences está inicializado
        val prefs = sharedPreferences ?: return
        
        // Verificar si es un nuevo día y reiniciar si es necesario
        val today = getCurrentDateString()
        val lastAccessedDay = prefs.getString("last_accessed_day", "")
        
        if (today != lastAccessedDay) {
            // Es un nuevo día, reiniciar las ganancias
            _dailyEarnings.value = 0.0
            _dailyOrdersCount.value = 0
            prefs.edit().putString("last_accessed_day", today).apply()
        } else {
            // Cargar las ganancias del día actual
            _dailyEarnings.value = prefs.getFloat("daily_earnings", 0.0f).toDouble()
            _dailyOrdersCount.value = prefs.getInt("daily_orders_count", 0)
        }
        
        // Cargar ganancias semanales y mensuales
        loadWeeklyEarnings()
        loadMonthlyEarnings()
    }
    
    private fun saveDailyEarnings() {
        // Verificar si sharedPreferences está inicializado
        val prefs = sharedPreferences ?: return
        
        prefs.edit()
            .putFloat("daily_earnings", _dailyEarnings.value.toFloat())
            .putFloat("weekly_earnings", _weeklyEarnings.value.toFloat())
            .putFloat("monthly_earnings", _monthlyEarnings.value.toFloat())
            .putInt("daily_orders_count", _dailyOrdersCount.value)
            .putString("last_accessed_day", getCurrentDateString())
            .putString("last_accessed_week", getCurrentWeekString())
            .putString("last_accessed_month", getCurrentMonthString())
            .apply()
    }
    
    private fun getCurrentDateString(): String {
        val formatter = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
        return formatter.format(java.util.Date())
    }
    
    private fun getCurrentWeekString(): String {
        val formatter = java.text.SimpleDateFormat("yyyy-w", java.util.Locale.getDefault())
        return formatter.format(java.util.Date())
    }
    
    private fun getCurrentMonthString(): String {
        val formatter = java.text.SimpleDateFormat("yyyy-MM", java.util.Locale.getDefault())
        return formatter.format(java.util.Date())
    }
    
    private fun loadWeeklyEarnings() {
        val prefs = sharedPreferences ?: return
        
        val currentWeek = getCurrentWeekString()
        val lastAccessedWeek = prefs.getString("last_accessed_week", "")
        
        if (currentWeek != lastAccessedWeek) {
            // Es una nueva semana, reiniciar las ganancias
            _weeklyEarnings.value = 0.0
            prefs.edit().putString("last_accessed_week", currentWeek).apply()
        } else {
            // Cargar las ganancias de la semana actual
            _weeklyEarnings.value = prefs.getFloat("weekly_earnings", 0.0f).toDouble()
        }
    }
    
    private fun loadMonthlyEarnings() {
        val prefs = sharedPreferences ?: return
        
        val currentMonth = getCurrentMonthString()
        val lastAccessedMonth = prefs.getString("last_accessed_month", "")
        
        if (currentMonth != lastAccessedMonth) {
            // Es un nuevo mes, reiniciar las ganancias
            _monthlyEarnings.value = 0.0
            prefs.edit().putString("last_accessed_month", currentMonth).apply()
        } else {
            // Cargar las ganancias del mes actual
            _monthlyEarnings.value = prefs.getFloat("monthly_earnings", 0.0f).toDouble()
        }
    }
    
    fun addDailyEarning(amount: Double) {
        _dailyEarnings.value += amount
        _weeklyEarnings.value += amount
        _monthlyEarnings.value += amount
        _dailyOrdersCount.value = _dailyOrdersCount.value + 1
        saveDailyEarnings()
    }
    
    private fun observeMessages() {
        viewModelScope.launch {
            _deliveryId.collect { deliveryId ->
                if (!deliveryId.isNullOrEmpty()) {
                    val previousMessages = mutableListOf<Message>()
                    // Aquí necesitamos instanciar el repositorio de mensajes
                    val messageRepository = com.example.repartidor.data.repository.MessageRepository()
                    
                    // Observar mensajes recibidos y enviados
                    messageRepository.observeMessagesForReceiverAndSender(deliveryId).collect { messages ->
                        // Detectar nuevos mensajes
                        val newMessages = messages.filter { message ->
                            previousMessages.none { it.id == message.id }
                        }
                        
                        _messages.value = messages
                        
                        // Actualizar la lista anterior para la próxima comparación
                        previousMessages.clear()
                        previousMessages.addAll(messages)
                        
                        // Emitir notificación para nuevos mensajes
                        if (newMessages.isNotEmpty()) {
                            // Para usar notificaciones reales, necesitamos el contexto de la aplicación
                            // Este se puede pasar desde la Activity cuando se inicializa el ViewModel
                            // triggerMessageNotification("Nuevo mensaje", "Tienes ${newMessages.size} nuevo(s) mensaje(s)")
                        }
                    }
                }
            }
        }
    }
    
    private fun triggerMessageNotification(title: String, message: String) {
        // Esta función puede ser expandida para usar notificaciones reales
        println("🔔 MENSAJE NOTIFICACIÓN: $title - $message")
        // Aquí podrías integrar con el sistema de notificaciones de Android
    }
    
    fun sendMessage(
        receiverId: String,
        receiverName: String,
        message: String,
        messageType: com.example.repartidor.data.model.MessageType = com.example.repartidor.data.model.MessageType.TEXT
    ) {
        viewModelScope.launch {
            _deliveryPerson.value?.let { deliveryPerson ->
                val messageRepository = com.example.repartidor.data.repository.MessageRepository()
                messageRepository.sendMessage(
                    senderId = deliveryPerson.id,
                    senderName = deliveryPerson.name,
                    receiverId = receiverId,
                    receiverName = receiverName,
                    message = message,
                    messageType = messageType
                ).fold(
                    onSuccess = { 
                        _errorMessage.value = "Mensaje enviado exitosamente"
                    },
                    onFailure = { exception ->
                        _errorMessage.value = "Error al enviar mensaje: ${exception.message}"
                    }
                )
            }
        }
    }
    
    private fun loadSavedId() {
        sharedPreferences?.let { prefs ->
            val savedId = prefs.getString("delivery_id", null)
            savedId?.let { id ->
                _deliveryId.value = id
                // Load person data from Firebase
                loadDeliveryPersonFromFirebase(id)
            }
        }
    }
    
    fun loginWithId(deliveryId: String, context: Context? = null) {
        _isLoading.value = true
        _errorMessage.value = null
        
        // Limpiar datos previos antes de iniciar sesión con nuevo ID
        clearAllData()
        
        // Validate from Firebase
        validateDeliveryIdFromFirebase(deliveryId, context)
    }
    
    private fun validateDeliveryIdFromFirebase(deliveryId: String, context: Context? = null) {
        viewModelScope.launch {
            try {
                val snapshot = deliveryPersonsRef.child(deliveryId).get().await()
                if (snapshot.exists()) {
                    // Leer directamente el valor de isApproved desde Firebase
                    val isApprovedSnapshot = snapshot.child("isApproved")
                    val isApproved = if (isApprovedSnapshot.exists()) {
                        isApprovedSnapshot.getValue(Boolean::class.java) ?: false
                    } else {
                        false
                    }
                    
                    if (isApproved) {
                        // Si está aprobado, obtener el objeto completo
                        val person = snapshot.getValue(DeliveryPerson::class.java)
                        if (person != null) {
                            // Cargar también el estado de presencia
                            val presenceSnapshot = database.getReference("presence").child(deliveryId).get().await()
                            if (presenceSnapshot.exists()) {
                                val isOnline = presenceSnapshot.child("isOnline").getValue(Boolean::class.java) ?: false
                                val isActive = presenceSnapshot.child("isActive").getValue(Boolean::class.java) ?: false
                                val lastSeen = presenceSnapshot.child("lastSeen").getValue(Long::class.java) ?: 0L
                                
                                val updatedPerson = person.copy(
                                    isOnline = isOnline,
                                    isActive = isActive,
                                    lastSeen = lastSeen
                                )
                                _deliveryPerson.value = updatedPerson
                            } else {
                                _deliveryPerson.value = person
                            }
                            
                            saveDeliveryId(deliveryId)
                            
                            // Al iniciar sesión, cargar el estado deseado de conexión y marcar como activo
                            val desiredOnlineStatus = sharedPreferences?.getBoolean("desired_online_status", true) ?: true
                            
                            // Marcar al usuario como activo (dentro de la app) al iniciar sesión, manteniendo su estado de conexión deseado
                            updatePresence(desiredOnlineStatus, true)
                            
                            // Si hay contexto, iniciar la observación de pedidos para el nuevo repartidor
                            context?.let { ctx ->
                                observeAssignedOrdersWithContext(ctx)
                            }
                            
                            _errorMessage.value = null
                        } else {
                            _errorMessage.value = "ID encontrado pero sin datos válidos"
                        }
                    } else {
                        _errorMessage.value = "ID encontrado pero no autorizado. isApproved=$isApproved"
                    }
                } else {
                    _errorMessage.value = "ID de repartidor no encontrado"
                }
            } catch (e: Exception) {
                _errorMessage.value = "Error de conexión: ${e.message}"
            }
            _isLoading.value = false
        }
    }
    
    private fun loadDeliveryPersonFromFirebase(deliveryId: String) {
        viewModelScope.launch {
            try {
                val snapshot = deliveryPersonsRef.child(deliveryId).get().await()
                if (snapshot.exists()) {
                    // Leer directamente el valor de isApproved desde Firebase
                    val isApprovedSnapshot = snapshot.child("isApproved")
                    val isApproved = if (isApprovedSnapshot.exists()) {
                        isApprovedSnapshot.getValue(Boolean::class.java) ?: false
                    } else {
                        false
                    }
                        
                    if (isApproved) {
                        // Si está aprobado, obtener el objeto completo
                        val person = snapshot.getValue(DeliveryPerson::class.java)
                        if (person != null) {
                            // Cargar también el estado de presencia
                            val presenceSnapshot = database.getReference("presence").child(deliveryId).get().await()
                            if (presenceSnapshot.exists()) {
                                val isOnline = presenceSnapshot.child("isOnline").getValue(Boolean::class.java) ?: false
                                val isActive = presenceSnapshot.child("isActive").getValue(Boolean::class.java) ?: false
                                val lastSeen = presenceSnapshot.child("lastSeen").getValue(Long::class.java) ?: 0L
                                    
                                val updatedPerson = person.copy(
                                    isOnline = isOnline,
                                    isActive = isActive,
                                    lastSeen = lastSeen
                                )
                                _deliveryPerson.value = updatedPerson
                            } else {
                                _deliveryPerson.value = person
                            }
                        }
                    } else {
                        println("DEBUG: Persona encontrada pero no aprobada. ID: $deliveryId, isApproved=$isApproved")
                    }
                }
            } catch (e: Exception) {
                // Handle silently or log if needed
                println("DEBUG: Error al cargar persona desde Firebase: ${'$'}{e.message}")
            }
        }
    }
    
    private fun observeAssignedOrders() {
        viewModelScope.launch {
            _deliveryId.collect { deliveryId ->
                if (!deliveryId.isNullOrEmpty()) {
                    val previousOrders = mutableListOf<Order>()
                    orderRepository.observeAssignedOrders(deliveryId).collect { newOrders ->
                        // Filtrar pedidos activos (no completados)
                        val activeOrders = newOrders.filter { order ->
                            order.status != "DELIVERED"
                        }
                        
                        // Detectar nuevos pedidos asignados
                        val newAssignedOrders = activeOrders.filter { order ->
                            (order.status in listOf("ASSIGNED", "MANUAL_ASSIGNED", "ACCEPTED") || order.orderType == "MANUAL" || order.orderType == "RESTAURANT") &&
                            order.assignedToDeliveryId == deliveryId &&
                            previousOrders.none { it.id == order.id }
                        }
                        
                        // Actualizar la lista de pedidos activos
                        _orders.value = activeOrders.sortedByDescending { it.createdAt }
                        
                        // Actualizar la lista anterior para la próxima comparación
                        previousOrders.clear()
                        previousOrders.addAll(activeOrders)
                        
                        // Emitir notificación para nuevos pedidos asignados
                        if (newAssignedOrders.isNotEmpty()) {
                            // Para usar notificaciones reales, necesitamos el contexto de la aplicación
                            // Este se puede pasar desde la Activity cuando se inicializa el ViewModel
                            // triggerNotification("¡Nuevo pedido asignado!", "Tienes ${newAssignedOrders.size} nuevo(s) pedido(s) asignado(s)")
                        }
                    }
                }
            }
        }
    }
    
    fun observeAssignedOrdersWithContext(context: Context) {
        viewModelScope.launch {
            _deliveryId.collect { deliveryId ->
                if (!deliveryId.isNullOrEmpty()) {
                    val previousOrders = mutableListOf<Order>()
                    orderRepository.observeAssignedOrders(deliveryId).collect { newOrders ->
                        // Filtrar pedidos activos (no completados)
                        val activeOrders = newOrders.filter { order ->
                            order.status != "DELIVERED"
                        }
                        
                        // Detectar nuevos pedidos asignados
                        val newAssignedOrders = activeOrders.filter { order ->
                            (order.status in listOf("ASSIGNED", "MANUAL_ASSIGNED", "ACCEPTED") || order.orderType == "MANUAL" || order.orderType == "RESTAURANT") &&
                            order.assignedToDeliveryId == deliveryId &&
                            previousOrders.none { it.id == order.id }
                        }
                        
                        // Actualizar la lista de pedidos activos
                        // IMPORTANTE: No filtramos por estado de conexión aquí, ya que el repositorio
                        // ya se encarga de devolver solo los pedidos relevantes para este repartidor
                        _orders.value = activeOrders.sortedByDescending { it.createdAt }
                        
                        // Actualizar la lista anterior para la próxima comparación
                        previousOrders.clear()
                        previousOrders.addAll(activeOrders)
                        
                        // Emitir notificación para nuevos pedidos asignados
                        if (newAssignedOrders.isNotEmpty()) {
                            triggerNotificationWithContext(context, "¡Nuevo pedido asignado!", "Tienes ${newAssignedOrders.size} nuevo(s) pedido(s) asignado(s)")
                        }
                    }
                }
            }
        }
    }
    
    // Función para observar pedidos completados (historial)
    private fun observeCompletedOrders() {
        viewModelScope.launch {
            _deliveryId.collect { deliveryId ->
                if (!deliveryId.isNullOrEmpty()) {
                    val previousOrders = mutableListOf<Order>()
                    orderRepository.observeAssignedOrders(deliveryId).collect { allOrders ->
                        // Filtrar solo pedidos completados
                        val completedOrders = allOrders.filter { order ->
                            order.status == "DELIVERED" && order.assignedToDeliveryId == deliveryId
                        }
                        
                        // Calcular las ganancias diarias solo para hoy
                        val today = getCurrentDateString()
                        val todayCompletedOrders = completedOrders.filter { order ->
                            // Extraer la fecha del timestamp de creación del pedido
                            val orderDate = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()).format(java.util.Date(order.createdAt))
                            orderDate == today
                        }
                        
                        // Calcular ganancias totales del día actual
                        val todayEarnings = todayCompletedOrders.sumOf { it.deliveryCost }
                        val todayOrdersCount = todayCompletedOrders.size
                        
                        // Actualizar las ganancias diarias
                        _dailyEarnings.value = todayEarnings
                        _dailyOrdersCount.value = todayOrdersCount
                        
                        // Actualizar la lista de pedidos completados
                        _completedOrders.value = completedOrders.sortedByDescending { it.createdAt }
                        
                        // Actualizar la lista anterior para la próxima comparación
                        previousOrders.clear()
                        previousOrders.addAll(completedOrders)
                    }
                }
            }
        }
    }
    
    private fun triggerNotification(title: String, message: String) {
        // Esta función puede ser expandida para usar notificaciones reales
        println("🔔 NOTIFICACIÓN: $title - $message")
        // Aquí podrías integrar con el sistema de notificaciones de Android
    }
    
    fun triggerNotificationWithContext(context: Context, title: String, message: String) {
        // Mostrar notificación usando el contexto proporcionado
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Crear canal de notificación si es necesario
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = android.app.NotificationChannel(
                "order_notifications",
                "Notificaciones de Pedidos",
                NotificationManager.IMPORTANCE_HIGH
            )
            channel.description = "Notificaciones para nuevos pedidos asignados"
            notificationManager.createNotificationChannel(channel)
        }
        
        // Crear intent para abrir la aplicación al tocar la notificación
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = android.app.PendingIntent.getActivity(
            context, 0, intent, 
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )
        
        // Crear y mostrar la notificación
        val notification = NotificationCompat.Builder(context, "order_notifications")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()
        
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
    
    fun showOrderNotification(context: Context, title: String, message: String) {
        NotificationHelper.showOrderNotification(context, title, message)
    }
    
    fun showNotificationForNewOrder(context: Context, newOrdersCount: Int) {
        if (newOrdersCount > 0) {
            val title = if (newOrdersCount == 1) "¡Nuevo pedido asignado!" else "¡Nuevos pedidos asignados!"
            val message = "Tienes ${newOrdersCount} nuevo(s) pedido(s) asignado(s)"
            showOrderNotification(context, title, message)
        }
    }
    
    fun showNotificationForNewMessage(context: Context, newMessagesCount: Int) {
        if (newMessagesCount > 0) {
            val title = if (newMessagesCount == 1) "Nuevo mensaje" else "Nuevos mensajes"
            val message = "Tienes ${newMessagesCount} nuevo(s) mensaje(s)"
            showOrderNotification(context, title, message)
        }
    }
    
    private fun saveDeliveryId(id: String) {
        sharedPreferences?.let { prefs ->
            prefs.edit().putString("delivery_id", id).apply()
        }
        _deliveryId.value = id
        // No actualizar presencia automáticamente al iniciar sesión, mantener el estado anterior
    }
    
    fun logout() {
        // Actualizar presencia como offline antes de cerrar sesión
        _deliveryId.value?.let { deliveryId ->
            updatePresence(false, false)
        }
        
        sharedPreferences?.let { prefs ->
            prefs.edit().clear().apply()
        }
        _deliveryId.value = null
        _deliveryPerson.value = null
        _orders.value = emptyList()
        _completedOrders.value = emptyList()
        _errorMessage.value = null
    }
    
    fun updatePresenceIfNeeded() {
        // Método para actualizar la presencia según el estado actual
        _deliveryId.value?.let { deliveryId ->
            val desiredOnlineStatus = sharedPreferences?.getBoolean("desired_online_status", true) ?: true
            val desiredActiveStatus = sharedPreferences?.getBoolean("desired_active_status", true) ?: true
            updatePresence(desiredOnlineStatus, desiredActiveStatus)
        }
    }
    
    fun clearError() {
        _errorMessage.value = null
    }
    
    // Función para actualizar la presencia
    fun updatePresence(isOnline: Boolean, isActive: Boolean) {
        _deliveryId.value?.let { deliveryId ->
            viewModelScope.launch {
                try {
                    val presenceData = mapOf(
                        "isOnline" to isOnline,
                        "isActive" to isActive,
                        "lastSeen" to System.currentTimeMillis()
                    )
                    val presenceRef = database.getReference("presence").child(deliveryId)
                    presenceRef.setValue(presenceData).await()
                        
                    // Guardar el estado deseado por el usuario en preferencias
                    sharedPreferences?.edit()?.putBoolean("desired_online_status", isOnline)?.apply()
                    sharedPreferences?.edit()?.putBoolean("desired_active_status", isActive)?.apply()
                        
                    // Actualizar también el objeto local de deliveryPerson
                    _deliveryPerson.value?.let { currentPerson ->
                        val updatedPerson = currentPerson.copy(
                            isOnline = isOnline,
                            isActive = isActive
                        )
                        _deliveryPerson.value = updatedPerson
                    }
                } catch (e: Exception) {
                    println("Error updating presence: ${'$'}{e.message}")
                }
            }
        }
    }
        
    fun getDesiredOnlineStatus(): Boolean {
        return sharedPreferences?.getBoolean("desired_online_status", true) ?: true
    }
        
    fun getDesiredActiveStatus(): Boolean {
        return sharedPreferences?.getBoolean("desired_active_status", true) ?: true
    }
        
    // Función para limpiar todos los datos de la sesión anterior
    private fun clearAllData() {
        _orders.value = emptyList()
        _completedOrders.value = emptyList()
        _messages.value = emptyList()
        _dailyEarnings.value = 0.0
        _weeklyEarnings.value = 0.0
        _monthlyEarnings.value = 0.0
        _dailyOrdersCount.value = 0
    }
    
    // Función para verificar si la cuenta del repartidor sigue siendo válida
    fun checkAccountValidity(): Boolean {
        val currentPerson = _deliveryPerson.value
        return currentPerson != null && currentPerson.isApproved
    }
    
    // Función para verificar periodicamente si la cuenta sigue válida
    fun startAccountValidationCheck() {
        viewModelScope.launch {
            while (true) {
                delay(30000) // Verificar cada 30 segundos
                val deliveryId = _deliveryId.value
                if (!deliveryId.isNullOrEmpty()) {
                    val isValid = verifyAccountRemainsValid(deliveryId)
                    if (!isValid) {
                        // La cuenta ya no es válida, limpiar datos y forzar cierre de sesión
                        logout()
                    }
                }
            }
        }
    }
    
    private suspend fun verifyAccountRemainsValid(deliveryId: String): Boolean {
        return try {
            val snapshot = deliveryPersonsRef.child(deliveryId).get().await()
            if (snapshot.exists()) {
                val isApproved = snapshot.child("isApproved").getValue(Boolean::class.java) ?: false
                isApproved
            } else {
                false // El ID ya no existe
            }
        } catch (e: Exception) {
            false // Error al verificar, asumir que no es válido
        }
    }
}