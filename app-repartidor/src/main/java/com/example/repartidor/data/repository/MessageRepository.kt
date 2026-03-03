package com.example.repartidor.data.repository

import com.example.repartidor.data.model.Message
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

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
        messageType: com.example.repartidor.data.model.MessageType = com.example.repartidor.data.model.MessageType.TEXT
    ): Result<String> {
        return try {
            val key = messagesRef.push().key ?: return Result.failure(Exception("Failed to generate message key"))
            
            val messageObject = Message(
                id = key,
                senderId = senderId,
                senderName = senderName,
                receiverId = receiverId,
                receiverName = receiverName,
                message = message,
                messageType = messageType
            )
            
            messagesRef.child(key).setValue(messageObject).await()
            
            Result.success(key)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}