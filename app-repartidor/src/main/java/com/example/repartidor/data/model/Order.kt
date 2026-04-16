package com.example.repartidor.data.model

import com.google.firebase.database.IgnoreExtraProperties
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.GenericTypeIndicator

@IgnoreExtraProperties
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
    val pickupAddress: String = "",  // Dirección de origen para motocicleta
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
    val distance: String? = null,  // Distancia calculada (para motocicleta)
    val itemsOriginalString: String? = null,  // String original de items para motocicleta
    val additionalNotes: String? = null  // Notas adicionales del cliente
) {
    constructor() : this(
        id = "",
        orderId = "",
        restaurantName = "",
        dateTime = "",
        paymentMethod = "",
        customer = Customer(),
        items = emptyList(),
        subtotal = 0.0,
        deliveryCost = 0.0,
        total = 0.0,
        customerLocation = Location(),
        pickupLocationUrl = "",
        pickupAddress = "",
        deliveryAddress = "",
        customerUrl = "",
        deliveryReferences = "",
        customerCode = "",
        status = "PENDING",
        assignedToDeliveryId = "",
        assignedToDeliveryName = "",
        candidateDeliveryIds = emptyList(),
        createdAt = System.currentTimeMillis(),
        deliveredAt = null,
        orderType = null,
        serviceType = null,
        distance = null,
        itemsOriginalString = null,
        additionalNotes = null
    )
    
    companion object {
        @JvmStatic
        fun fromSnapshot(snapshot: DataSnapshot): Order? {
            return try {
                val id = snapshot.child("id").getValue(String::class.java) ?: snapshot.key ?: ""
                val orderId = snapshot.child("orderId").getValue(String::class.java) ?: ""
                val restaurantName = snapshot.child("restaurantName").getValue(String::class.java) ?: ""
                val dateTime = snapshot.child("dateTime").getValue(String::class.java) ?: ""
                val paymentMethod = snapshot.child("paymentMethod").getValue(String::class.java) ?: ""
                val customer = snapshot.child("customer").getValue(Customer::class.java) ?: Customer()
                val subtotal = snapshot.child("subtotal").getValue(Double::class.java) ?: 0.0
                val deliveryCost = snapshot.child("deliveryCost").getValue(Double::class.java) ?: 0.0
                val total = snapshot.child("total").getValue(Double::class.java) ?: 0.0
                val customerLocation = snapshot.child("customerLocation").getValue(Location::class.java) ?: Location()
                val pickupLocationUrl = snapshot.child("pickupLocationUrl").getValue(String::class.java) ?: ""
                val pickupAddress = snapshot.child("pickupAddress").getValue(String::class.java) ?: ""
                val deliveryAddress = snapshot.child("deliveryAddress").getValue(String::class.java) ?: ""
                val customerUrl = snapshot.child("customerUrl").getValue(String::class.java) ?: ""
                val deliveryReferences = snapshot.child("deliveryReferences").getValue(String::class.java) ?: ""
                val customerCodeRaw = snapshot.child("customerCode").value
                val customerCode = when (customerCodeRaw) {
                    is String -> customerCodeRaw
                    is Number -> customerCodeRaw.toString()
                    else -> ""
                }
                val status = snapshot.child("status").getValue(String::class.java) ?: "PENDING"
                val assignedToDeliveryId = snapshot.child("assignedToDeliveryId").getValue(String::class.java) ?: ""
                val assignedToDeliveryName = snapshot.child("assignedToDeliveryName").getValue(String::class.java) ?: ""
                val candidateDeliveryIds = snapshot.child("candidateDeliveryIds").getValue(object : GenericTypeIndicator<List<String>>() {}) ?: emptyList()
                val createdAt = snapshot.child("createdAt").getValue(Long::class.java) ?: System.currentTimeMillis()
                val deliveredAt = snapshot.child("deliveredAt").getValue(Long::class.java)
                val orderType = snapshot.child("orderType").getValue(String::class.java)
                val serviceType = snapshot.child("serviceType").getValue(String::class.java)
                
                // Manejar distance - puede ser String o Double en Firebase
                val distanceRaw = snapshot.child("distance").value
                val distance = when (distanceRaw) {
                    is String -> distanceRaw
                    is Number -> distanceRaw.toString()
                    else -> null
                }
                
                val itemsOriginalString = snapshot.child("itemsOriginalString").getValue(String::class.java)
                val additionalNotes = snapshot.child("additionalNotes").getValue(String::class.java)
                    ?: snapshot.child("additionalDescription").getValue(String::class.java)
                    ?: snapshot.child("notes").getValue(String::class.java)
                
                println("📝 [REPARTIDOR] additionalNotes desde Firebase: '$additionalNotes'")
                
                // Parsear items - puede venir como String o Array
                val itemsRaw = snapshot.child("items").value
                val items = parseItems(itemsRaw)
                
                println("✅ [REPARTIDOR] Pedido parseado: ID=$id, Status=$status, ServiceType=$serviceType, Items=${items.size}, Distance=$distance")
                
                Order(
                    id = id,
                    orderId = orderId,
                    restaurantName = restaurantName,
                    dateTime = dateTime,
                    paymentMethod = paymentMethod,
                    customer = customer,
                    items = items,
                    subtotal = subtotal,
                    deliveryCost = deliveryCost,
                    total = total,
                    customerLocation = customerLocation,
                    pickupLocationUrl = pickupLocationUrl,
                    pickupAddress = pickupAddress,
                    deliveryAddress = deliveryAddress,
                    customerUrl = customerUrl,
                    deliveryReferences = deliveryReferences,
                    customerCode = customerCode,
                    status = status,
                    assignedToDeliveryId = assignedToDeliveryId,
                    assignedToDeliveryName = assignedToDeliveryName,
                    candidateDeliveryIds = candidateDeliveryIds,
                    createdAt = createdAt,
                    deliveredAt = deliveredAt,
                    orderType = orderType,
                    serviceType = serviceType,
                    distance = distance,
                    itemsOriginalString = itemsOriginalString,
                    additionalNotes = additionalNotes
                )
            } catch (e: Exception) {
                println("❌ [REPARTIDOR] Error al parsear pedido: ${e.message}")
                e.printStackTrace()
                null
            }
        }
        
        @JvmStatic
        fun parseItems(itemsRaw: Any?): List<OrderItem> {
            return when (itemsRaw) {
                is String -> {
                    // Si es un string (pedido de motocicleta), convertir a OrderItem
                    listOf(OrderItem(name = itemsRaw, quantity = 1, unitPrice = 0.0, subtotal = 0.0))
                }
                is Map<*, *> -> {
                    // Manejar objeto items con itemsOriginalString (pedido de motocicleta)
                    val itemsOriginalString = itemsRaw["itemsOriginalString"] as? String
                    if (itemsOriginalString != null) {
                        listOf(OrderItem(name = itemsOriginalString, quantity = 1, unitPrice = 0.0, subtotal = 0.0))
                    } else {
                        // Intentar parsear como un solo item del mapa
                        try {
                            listOf(OrderItem(
                                name = itemsRaw["name"] as? String ?: itemsRaw.toString(),
                                quantity = (itemsRaw["quantity"] as? Number)?.toInt() ?: 1,
                                unitPrice = (itemsRaw["unitPrice"] as? Number)?.toDouble() ?: 0.0,
                                subtotal = (itemsRaw["subtotal"] as? Number)?.toDouble() ?: 0.0
                            ))
                        } catch (e: Exception) {
                            listOf(OrderItem(name = itemsRaw.toString(), quantity = 1, unitPrice = 0.0, subtotal = 0.0))
                        }
                    }
                }
                is List<*> -> {
                    // Si es una lista, intentar convertir cada elemento
                    itemsRaw.mapNotNull { item ->
                        when (item) {
                            is OrderItem -> item
                            is Map<*, *> -> {
                                try {
                                    OrderItem(
                                        name = item["name"] as? String ?: "",
                                        quantity = (item["quantity"] as? Number)?.toInt() ?: 1,
                                        unitPrice = (item["unitPrice"] as? Number)?.toDouble() ?: (item["price"] as? Number)?.toDouble() ?: 0.0,
                                        subtotal = (item["subtotal"] as? Number)?.toDouble() ?: 0.0
                                    )
                                } catch (e: Exception) {
                                    null
                                }
                            }
                            else -> null
                        }
                    }
                }
                else -> {
                    // Si viene en otro formato, convertir a string para no perder la información
                    if (itemsRaw != null) {
                        listOf(OrderItem(name = itemsRaw.toString(), quantity = 1, unitPrice = 0.0, subtotal = 0.0))
                    } else {
                        emptyList()
                    }
                }
            }
        }
    }
}

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