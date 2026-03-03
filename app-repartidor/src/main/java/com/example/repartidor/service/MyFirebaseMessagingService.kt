package com.example.repartidor.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.example.repartidor.MainActivity
import com.example.repartidor.R
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        // Handle data payload
        val title = remoteMessage.data["title"] ?: remoteMessage.notification?.title ?: "Nuevo Pedido"
        val body = remoteMessage.data["body"] ?: remoteMessage.notification?.body ?: "Tienes un nuevo pedido asignado"
        val orderType = remoteMessage.data["order_type"] ?: "new_order"
        
        sendNotification(title, body, orderType)
    }
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Guardar el token en la base de datos para poder enviar notificaciones
        saveTokenToDatabase(token)
    }
    
    private fun saveTokenToDatabase(token: String) {
        // Obtener el ID de repartidor guardado en SharedPreferences
        val sharedPreferences = getSharedPreferences("delivery_prefs", Context.MODE_PRIVATE)
        val deliveryId = sharedPreferences.getString("delivery_id", null)
        
        if (!deliveryId.isNullOrEmpty()) {
            // Guardar el token asociado al ID de repartidor
            val database = com.google.firebase.database.FirebaseDatabase.getInstance()
            val tokensRef = database.getReference("fcm_tokens")
            tokensRef.child(deliveryId).setValue(token)
        }
    }
    
    private fun sendNotification(title: String, messageBody: String, orderType: String = "new_order") {
        val intent = Intent(this, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE
        )
        
        val channelId = when (orderType) {
            "manual_assignment" -> "manual_order_notifications"
            "direct_assignment" -> "direct_order_notifications"
            else -> "order_notifications"
        }
        
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(messageBody)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
        
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Create channels
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channels = listOf(
                NotificationChannel(
                    "order_notifications",
                    "Nuevos Pedidos",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Notificaciones de nuevos pedidos disponibles"
                },
                NotificationChannel(
                    "manual_order_notifications",
                    "Pedidos Manuales",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Notificaciones de pedidos enviados manualmente"
                },
                NotificationChannel(
                    "direct_order_notifications",
                    "Pedidos Asignados",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Notificaciones de pedidos asignados directamente"
                }
            )
            
            notificationManager.createNotificationChannels(channels)
        }
        
        // Use different notification IDs for different types
        val notificationId = when (orderType) {
            "manual_assignment" -> 2
            "direct_assignment" -> 3
            else -> 1
        }
        
        notificationManager.notify(notificationId, notificationBuilder.build())
    }
}
