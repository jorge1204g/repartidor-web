package com.example.aplicacionnuevaprueba1.data.model

data class Order(
    val id: String = "",
    val orderId: String = "",
    val restaurantName: String = "",
    val dateTime: String = "",
    val paymentMethod: String = "",
    val customer: Customer = Customer(),
    val items: List<OrderItem> = emptyList(),
    val subtotal: Double = 0.0,
    val deliveryCost: Double = 0.0,
    val total: Double = 0.0,
    val customerLocation: Location = Location(),
    val pickupLocationUrl: String = "",
    val deliveryAddress: String = "",
    val customerUrl: String = "",
    val deliveryReferences: String = "",
    val customerCode: String = "",  // Código del cliente para entrega
    val status: OrderStatus = OrderStatus.PENDING,
    val assignedToDeliveryId: String = "",
    val assignedToDeliveryName: String = "",
    val candidateDeliveryIds: List<String> = emptyList()  // Para asignación manual
)

data class Customer(
    val name: String = "",
    val phone: String = "",
    val email: String = ""
)

data class OrderItem(
    val name: String = "",
    val quantity: Int = 0,
    val unitPrice: Double = 0.0,
    val subtotal: Double = 0.0
)

data class Location(
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
)

enum class OrderStatus {
    PENDING,
    ASSIGNED,           // Asignado directamente
    MANUAL_ASSIGNED,    // Enviado a todos (manual)
    ACCEPTED,           // Aceptado por un repartidor
    ON_THE_WAY_TO_STORE,      // En camino a tienda/restaurante
    ARRIVED_AT_STORE,         // Llegó a la tienda
    PICKING_UP_ORDER,         // Recogiendo la comida
    ON_THE_WAY_TO_CUSTOMER,   // En camino al cliente
    DELIVERED,
    CANCELLED
}

data class Message(
    val id: String = "",
    val senderId: String = "",
    val senderName: String = "",
    val receiverId: String = "",
    val receiverName: String = "",
    val message: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val isRead: Boolean = false,
    val messageType: MessageType = MessageType.TEXT  // Tipo de mensaje
)

enum class MessageType {
    TEXT,           // Mensaje de texto
    STATUS_CHECK,   // Solicitud de estado
    ORDER_INFO,     // Información de pedido
    ALERT         // Alerta importante
}

data class DeliveryPerson(
    val id: String = "",
    val name: String = "",
    val phone: String = "",
    val email: String = "",
    val isAvailable: Boolean = true,
    val isApproved: Boolean = false,
    val registrationDate: String = "",
    val isOnline: Boolean = false,
    val isActive: Boolean = false,
    val lastSeen: Long = 0L
)

data class Client(
    val id: String = "",
    val email: String = "",
    val password: String = "",
    val name: String = "",
    val phone: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val status: String = "active", // active, blocked
    val address: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
)
