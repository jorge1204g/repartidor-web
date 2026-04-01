package com.example.repartidor.data.model

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
    val status: String = "PENDING",
    val assignedToDeliveryId: String = "",
    val assignedToDeliveryName: String = "",
    val candidateDeliveryIds: List<String> = emptyList(),
    val createdAt: Long = System.currentTimeMillis(),
    val deliveredAt: Long? = null,  // Momento en que se entregó el pedido
    val orderType: String? = null,  // Tipo de pedido: "MANUAL" o "RESTAURANT"
    val serviceType: String? = null,  // Tipo de servicio: "MOTORCYCLE_TAXI", "GASOLINE", etc.
    val distance: String? = null  // Distancia calculada (para motocicleta)
)

data class Location(
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
)

data class Customer(
    val name: String = "",
    val phone: String = "",
    val email: String = ""
) {
    // Propiedad que limpia el número de teléfono automáticamente
    val cleanedPhone: String
        get() = com.example.repartidor.utils.PhoneNumberUtils.cleanPhoneNumber(phone)
}

data class OrderItem(
    val name: String = "",
    val quantity: Int = 0,
    val unitPrice: Double = 0.0,
    val subtotal: Double = 0.0
)