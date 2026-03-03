package com.example.aplicacionnuevaprueba1.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.aplicacionnuevaprueba1.data.model.*
import com.example.aplicacionnuevaprueba1.data.repository.OrderRepository
import com.example.aplicacionnuevaprueba1.utils.WhatsAppIntegration
import com.example.aplicacionnuevaprueba1.utils.WhatsAppLinkGenerator
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class AdminViewModel : ViewModel() {
    private val repository = OrderRepository()
    
    private val _orders = MutableStateFlow<List<Order>>(emptyList())
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()
    
    private val _activeOrders = MutableStateFlow<List<Order>>(emptyList())
    val activeOrders: StateFlow<List<Order>> = _activeOrders.asStateFlow()
    
    private val _orderHistory = MutableStateFlow<List<Order>>(emptyList())
    val orderHistory: StateFlow<List<Order>> = _orderHistory.asStateFlow()
    
    private val _deliveryPersons = MutableStateFlow<List<DeliveryPerson>>(emptyList())
    val deliveryPersons: StateFlow<List<DeliveryPerson>> = _deliveryPersons.asStateFlow()
    
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages.asStateFlow()
    
    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message.asStateFlow()
    
    init {
        observeOrders()
        observeDeliveryPersons()
        observeMessages()
        
        // Observar cambios en _orders y actualizar las listas filtradas
        viewModelScope.launch {
            _orders.collect { orders ->
                _activeOrders.value = orders.filter { order ->
                    order.status != OrderStatus.DELIVERED && order.status != OrderStatus.CANCELLED
                }
                _orderHistory.value = orders.filter { order ->
                    order.status == OrderStatus.DELIVERED || order.status == OrderStatus.CANCELLED
                }
            }
        }
    }
    
    private fun observeOrders() {
        viewModelScope.launch {
            repository.observeOrders().collect { ordersList ->
                _orders.value = ordersList
            }
        }
    }
    
    private fun observeDeliveryPersons() {
        viewModelScope.launch {
            repository.observeDeliveryPersons().collect { persons ->
                println("🔄 Admin received ${persons.size} delivery persons")
                persons.forEach { person ->
                    println("   👤 ${person.name} (ID: ${person.id}) - Online: ${person.isOnline}, Active: ${person.isActive}")
                }
                _deliveryPersons.value = persons
            }
        }
    }
    
    private fun observeMessages() {
        viewModelScope.launch {
            repository.observeMessagesForReceiverAndSender("admin").collect { messages ->
                _messages.value = messages
            }
        }
    }
    
    fun sendMessage(
        receiverId: String,
        receiverName: String,
        message: String,
        messageType: MessageType = MessageType.TEXT
    ) {
        viewModelScope.launch {
            repository.sendMessage(
                senderId = "admin",
                senderName = "Administrador",
                receiverId = receiverId,
                receiverName = receiverName,
                message = message,
                messageType = messageType
            ).fold(
                onSuccess = { 
                    _message.value = "Mensaje enviado exitosamente"
                },
                onFailure = { exception ->
                    _message.value = "Error al enviar mensaje: ${exception.message}"
                }
            )
        }
    }
    
    fun sendStatusCheckMessage(receiverId: String, receiverName: String) {
        sendMessage(
            receiverId = receiverId,
            receiverName = receiverName,
            message = "Por favor, confirme su estado actual",
            messageType = MessageType.STATUS_CHECK
        )
    }
    
    fun sendOrderInfoMessage(receiverId: String, receiverName: String, orderId: String, info: String) {
        sendMessage(
            receiverId = receiverId,
            receiverName = receiverName,
            message = "Información sobre pedido #$orderId: $info",
            messageType = MessageType.ORDER_INFO
        )
    }
    
    fun createOrder(
        orderId: String,
        restaurantName: String,
        dateTime: String,
        paymentMethod: String,
        customerName: String,
        customerPhone: String,
        customerEmail: String,
        items: List<OrderItem>,
        subtotal: Double,
        deliveryCost: Double,
        latitude: Double,
        longitude: Double,
        pickupLocationUrl: String = "",
        deliveryAddress: String = "",
        customerUrl: String = "",
        deliveryReferences: String = "",
        customerCode: String = ""
    ) {
        viewModelScope.launch {
            val order = Order(
                orderId = orderId,
                restaurantName = restaurantName,
                dateTime = dateTime,
                paymentMethod = paymentMethod,
                customer = Customer(customerName, customerPhone, customerEmail),
                items = items,
                subtotal = subtotal,
                deliveryCost = deliveryCost,
                total = subtotal + deliveryCost,
                customerLocation = Location(latitude, longitude),
                pickupLocationUrl = pickupLocationUrl,
                deliveryAddress = deliveryAddress,
                customerUrl = customerUrl,
                deliveryReferences = deliveryReferences,
                customerCode = customerCode
            )
            
            repository.createOrder(order).fold(
                onSuccess = { 
                    _message.value = "Pedido creado exitosamente"
                    // Force refresh of orders list
                    observeOrders()
                },
                onFailure = { _message.value = "Error al crear pedido: ${it.message}" }
            )
        }
    }
    
    fun assignOrder(order: Order, deliveryPerson: DeliveryPerson) {
        viewModelScope.launch {
            repository.assignOrderToDelivery(order.id, deliveryPerson).fold(
                onSuccess = { _message.value = "Pedido asignado a ${deliveryPerson.name}" },
                onFailure = { _message.value = "Error al asignar pedido: ${it.message}" }
            )
        }
    }
    
    fun assignOrderManually(orderId: String, deliveryPersonIds: List<String>) {
        viewModelScope.launch {
            repository.assignOrderManually(orderId, deliveryPersonIds).fold(
                onSuccess = { _message.value = "Pedido enviado a ${deliveryPersonIds.size} repartidores" },
                onFailure = { _message.value = "Error al asignar: ${it.message}" }
            )
        }
    }
    
    fun addDeliveryPerson(name: String, phone: String) {
        viewModelScope.launch {
            println("🔄 Adding delivery person: name='$name', phone='$phone'")
            val person = DeliveryPerson(name = name, phone = phone)
            repository.addDeliveryPerson(person, isAdminCreated = true).fold(
                onSuccess = { 
                    println("✅ Delivery person added successfully with ID: $it")
                    _message.value = "Repartidor agregado exitosamente"
                    // Force refresh of delivery persons list
                    observeDeliveryPersons()
                },
                onFailure = { 
                    println("❌ Error adding delivery person: ${it.message}")
                    _message.value = "Error al agregar repartidor: ${it.message}"
                }
            )
        }
    }
    
    fun deleteDeliveryPerson(deliveryId: String, deliveryName: String) {
        viewModelScope.launch {
            repository.deleteDeliveryPerson(deliveryId).fold(
                onSuccess = { _message.value = "Repartidor $deliveryName eliminado" },
                onFailure = { _message.value = "Error al eliminar: ${it.message}" }
            )
        }
    }
    
    fun approveDeliveryPerson(deliveryId: String) {
        viewModelScope.launch {
            repository.approveDeliveryPerson(deliveryId).fold(
                onSuccess = { 
                    _message.value = "Repartidor aprobado exitosamente"
                    // Force refresh of delivery persons list
                    observeDeliveryPersons()
                },
                onFailure = { _message.value = "Error al aprobar: ${it.message}" }
            )
        }
    }
    
    fun rejectDeliveryPerson(deliveryId: String, deliveryName: String) {
        viewModelScope.launch {
            repository.rejectDeliveryPerson(deliveryId).fold(
                onSuccess = { _message.value = "Repartidor $deliveryName rechazado" },
                onFailure = { _message.value = "Error al rechazar: ${it.message}" }
            )
        }
    }
    
    fun clearMessage() {
        _message.value = null
    }
    
    fun refreshDeliveryPersons() {
        observeDeliveryPersons()
    }
    
    fun deleteOrder(orderId: String) {
        viewModelScope.launch {
            repository.deleteOrder(orderId).fold(
                onSuccess = { _message.value = "Pedido eliminado" },
                onFailure = { _message.value = "Error al eliminar: ${it.message}" }
            )
        }
    }
    
    fun cancelOrder(orderId: String) {
        viewModelScope.launch {
            repository.cancelOrder(orderId).fold(
                onSuccess = { _message.value = "Pedido cancelado" },
                onFailure = { _message.value = "Error al cancelar: ${it.message}" }
            )
        }
    }
    
    fun updateOrderStatus(orderId: String, status: OrderStatus, whatsappCallback: ((phoneNumber: String, message: String) -> Unit)? = null) {
        viewModelScope.launch {
            // Primero obtener el pedido para tener acceso al número de teléfono del cliente
            val order = repository.getOrderById(orderId)
            
            // Actualizar el estado del pedido
            repository.updateOrderStatus(orderId, status).fold(
                onSuccess = {
                    _message.value = "Estado del pedido actualizado a: ${status.name}"
                    
                    // Si se proporciona un callback y tenemos información del cliente, enviar notificación de WhatsApp
                    if (whatsappCallback != null && order != null && order.customer.phone.isNotEmpty()) {
                        val statusMessage = when (status) {
                            OrderStatus.PENDING -> "Pedido recibido"
                            OrderStatus.ASSIGNED -> "Pedido asignado a un repartidor"
                            OrderStatus.MANUAL_ASSIGNED -> "Pedido enviado a repartidores"
                            OrderStatus.ACCEPTED -> "Pedido aceptado por repartidor"
                            OrderStatus.ON_THE_WAY_TO_STORE -> "Repartidor en camino al restaurante"
                            OrderStatus.ARRIVED_AT_STORE -> "Repartidor llegó al restaurante"
                            OrderStatus.PICKING_UP_ORDER -> "Repartidor recogiendo pedido"
                            OrderStatus.ON_THE_WAY_TO_CUSTOMER -> "Repartidor en camino a tu ubicación"
                            OrderStatus.DELIVERED -> "Pedido entregado"
                            OrderStatus.CANCELLED -> "Pedido cancelado"
                        }
                        whatsappCallback(order.customer.phone, "Estado del pedido #${order.orderId}: ${statusMessage}")
                    }
                    
                    // También intentar enviar notificación a través del callback estático de WhatsAppIntegration
                    val staticCallback = WhatsAppIntegration.getWhatsAppCallback()
                    if (staticCallback != null && order != null && order.customer.phone.isNotEmpty()) {
                        val statusMessage = when (status) {
                            OrderStatus.PENDING -> "Pedido recibido"
                            OrderStatus.ASSIGNED -> "Pedido asignado a un repartidor"
                            OrderStatus.MANUAL_ASSIGNED -> "Pedido enviado a repartidores"
                            OrderStatus.ACCEPTED -> "Pedido aceptado por repartidor"
                            OrderStatus.ON_THE_WAY_TO_STORE -> "Repartidor en camino al restaurante"
                            OrderStatus.ARRIVED_AT_STORE -> "Repartidor llegó al restaurante"
                            OrderStatus.PICKING_UP_ORDER -> "Repartidor recogiendo pedido"
                            OrderStatus.ON_THE_WAY_TO_CUSTOMER -> "Repartidor en camino a tu ubicación"
                            OrderStatus.DELIVERED -> "Pedido entregado"
                            OrderStatus.CANCELLED -> "Pedido cancelado"
                        }
                        println("DEBUG: Intentando enviar mensaje de WhatsApp al cliente: ${order.customer.phone}")
                        println("DEBUG: Mensaje: Estado del pedido #${order.orderId}: ${statusMessage}")
                        staticCallback(order.customer.phone, "Estado del pedido #${order.orderId}: ${statusMessage}")
                    } else {
                        println("DEBUG: Callback de WhatsApp no está inicializado o no hay información del cliente para el pedido $orderId")
                    }
                },
                onFailure = { _message.value = "Error al actualizar estado: ${it.message}" }
            )
        }
    }
    
    fun generateWhatsAppLinkForOrder(order: Order, message: String): String {
        return WhatsAppLinkGenerator.generateWhatsAppLink(order.customer.phone, message)
    }
    
    fun disconnectDeliveryPerson(deliveryId: String, deliveryName: String) {
        viewModelScope.launch {
            repository.updateDeliveryPersonPresence(deliveryId, false, false).fold(
                onSuccess = { 
                    _message.value = "Repartidor $deliveryName desconectado exitosamente"
                },
                onFailure = { 
                    _message.value = "Error al desconectar repartidor: ${it.message}"
                }
            )
        }
    }
    

}
