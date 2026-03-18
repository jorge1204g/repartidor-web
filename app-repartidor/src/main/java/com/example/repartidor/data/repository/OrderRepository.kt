package com.example.repartidor.data.repository

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
    
    fun observeAssignedOrders(deliveryId: String): Flow<List<Order>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val orders = snapshot.children.mapNotNull { 
                    it.getValue(Order::class.java) 
                }.filter { order ->
                    // Pedidos asignados al repartidor (incluyendo entregados)
                    val isAssignedToDelivery = order.assignedToDeliveryId == deliveryId && 
                        order.status in listOf("ASSIGNED", "ACCEPTED", "ON_THE_WAY_TO_STORE", "ARRIVED_AT_STORE", "PICKING_UP_ORDER", "ON_THE_WAY_TO_CUSTOMER", "DELIVERED")
                    
                    // Pedidos manuales disponibles para todos los repartidores
                    val isManualAvailable = order.status == "MANUAL_ASSIGNED" && 
                        order.assignedToDeliveryId.isEmpty() &&
                        (order.candidateDeliveryIds.isEmpty() || deliveryId in order.candidateDeliveryIds)
                    
                    // Pedidos del restaurante disponibles para todos los repartidores
                    val isRestaurantAvailable = order.status in listOf("PENDING", "ASSIGNED") &&
                        order.assignedToDeliveryId.isEmpty() &&
                        (order.candidateDeliveryIds.isEmpty() || deliveryId in order.candidateDeliveryIds)
                    
                    isAssignedToDelivery || isManualAvailable || isRestaurantAvailable
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
    
    suspend fun updateOrderStatus(orderId: String, status: String): Result<Unit> {
        return try {
            ordersRef.child(orderId).child("status").setValue(status).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
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
}