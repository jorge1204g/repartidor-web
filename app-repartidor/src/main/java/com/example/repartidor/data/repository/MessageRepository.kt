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
                    .sortedBy { it.timestamp }  // Orden ascendente: más viejo primero, nuevo abajo
                
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
    
    // Método para enviar imágenes como Base64 directo (sin Storage)
    suspend fun sendImage(
        senderId: String,
        senderName: String,
        receiverId: String,
        receiverName: String,
        imageBase64: String,
        orderId: String? = null
    ): Result<String> {
        return try {
            println("📦 [DEBUG] Iniciando envío de imagen como Base64 directo")
            
            // Decodificar Base64 a bytes para verificar tamaño
            val imageBytes = android.util.Base64.decode(imageBase64, android.util.Base64.DEFAULT)
            
            println("📦 [DEBUG] Tamaño de imagen: ${imageBytes.size} bytes (${imageBytes.size / 1024} KB)")
            
            // Comprimir imagen de forma más agresiva - objetivo: máximo 100KB para Base64 directo
            val maxSize = 100 * 1024 // 100KB máximo
            val compressedBytes = if (imageBytes.size > maxSize) {
                println("⚠️ [DEBUG] Imagen muy grande (${imageBytes.size / 1024} KB), comprimiendo agresivamente...")
                compressImageAggressive(imageBytes, maxSize)
            } else {
                imageBytes
            }
            
            println("✅ [DEBUG] Tamaño después de comprimir: ${compressedBytes.size} bytes (${compressedBytes.size / 1024} KB)")
            
            // Convertir bytes comprimidos a Base64 (sin saltos de línea)
            val compressedBase64 = android.util.Base64.encodeToString(compressedBytes, android.util.Base64.NO_WRAP)
            
            println("📤 [DEBUG] Base64 final: ${compressedBase64.length} caracteres")
            println("📤 [DEBUG] Primeros 50 chars: ${compressedBase64.substring(0, minOf(50, compressedBase64.length))}")
            
            // Crear objeto de mensaje
            val key = messagesRef.push().key ?: return Result.failure(Exception("Failed to generate message key"))
            
            val messageObject = Message(
                id = key,
                senderId = senderId,
                senderName = senderName,
                receiverId = receiverId,
                receiverName = receiverName,
                message = "📷 Imagen",
                timestamp = System.currentTimeMillis(),
                isRead = false,
                messageType = com.example.repartidor.data.model.MessageType.IMAGE,
                imageUrl = "data:image/jpeg;base64,$compressedBase64",  // Guardar Base64 directo
                orderId = orderId
            )
            
            println("💾 [DEBUG] Guardando mensaje en Firebase...")
            
            // Guardar en Firebase
            messagesRef.child(key).setValue(messageObject).await()
            
            println("✅ [DEBUG] Imagen enviada exitosamente como Base64 directo")
            
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
    
    // Función de compresión agresiva - reduce a máximo maxSize bytes
    private fun compressImageAggressive(imageBytes: ByteArray, maxSize: Int): ByteArray {
        var bitmap = android.graphics.BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
        
        // Paso 1: Redimensionar a máximo 600px
        val maxDimension = 600
        var width = bitmap.width
        var height = bitmap.height
        
        if (width > maxDimension || height > maxDimension) {
            if (width > height) {
                height = (height * maxDimension) / width
                width = maxDimension
            } else {
                width = (width * maxDimension) / height
                height = maxDimension
            }
            bitmap = android.graphics.Bitmap.createScaledBitmap(bitmap, width, height, true)
            println("📐 [DEBUG] Redimensionado a ${width}x${height}")
        }
        
        // Paso 2: Comprimir con calidad decreciente hasta alcanzar el tamaño deseado
        var quality = 80
        val outputStream = ByteArrayOutputStream()
        
        while (quality > 10) {
            outputStream.reset()
            bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, quality, outputStream)
            
            val compressedSize = outputStream.size()
            println("🔄 [DEBUG] Calidad: $quality%, Tamaño: ${compressedSize / 1024} KB")
            
            if (compressedSize <= maxSize) {
                println("✅ [DEBUG] Tamaño objetivo alcanzado con calidad $quality%")
                break
            }
            
            quality -= 10
        }
        
        // Si todavía es muy grande, reducir más las dimensiones
        if (outputStream.size() > maxSize) {
            println("⚠️ [DEBUG] Aún muy grande, reduciendo dimensiones...")
            val smallerDimension = 400
            val newWidth = if (width > height) smallerDimension else (width * smallerDimension) / height
            val newHeight = if (height > width) smallerDimension else (height * smallerDimension) / width
            
            val smallerBitmap = android.graphics.Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true)
            outputStream.reset()
            smallerBitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 50, outputStream)
            
            println("📐 [DEBUG] Redimensionado final a ${newWidth}x${newHeight}")
        }
        
        return outputStream.toByteArray()
    }
}