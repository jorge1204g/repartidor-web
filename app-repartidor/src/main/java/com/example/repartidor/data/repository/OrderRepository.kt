package com.example.repartidor.data.repository

import com.example.repartidor.data.model.Message
import com.example.repartidor.data.model.Order
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class OrderRepository {
    private val database = FirebaseDatabase.getInstance()
    private val ordersRef = database.getReference("orders")
    private val presenceRef = database.getReference("presence")
    private val deliveryUsersRef = database.getReference("delivery_users")
    
    fun observeAssignedOrders(deliveryId: String): Flow<List<Order>> = callbackFlow {
        println("🔍 [REPO] ========== INICIO OBSERVACIÓN ==========")
        println("🔍 [REPO] observeAssignedOrders called with deliveryId: '$deliveryId'")
        println("🔍 [REPO] deliveryId.isEmpty(): ${deliveryId.isEmpty()}")
        println("🔍 [REPO] ========================================")
        
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                println("🔍 [REPO] ========== DATOS DE FIREBASE ==========")
                println("🔍 [REPO] Received ${snapshot.childrenCount} orders from Firebase")
                println("🔍 [REPO] Filtrando para deliveryId: '$deliveryId'")
                
                val allOrders = snapshot.children.mapNotNull { 
                    Order.fromSnapshot(it)
                }
                
                println("🔍 [REPO] Total orders parsed: ${allOrders.size}")
                println("🔍 [REPO] Current deliveryId for filtering: '$deliveryId'")
                
                // Log de TODOS los pedidos recibidos
                allOrders.forEachIndexed { index, order ->
                    println("📦 [REPO] Pedido #$index:")
                    println("   ID: ${order.id}")
                    println("   Status: ${order.status}")
                    println("   assignedToDeliveryId: '${order.assignedToDeliveryId}'")
                    println("   DeliveryId esperado: '$deliveryId'")
                    println("   ¿Coincide?: ${order.assignedToDeliveryId == deliveryId}")
                }
                
                val filteredOrders = allOrders.filter { order ->
                    // Pedidos asignados al repartidor
                    val isAssignedToDelivery = order.assignedToDeliveryId == deliveryId && 
                        order.status.uppercase() in listOf("PENDING", "ASSIGNED", "ACCEPTED", "MANUAL_ASSIGNED", 
                                              "ON_THE_WAY_TO_STORE", "ARRIVED_AT_STORE", 
                                              "PICKING_UP_ORDER", "ON_THE_WAY_TO_CUSTOMER", "DELIVERED",
                                              "ON_THE_WAY_TO_PICKUP", "ARRIVED_AT_PICKUP", 
                                              "ON_THE_WAY_TO_DESTINATION",
                                              "WAITING_FOR_DELIVERY")
                    
                    // Pedidos disponibles sin asignar (para que el repartidor pueda aceptar)
                    val isAvailableOrder = (order.status.uppercase() == "MANUAL_ASSIGNED" || 
                                           order.status.uppercase() == "ASSIGNED" || 
                                           order.status.uppercase() == "PENDING") && 
                                          order.assignedToDeliveryId.isEmpty()
                    
                    val shouldInclude = isAssignedToDelivery || isAvailableOrder
                    
                    if (shouldInclude) {
                        println("✅ [REPO] Including order: ${order.id}, status: ${order.status}, serviceType: ${order.serviceType}, assignedTo: ${order.assignedToDeliveryId}")
                    } else {
                        println("❌ [REPO] Excluding order: ${order.id}, status: ${order.status}, serviceType: ${order.serviceType}, assignedTo: '${order.assignedToDeliveryId}'")
                    }
                    
                    shouldInclude
                }
                
                println("✅ [REPO] Sending ${filteredOrders.size} orders to UI")
                trySend(filteredOrders)
            }
            
            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        
        ordersRef.addValueEventListener(listener)
        
        awaitClose {
            ordersRef.removeEventListener(listener)
        }
    }
    
    suspend fun updateOrderStatus(orderId: String, status: String): Result<Unit> {
        return try {
            ordersRef.child(orderId).child("status").setValue(status).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Función para archivar y limpiar mensajes del chat cuando se completa una entrega
    suspend fun archiveAndClearChat(orderId: String, deliveryId: String, customerPhone: String) {
        try {
            println("📦 [CHAT] Archivando mensajes del pedido: $orderId")
            println("📦 [CHAT] Repartidor: $deliveryId, Cliente: $customerPhone")
            
            val messagesRef = FirebaseDatabase.getInstance().reference.child("messages")
            val snapshot = messagesRef.get().await()
            
            if (snapshot.exists()) {
                var archivedCount = 0
                var deletedCount = 0
                val chatMessages = mutableListOf<Map<String, Any>>()
                
                // Primero: Recopilar mensajes de ESTE pedido
                snapshot.children.forEach { messageSnapshot ->
                    val message = messageSnapshot.getValue(Message::class.java)
                    
                    if (message != null) {
                        val isBetweenUsers = (
                            (message.senderId == deliveryId && message.receiverId == customerPhone) ||
                            (message.senderId == customerPhone && message.receiverId == deliveryId)
                        )
                        
                        // Solo mensajes de ESTE pedido (por orderId)
                        val isForThisOrder = message.orderId == orderId
                        
                        if (isBetweenUsers && isForThisOrder) {
                            // Agregar a la lista para archivar
                            chatMessages.add(mapOf(
                                "id" to message.id,
                                "senderId" to message.senderId,
                                "senderName" to message.senderName,
                                "receiverId" to message.receiverId,
                                "receiverName" to message.receiverName,
                                "message" to message.message,
                                "timestamp" to message.timestamp,
                                "isRead" to message.isRead,
                                "messageType" to message.messageType.name,
                                "imageUrl" to (message.imageUrl ?: "")
                            ))
                            archivedCount++
                        }
                    }
                }
                
                // Segundo: Archivar en el nodo del pedido
                if (chatMessages.isNotEmpty()) {
                    val orderChatArchiveRef = FirebaseDatabase.getInstance()
                        .reference
                        .child("orders")
                        .child(orderId)
                        .child("chatHistory")
                    
                    orderChatArchiveRef.setValue(chatMessages).await()
                    println("✅ [ARCHIVE] $archivedCount mensajes archivados en el pedido")
                } else {
                    println("ℹ️ [ARCHIVE] No hay mensajes para archivar")
                }
                
                // Tercero: Eliminar SOLO los mensajes de ESTE pedido del chat activo
                snapshot.children.forEach { messageSnapshot ->
                    val message = messageSnapshot.getValue(Message::class.java)
                    
                    if (message != null) {
                        val isBetweenUsers = (
                            (message.senderId == deliveryId && message.receiverId == customerPhone) ||
                            (message.senderId == customerPhone && message.receiverId == deliveryId)
                        )
                        
                        val isForThisOrder = message.orderId == orderId
                        
                        if (isBetweenUsers && isForThisOrder) {
                            messageSnapshot.ref.removeValue().await()
                            deletedCount++
                        }
                    }
                }
                
                println("✅ [CHAT] $deletedCount mensajes eliminados del chat activo")
                println("📦 [CHAT] Historial guardado en: orders/$orderId/chatHistory")
            } else {
                println("⚠️ [CHAT] No hay mensajes en Firebase")
            }
        } catch (e: Exception) {
            println("❌ [CHAT] Error al archivar y limpiar mensajes: ${e.message}")
            e.printStackTrace()
        }
    }
    
    suspend fun updatePresence(deliveryId: String, isOnline: Boolean, isActive: Boolean) {
        try {
            val presenceData = mapOf(
                "isOnline" to isOnline,
                "isActive" to isActive,
                "lastSeen" to System.currentTimeMillis()
            )
            presenceRef.child(deliveryId).updateChildren(presenceData).await()
        } catch (e: Exception) {
            // Handle silently
        }
    }
    
    suspend fun clearPresence(deliveryId: String) {
        try {
            presenceRef.child(deliveryId).removeValue().await()
        } catch (e: Exception) {
            // Handle silently
        }
    }
    
    // Función para obtener información del pedido
    suspend fun getOrderById(orderId: String): Order? {
        return try {
            val orderSnapshot = ordersRef.child(orderId).get().await()
            orderSnapshot.getValue(Order::class.java)
        } catch (e: Exception) {
            null
        }
    }
    
    // Función para actualizar la ubicación del repartidor en tiempo real
    suspend fun updateDeliveryLocation(deliveryId: String, latitude: Double, longitude: Double) {
        try {
            val locationData = mapOf(
                "latitude" to latitude,
                "longitude" to longitude,
                "timestamp" to System.currentTimeMillis()
            )
            deliveryUsersRef.child(deliveryId).child("location").updateChildren(locationData).await()
        } catch (e: Exception) {
            // Handle silently
        }
    }
}