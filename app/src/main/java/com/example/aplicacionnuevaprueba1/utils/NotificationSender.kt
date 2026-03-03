package com.example.aplicacionnuevaprueba1.utils

import android.util.Log
import com.example.aplicacionnuevaprueba1.data.model.Order
import com.google.firebase.database.FirebaseDatabase
import kotlinx.coroutines.tasks.await

/**
 * Utility class for sending FCM notifications to couriers
 * In a production environment, this would connect to FCM server API
 */
class NotificationSender {
    private val database = FirebaseDatabase.getInstance()
    private val fcmTokensRef = database.getReference("fcm_tokens")
    
    companion object {
        private const val TAG = "NotificationSender"
    }
    
    /**
     * Send notification about a new order to all couriers
     */
    suspend fun sendNewOrderNotification(order: Order) {
        try {
            // Get all courier tokens
            val tokensSnapshot = fcmTokensRef.get().await()
            val tokens = tokensSnapshot.children.mapNotNull { 
                it.getValue(String::class.java) 
            }
            
            if (tokens.isNotEmpty()) {
                val notificationData = mapOf(
                    "title" to "¡Nuevo Pedido Disponible!",
                    "body" to "Pedido #${order.orderId} de ${order.restaurantName} - Total: \$${order.total}",
                    "order_type" to "new_order",
                    "order_id" to order.id
                )
                
                // In production, send to FCM server endpoint
                Log.d(TAG, "Would send notification to ${tokens.size} couriers: $notificationData")
                simulateFcmSend(tokens, notificationData)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error sending new order notification", e)
        }
    }
    
    /**
     * Send notification about manual assignment to selected couriers
     */
    suspend fun sendManualAssignmentNotification(orderId: String, deliveryPersonIds: List<String>) {
        try {
            // Get tokens for selected couriers
            val tokens = mutableListOf<String>()
            val courierNames = mutableListOf<String>()
            
            for (deliveryId in deliveryPersonIds) {
                val tokenSnapshot = fcmTokensRef.child(deliveryId).get().await()
                val token = tokenSnapshot.getValue(String::class.java)
                token?.let { tokens.add(it) }
                
                // Get courier name for personalized message
                val courierSnapshot = database.getReference("delivery_persons").child(deliveryId).get().await()
                val name = courierSnapshot.child("name").getValue(String::class.java)
                name?.let { courierNames.add(it) }
            }
            
            if (tokens.isNotEmpty()) {
                val notificationData = mapOf(
                    "title" to "¡Pedido para ti!",
                    "body" to "Te han enviado un nuevo pedido para aceptar. ¡Primero en aceptar lo lleva!",
                    "order_type" to "manual_assignment",
                    "order_id" to orderId
                )
                
                Log.d(TAG, "Would send manual assignment notification to ${tokens.size} couriers: $notificationData")
                simulateFcmSend(tokens, notificationData)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error sending manual assignment notification", e)
        }
    }
    
    /**
     * Send notification about direct assignment to a specific courier
     */
    suspend fun sendDirectAssignmentNotification(orderId: String, deliveryId: String) {
        try {
            val tokenSnapshot = fcmTokensRef.child(deliveryId).get().await()
            val token = tokenSnapshot.getValue(String::class.java)
            
            if (token != null) {
                // Get courier name
                val courierSnapshot = database.getReference("delivery_persons").child(deliveryId).get().await()
                val courierName = courierSnapshot.child("name").getValue(String::class.java) ?: "Repartidor"
                
                val notificationData = mapOf(
                    "title" to "Pedido Asignado",
                    "body" to "$courierName, tienes un nuevo pedido asignado. ¡Prepárate para entregar!",
                    "order_type" to "direct_assignment",
                    "order_id" to orderId
                )
                
                Log.d(TAG, "Would send direct assignment notification: $notificationData")
                simulateFcmSend(listOf(token), notificationData)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error sending direct assignment notification", e)
        }
    }
    
    /**
     * Simulate sending FCM message (in production, this would call FCM HTTP API)
     */
    private fun simulateFcmSend(tokens: List<String>, data: Map<String, String>) {
        // This is where you would integrate with FCM HTTP v1 API
        // Example production code would look like:
        /*
        val fcmUrl = "https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send"
        val accessToken = getAccessToken() // From service account
        
        tokens.chunked(500).forEach { batch ->
            val message = buildFcmMessage(batch, data)
            httpClient.post(fcmUrl) {
                header("Authorization", "Bearer $accessToken")
                contentType(ContentType.Application.Json)
                setBody(message)
            }
        }
        */
        
        Log.i(TAG, "✅ Simulated sending notification to ${tokens.size} devices")
        Log.d(TAG, "Notification data: $data")
    }
    
    /**
     * Get FCM access token (would require service account setup)
     */
    private suspend fun getAccessToken(): String {
        // In production, implement OAuth2 service account authentication
        // This is a placeholder - you'd need to set up a service account
        return "SERVICE_ACCOUNT_ACCESS_TOKEN"
    }
}