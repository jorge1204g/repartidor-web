package com.example.repartidor.data.repository

import android.net.Uri
import com.example.repartidor.data.model.Message
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.io.ByteArrayOutputStream
import java.util.UUID

class MessageRepository {
    private val database = FirebaseDatabase.getInstance()
    private val messagesRef = database.getReference("messages")
    
    fun observeMessagesForReceiver(receiverId: String): Flow<List<Message>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val messages = snapshot.children
                    .mapNotNull { it.getValue(Message::class.java) }
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
    
    fun observeMessagesForReceiverAndSender(userId: String): Flow<List<Message>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val messages = snapshot.children
                    .mapNotNull { it.getValue(Message::class.java) }
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
    
    suspend fun markMessageAsRead(messageId: String): Result<Unit> {
        return try {
            messagesRef.child(messageId).child("isRead").setValue(true).await()
            Result.success(Unit)
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
        messageType: com.example.repartidor.data.model.MessageType = com.example.repartidor.data.model.MessageType.TEXT,
        orderId: String? = null,
        imageUrl: String? = null
    ): Result<String> {
        return try {
            val key = messagesRef.push().key ?: return Result.failure(Exception("Failed to generate message key"))
            
            // DEBUG: Ver qué se está guardando en Firebase
            println("💾 [DEBUG] Guardando mensaje en Firebase:")
            println("   ├── key: $key")
            println("   ├── senderId: $senderId")
            println("   ├── senderName: $senderName")
            println("   ├── receiverId: $receiverId")
            println("   ├── receiverName: $receiverName")
            println("   └── message: $message")
            
            val messageObject = Message(
                id = key,
                senderId = senderId,
                senderName = senderName,
                receiverId = receiverId,
                receiverName = receiverName,
                message = message,
                messageType = messageType,
                orderId = orderId,
                imageUrl = imageUrl
            )
            
            messagesRef.child(key).setValue(messageObject).await()
            
            println("✅ [DEBUG] Mensaje guardado exitosamente")
            
            Result.success(key)
        } catch (e: Exception) {
            println("❌ [DEBUG] Error al guardar: ${e.message}")
            Result.failure(e)
        }
    }
    
    // Método para enviar imágenes usando Firebase Storage
    suspend fun sendImage(
        senderId: String,
        senderName: String,
        receiverId: String,
        receiverName: String,
        imageBase64: String,
        orderId: String? = null
    ): Result<String> {
        return try {
            println("📦 [DEBUG] Iniciando envío de imagen a Storage")
            
            // Decodificar Base64 a bytes
            val imageBytes = android.util.Base64.decode(imageBase64, android.util.Base64.DEFAULT)
            
            // Comprimir imagen si es muy grande
            val compressedBytes = if (imageBytes.size > 500 * 1024) { // Más de 500KB
                println("⚠️ [DEBUG] Imagen muy grande (${imageBytes.size} bytes), comprimiendo...")
                compressImage(imageBytes)
            } else {
                imageBytes
            }
            
            // Crear nombre único para la imagen
            val imageName = "images/${System.currentTimeMillis()}_${UUID.randomUUID()}.jpg"
            val storage = FirebaseStorage.getInstance()
            val imageRef = storage.getReference(imageName)
            
            println("📤 [DEBUG] Subiendo imagen: $imageName (${compressedBytes.size} bytes)")
            
            // Subir imagen a Firebase Storage
            imageRef.putBytes(compressedBytes).await()
            
            // Obtener URL de descarga
            val imageUrl = imageRef.downloadUrl.await().toString()
            
            println("✅ [DEBUG] Imagen subida exitosamente. URL: ${imageUrl.substring(0, 50)}...")
            
            // Crear objeto de mensaje
            val key = messagesRef.push().key ?: return Result.failure(Exception("Failed to generate message key"))
            
            val messageObject = Message(
                id = key,
                senderId = senderId,
                senderName = senderName,
                receiverId = receiverId,
                receiverName = receiverName,
                message = "📷 Imagen enviada",
                messageType = com.example.repartidor.data.model.MessageType.IMAGE,
                orderId = orderId,
                imageUrl = imageUrl // URL de Firebase Storage en lugar de Base64
            )
            
            messagesRef.child(key).setValue(messageObject).await()
            
            println("✅ [DEBUG] Mensaje con imagen guardado exitosamente")
            
            Result.success(key)
        } catch (e: Exception) {
            println("❌ [DEBUG] Error al enviar imagen: ${e.message}")
            e.printStackTrace()
            Result.failure(e)
        }
    }
    
    // Función auxiliar para comprimir imagen
    private fun compressImage(imageBytes: ByteArray): ByteArray {
        // Decodificar bitmap
        val bitmap = android.graphics.BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
        
        // Redimensionar si es necesario
        val maxWidth = 800
        val maxHeight = 800
        var width = bitmap.width
        var height = bitmap.height
        
        if (width > height) {
            if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
            }
        } else {
            if (height > maxHeight) {
                width = (width * maxHeight) / height
                height = maxHeight
            }
        }
        
        val resizedBitmap = android.graphics.Bitmap.createScaledBitmap(bitmap, width, height, true)
        
        // Comprimir a JPEG 70% calidad
        val outputStream = ByteArrayOutputStream()
        resizedBitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 70, outputStream)
        
        return outputStream.toByteArray()
    }
}