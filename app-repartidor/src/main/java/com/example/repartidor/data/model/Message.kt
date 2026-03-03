// Package declaration
package com.example.repartidor.data.model

// Data class for Message
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

// Enum class for message types
enum class MessageType {
    TEXT,           // Mensaje de texto
    STATUS_CHECK,   // Solicitud de estado
    ORDER_INFO,     // Información de pedido
    ALERT         // Alerta importante
}