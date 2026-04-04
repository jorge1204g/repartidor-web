package com.example.aplicacionnuevaprueba1.data.repository

import com.example.aplicacionnuevaprueba1.data.model.DeliveryPerson
import com.example.aplicacionnuevaprueba1.data.model.Order
import com.example.aplicacionnuevaprueba1.data.model.OrderStatus
import com.example.aplicacionnuevaprueba1.data.model.Restaurant
import com.example.aplicacionnuevaprueba1.utils.NotificationSender
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class OrderRepository {
    private val database = FirebaseDatabase.getInstance()
    private val ordersRef = database.getReference("orders")
    private val clientOrdersRef = database.getReference("client_orders")
    private val deliveryPersonsRef = database.getReference("delivery_persons")
    private val clientsRef = database.getReference("clients")
    private val restaurantsRef = database.getReference("restaurants")
    private val fcmTokensRef = database.getReference("fcm_tokens")
    private val messagesRef = database.getReference("messages")
    private val notificationSender = NotificationSender()
    
    suspend fun createOrder(order: Order): Result<String> {
        return try {
            val key = ordersRef.push().key ?: return Result.failure(Exception("Failed to generate key"))
            var orderWithId = order.copy(id = key)
            
            // Si no hay candidatos específicos, el pedido está disponible para todos
            if (order.candidateDeliveryIds.isEmpty()) {
                orderWithId = orderWithId.copy(status = OrderStatus.MANUAL_ASSIGNED)
            }
            
            ordersRef.child(key).setValue(orderWithId).await()
            
            // Send notification to all couriers
            sendOrderCreatedNotification(orderWithId)
            
            // Additionally, if this order is manually assigned, send targeted notifications
            if (orderWithId.candidateDeliveryIds.isNotEmpty()) {
                sendManualAssignmentNotifications(orderWithId.id, orderWithId.candidateDeliveryIds)
            }
            
            Result.success(key)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun assignOrderToDelivery(orderId: String, deliveryPerson: DeliveryPerson): Result<Unit> {
        return try {
            val updates = mapOf(
                "assignedToDeliveryId" to deliveryPerson.id,
                "assignedToDeliveryName" to deliveryPerson.name,
                "status" to OrderStatus.ASSIGNED.name
            )
            ordersRef.child(orderId).updateChildren(updates).await()
            
            // Send notification to assigned courier
            sendDirectAssignmentNotification(orderId, deliveryPerson.id)
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun assignOrderManually(orderId: String, deliveryPersonIds: List<String>): Result<Unit> {
        return try {
            // Si deliveryPersonIds está vacío, significa que se envía a TODOS los repartidores
            val updates = if (deliveryPersonIds.isEmpty()) {
                mapOf(
                    "status" to OrderStatus.MANUAL_ASSIGNED,
                    "assignedToDeliveryId" to "",  // Nadie asignado aún
                    "assignedToDeliveryName" to "",
                    "candidateDeliveryIds" to emptyList<String>()  // Disponible para todos
                )
            } else {
                // Si hay IDs específicos, se envía solo a esos repartidores
                mapOf(
                    "candidateDeliveryIds" to deliveryPersonIds,
                    "status" to OrderStatus.MANUAL_ASSIGNED,
                    "assignedToDeliveryId" to "",  // Nadie asignado aún
                    "assignedToDeliveryName" to ""
                )
            }
            ordersRef.child(orderId).updateChildren(updates).await()
            
            // Send notification to selected couriers (or all if empty list)
            if (deliveryPersonIds.isEmpty()) {
                // Si no hay candidatos específicos, enviar a todos
                sendOrderCreatedNotificationForAll(orderId)
            } else {
                // Si hay candidatos específicos, enviar solo a ellos
                sendManualAssignmentNotifications(orderId, deliveryPersonIds)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Función adicional para enviar notificación a todos
    private suspend fun sendOrderCreatedNotificationForAll(orderId: String) {
        try {
            val orderSnapshot = ordersRef.child(orderId).get().await()
            val order = Order.fromSnapshot(orderSnapshot)
            order?.let {
                notificationSender.sendNewOrderNotification(it)
            }
        } catch (e: Exception) {
            println("Error sending notification to all: ${e.message}")
        }
    }
    
    suspend fun acceptOrder(orderId: String, deliveryPerson: DeliveryPerson): Result<Unit> {
        return try {
            // Primero verificar que nadie más haya aceptado
            val orderSnapshot = ordersRef.child(orderId).get().await()
            val currentStatus = orderSnapshot.child("status").getValue(String::class.java)
            val assignedToId = orderSnapshot.child("assignedToDeliveryId").getValue(String::class.java) ?: ""
            
            // Verificar que el pedido esté disponible para aceptar
            if (currentStatus == OrderStatus.MANUAL_ASSIGNED.name && assignedToId.isEmpty()) {
                val updates = mapOf(
                    "assignedToDeliveryId" to deliveryPerson.id,
                    "assignedToDeliveryName" to deliveryPerson.name,
                    "status" to OrderStatus.ACCEPTED.name,
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
    
    suspend fun sendMessage(
        senderId: String,
        senderName: String,
        receiverId: String,
        receiverName: String,
        message: String,
        messageType: com.example.aplicacionnuevaprueba1.data.model.MessageType = com.example.aplicacionnuevaprueba1.data.model.MessageType.TEXT
    ): Result<String> {
        return try {
            val key = messagesRef.push().key ?: return Result.failure(Exception("Failed to generate message key"))
            
            val messageObject = com.example.aplicacionnuevaprueba1.data.model.Message(
                id = key,
                senderId = senderId,
                senderName = senderName,
                receiverId = receiverId,
                receiverName = receiverName,
                message = message,
                messageType = messageType
            )
            
            messagesRef.child(key).setValue(messageObject).await()
            
            // Enviar notificación al receptor
            sendNotificationToCourier(receiverId, "Nuevo mensaje", message)
            
            Result.success(key)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun observeMessagesForReceiver(receiverId: String) = callbackFlow<List<com.example.aplicacionnuevaprueba1.data.model.Message>> {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val messages = snapshot.children
                    .mapNotNull { it.getValue(com.example.aplicacionnuevaprueba1.data.model.Message::class.java) }
                    .filter { it.receiverId == receiverId }
                    .sortedByDescending { it.timestamp }
                
                trySend(messages)
            }
            
            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        
        messagesRef.orderByChild("timestamp").addValueEventListener(listener)
        
        awaitClose {
            messagesRef.removeEventListener(listener)
        }
    }
    
    fun observeMessagesForReceiverAndSender(userId: String) = callbackFlow<List<com.example.aplicacionnuevaprueba1.data.model.Message>> {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val messages = snapshot.children
                    .mapNotNull { it.getValue(com.example.aplicacionnuevaprueba1.data.model.Message::class.java) }
                    .filter { it.receiverId == userId || it.senderId == userId }
                    .sortedByDescending { it.timestamp }
                
                trySend(messages)
            }
            
            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        
        messagesRef.orderByChild("timestamp").addValueEventListener(listener)
        
        awaitClose {
            messagesRef.removeEventListener(listener)
        }
    }
    
    private suspend fun sendNotificationToCourier(courierId: String, title: String, body: String) {
        try {
            val tokenSnapshot = fcmTokensRef.child(courierId).get().await()
            val token = tokenSnapshot.getValue(String::class.java)
            
            if (!token.isNullOrEmpty()) {
                // En producción, llamaría al servicio FCM
                println("🔔 Notificación enviada a $courierId: $title - $body")
            }
        } catch (e: Exception) {
            println("❌ Error al enviar notificación: ${e.message}")
        }
    }
    
    suspend fun updateOrderStatus(orderId: String, status: OrderStatus): Result<Unit> {
        return try {
            // Primero obtener el pedido para tener acceso a la información del cliente
            val orderSnapshot = ordersRef.child(orderId).get().await()
            val order = Order.fromSnapshot(orderSnapshot)
            
            // Actualizar el estado
            ordersRef.child(orderId).child("status").setValue(status.name).await()
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteOrder(orderId: String): Result<Unit> {
        return try {
            println("🗑️ [ELIMINAR] Iniciando eliminación del pedido: $orderId")
            
            // Eliminar de AMBAS colecciones (orders y client_orders)
            val ordersTask = ordersRef.child(orderId).removeValue().await()
            println("✅ [ELIMINAR] Pedido eliminado de orders")
            
            val clientOrdersTask = clientOrdersRef.child(orderId).removeValue().await()
            println("✅ [ELIMINAR] Pedido eliminado de client_orders")
            
            println("✅ [ELIMINAR] Pedido eliminado exitosamente de ambas colecciones")
            Result.success(Unit)
        } catch (e: Exception) {
            println("❌ [ELIMINAR] Error eliminando pedido: ${e.message}")
            Result.failure(e)
        }
    }
    
    suspend fun cancelOrder(orderId: String): Result<Unit> {
        return try {
            val updates = mapOf(
                "status" to OrderStatus.CANCELLED.name,
                "assignedToDeliveryId" to "",
                "assignedToDeliveryName" to ""
            )
            ordersRef.child(orderId).updateChildren(updates).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun observeOrders(): Flow<List<Order>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val orders = snapshot.children.mapNotNull { 
                    Order.fromSnapshot(it)
                }
                trySend(orders)
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
    
    fun observeOrdersByDeliveryPerson(deliveryId: String): Flow<List<Order>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val orders = snapshot.children.mapNotNull { 
                    Order.fromSnapshot(it)
                }.filter { it.assignedToDeliveryId == deliveryId }
                trySend(orders)
            }
            
            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        
        ordersRef.orderByChild("assignedToDeliveryId").equalTo(deliveryId).addValueEventListener(listener)
        
        awaitClose {
            ordersRef.removeEventListener(listener)
        }
    }
    
    suspend fun addDeliveryPerson(deliveryPerson: DeliveryPerson, isAdminCreated: Boolean = false): Result<String> {
        return try {
            println("🔄 Repository: Adding delivery person - isAdminCreated: $isAdminCreated")
            println("🔄 Repository: Person data - name: '${deliveryPerson.name}', phone: '${deliveryPerson.phone}'")
            
            val key = deliveryPersonsRef.push().key ?: return Result.failure(Exception("Failed to generate key"))
            println("🔄 Repository: Generated key: $key")
            
            // Usar SimpleDateFormat en lugar de LocalDateTime para compatibilidad con API 24
            val dateFormat = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault())
            val currentDate = dateFormat.format(java.util.Date())
            var personWithId = deliveryPerson.copy(
                id = key,
                registrationDate = currentDate
            )
            
            // Si es creado por admin, asegurar que isApproved sea true antes de guardar
            if (isAdminCreated) {
                personWithId = personWithId.copy(isApproved = true)
            }
            
            println("🔄 Repository: Final person data - ${personWithId}")
            
            // Guardar el objeto inicial
            deliveryPersonsRef.child(key).setValue(personWithId).await()
            
            // Si fue creado por admin, actualizar explícitamente el campo isApproved a true
            if (isAdminCreated) {
                deliveryPersonsRef.child(key).child("isApproved").setValue(true).await()
                println("✅ Repository: Explicitly set isApproved=true for admin-created user")
            }
            
            println("✅ Repository: Successfully saved delivery person to Firebase")
            
            // Send notification to admin about new pending approval (only for self-registered)
            if (!isAdminCreated) {
                sendNewDeliveryPersonNotification(personWithId)
            }
            
            Result.success(key)
        } catch (e: Exception) {
            println("❌ Repository: Error adding delivery person: ${e.message}")
            e.printStackTrace()
            Result.failure(e)
        }
    }
    
    suspend fun deleteDeliveryPerson(deliveryId: String): Result<Unit> {
        return try {
            // Primero cancelar todos los pedidos asignados a este repartidor
            val ordersSnapshot = ordersRef.get().await()
            val updates = mutableMapOf<String, Any>()
            
            ordersSnapshot.children.forEach { orderSnapshot ->
                val assignedId = orderSnapshot.child("assignedToDeliveryId").getValue(String::class.java)
                if (assignedId == deliveryId) {
                    updates["${orderSnapshot.key}/status"] = OrderStatus.CANCELLED.name
                    updates["${orderSnapshot.key}/assignedToDeliveryId"] = ""
                    updates["${orderSnapshot.key}/assignedToDeliveryName"] = ""
                }
            }
            
            if (updates.isNotEmpty()) {
                ordersRef.updateChildren(updates).await()
            }
            
            // Luego eliminar al repartidor
            deliveryPersonsRef.child(deliveryId).removeValue().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun observeDeliveryPersons(): Flow<List<DeliveryPerson>> = callbackFlow {
        val deliveryListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val persons = snapshot.children.mapNotNull { 
                    it.getValue(DeliveryPerson::class.java) 
                }
                
                // For each person, listen to their presence in real-time
                persons.forEach { person ->
                    val presenceRef = database.getReference("presence").child(person.id)
                    val presenceListener = object : ValueEventListener {
                        override fun onDataChange(presenceSnapshot: DataSnapshot) {
                            val isOnline = presenceSnapshot.child("isOnline").getValue(Boolean::class.java) ?: false
                            val isActive = presenceSnapshot.child("isActive").getValue(Boolean::class.java) ?: false
                            val lastSeen = presenceSnapshot.child("lastSeen").getValue(Long::class.java) ?: 0L
                            
                            println("🔄 Presence update for ${person.name} (${person.id}): online=$isOnline, active=$isActive")
                            
                            // Update the person with new presence data
                            val updatedPerson = person.copy(
                                isOnline = isOnline,
                                isActive = isActive,
                                lastSeen = lastSeen
                            )
                            
                            // Send updated list
                            val currentPersons = persons.map { p ->
                                if (p.id == updatedPerson.id) updatedPerson else p
                            }
                            trySend(currentPersons)
                        }
                        
                        override fun onCancelled(error: DatabaseError) {
                            println("❌ Presence listener cancelled for ${person.name}: ${error.message}")
                        }
                    }
                    presenceRef.addValueEventListener(presenceListener)
                }
                
                // Also send initial data
                trySend(persons.map { person ->
                    person.copy(
                        isOnline = false,
                        isActive = false,
                        lastSeen = 0L
                    )
                })
            }
            
            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        
        deliveryPersonsRef.addValueEventListener(deliveryListener)
        
        awaitClose {
            deliveryPersonsRef.removeEventListener(deliveryListener)
        }
    }
    
    suspend fun approveDeliveryPerson(deliveryId: String): Result<Unit> {
        return try {
            deliveryPersonsRef.child(deliveryId).child("isApproved").setValue(true).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun rejectDeliveryPerson(deliveryId: String): Result<Unit> {
        return try {
            // Delete the delivery person record
            deliveryPersonsRef.child(deliveryId).removeValue().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Notification methods
    private suspend fun sendOrderCreatedNotification(order: Order) {
        notificationSender.sendNewOrderNotification(order)
    }
    
    private suspend fun sendManualAssignmentNotifications(orderId: String, deliveryPersonIds: List<String>) {
        notificationSender.sendManualAssignmentNotification(orderId, deliveryPersonIds)
    }
    
    private suspend fun sendDirectAssignmentNotification(orderId: String, deliveryId: String) {
        notificationSender.sendDirectAssignmentNotification(orderId, deliveryId)
    }
    
    private suspend fun sendNewDeliveryPersonNotification(deliveryPerson: DeliveryPerson) {
        try {
            // In a real implementation, you could send an admin notification
            // For now, we'll just log it
            println("🔔 New delivery person registered: ${deliveryPerson.name} (${deliveryPerson.phone}) - Pending approval")
        } catch (e: Exception) {
            println("🔔 Error sending delivery person notification: ${e.message}")
        }
    }
    
    // Métodos para obtener información del pedido y enviar notificaciones
    suspend fun getOrderById(orderId: String): Order? {
        return try {
            val orderSnapshot = ordersRef.child(orderId).get().await()
            Order.fromSnapshot(orderSnapshot)
        } catch (e: Exception) {
            null
        }
    }
    
    suspend fun updateDeliveryPersonPresence(deliveryId: String, isOnline: Boolean, isActive: Boolean): Result<Unit> {
        return try {
            val presenceData = mapOf(
                "isOnline" to isOnline,
                "isActive" to isActive,
                "lastSeen" to System.currentTimeMillis()
            )
            database.getReference("presence").child(deliveryId).setValue(presenceData).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    private fun getStatusMessage(status: OrderStatus): String {
        return when (status) {
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
            // Estados específicos para motocicleta
            OrderStatus.ON_THE_WAY_TO_PICKUP -> "Repartidor en camino por el pasajero"
            OrderStatus.ARRIVED_AT_PICKUP -> "Repartidor llegó por el pasajero"
            OrderStatus.ON_THE_WAY_TO_DESTINATION -> "En camino al destino"
        }
    }
    
    // Restaurant management methods
    suspend fun createRestaurant(restaurant: Restaurant): Result<String> {
        return try {
            val key = restaurantsRef.push().key ?: return Result.failure(Exception("Failed to generate key"))
            val restaurantWithId = restaurant.copy(id = key, isApproved = true)
            restaurantsRef.child(key).setValue(restaurantWithId).await()
            
            // Asegurar que el campo isApproved esté explícitamente en true
            restaurantsRef.child(key).child("isApproved").setValue(true).await()
            
            println("✅ Restaurante creado con ID: $key y isApproved=true")
            Result.success(key)
        } catch (e: Exception) {
            println("❌ Error creating restaurant: ${e.message}")
            Result.failure(e)
        }
    }
    
    suspend fun updateRestaurant(restaurantId: String, updates: Map<String, Any?>): Result<Unit> {
        return try {
            restaurantsRef.child(restaurantId).updateChildren(updates).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteRestaurant(restaurantId: String): Result<Unit> {
        return try {
            restaurantsRef.child(restaurantId).removeValue().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun observeRestaurants(): Flow<List<Restaurant>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val restaurants = mutableListOf<Restaurant>()
                for (child in snapshot.children) {
                    val restaurant = child.getValue(Restaurant::class.java)
                    restaurant?.let { restaurants.add(it) }
                }
                trySend(restaurants.sortedByDescending { it.createdAt })
            }

            override fun onCancelled(error: DatabaseError) {
                trySend(emptyList())
            }
        }
        
        restaurantsRef.addValueEventListener(listener)
        awaitClose { restaurantsRef.removeEventListener(listener) }
    }
    
    suspend fun getRestaurantById(restaurantId: String): Result<Restaurant> {
        return try {
            val snapshot = restaurantsRef.child(restaurantId).get().await()
            val restaurant = snapshot.getValue(Restaurant::class.java)
            if (restaurant != null) {
                Result.success(restaurant)
            } else {
                Result.failure(Exception("Restaurant not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Client management methods
    fun observeClients(): Flow<List<com.example.aplicacionnuevaprueba1.data.model.Client>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val clients = mutableListOf<com.example.aplicacionnuevaprueba1.data.model.Client>()
                for (child in snapshot.children) {
                    val client = child.getValue(com.example.aplicacionnuevaprueba1.data.model.Client::class.java)
                    client?.let { clients.add(it) }
                }
                trySend(clients.sortedByDescending { it.createdAt })
            }

            override fun onCancelled(error: DatabaseError) {
                trySend(emptyList())
            }
        }
        
        clientsRef.addValueEventListener(listener)
        awaitClose { clientsRef.removeEventListener(listener) }
    }
    
    suspend fun blockClient(clientId: String): Result<Unit> {
        return try {
            clientsRef.child(clientId).child("status").setValue("blocked").await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun unblockClient(clientId: String): Result<Unit> {
        return try {
            clientsRef.child(clientId).child("status").setValue("active").await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteClient(clientId: String): Result<Unit> {
        return try {
            // Eliminar al cliente directamente
            // Los pedidos no se eliminan automáticamente para mantener el historial
            clientsRef.child(clientId).removeValue().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
