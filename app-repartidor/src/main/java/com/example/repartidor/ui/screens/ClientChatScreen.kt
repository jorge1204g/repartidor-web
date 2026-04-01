package com.example.repartidor.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.shape.CircleShape
import androidx.lifecycle.viewModelScope
import coil.compose.AsyncImage
import com.example.repartidor.data.model.Message
import com.example.repartidor.ui.viewmodel.DeliveryViewModel
import java.text.SimpleDateFormat
import java.util.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClientChatScreen(
    viewModel: DeliveryViewModel,
    clientName: String,  // Ahora es "phone_XXXX" donde XXXX es el teléfono del cliente
    orderId: String,
    onBack: () -> Unit
) {
    val deliveryPerson by viewModel.deliveryPerson.collectAsState()
    val allMessages by viewModel.messages.collectAsState()
    
    // Filtrar mensajes solo con este cliente
    // clientName ahora contiene "phone_" + teléfono del cliente
    val chatMessages = remember(allMessages, deliveryPerson, clientName) {
        allMessages.filter { message ->
            // Filtrar mensajes entre el repartidor actual y el cliente
            // Comparamos receiverId o senderId con el clientName (que es phone_XXXX)
            (message.senderId == deliveryPerson?.id && message.receiverId == clientName) ||
            (message.receiverId == deliveryPerson?.id && message.senderId == clientName)
        }.sortedBy { it.timestamp }
    }
    
    val listState = rememberLazyListState()
    var newMessage by remember { mutableStateOf("") }
    var sendingImage by remember { mutableStateOf(false) }
    
    // Launcher para seleccionar imagen de la galería
    val context = LocalContext.current
    val pickImageLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            println("📷 [DEBUG] Imagen seleccionada: $it")
            sendingImage = true
            
            // Convertir URI a Base64 y comprimir
            CoroutineScope(Dispatchers.Main).launch {
                try {
                    val inputStream = context.contentResolver.openInputStream(it)
                    val originalBytes = inputStream?.readBytes()
                    
                    if (originalBytes != null) {
                        println("📦 [DEBUG] Tamaño original: ${originalBytes.size} bytes")
                        
                        // Comprimir imagen si es mayor a 500KB
                        val compressedBytes = if (originalBytes.size > 500 * 1024) {
                            println("⚠️ [DEBUG] Comprimiendo imagen...")
                            compressImage(originalBytes)
                        } else {
                            originalBytes
                        }
                        
                        println("✅ [DEBUG] Tamaño comprimido: ${compressedBytes.size} bytes")
                        
                        // Convertir a Base64
                        val base64Image = android.util.Base64.encodeToString(compressedBytes, android.util.Base64.DEFAULT)
                        
                        println("📤 [DEBUG] Enviando imagen comprimida (${base64Image.length} chars)")
                        
                        viewModel.sendImage(
                            clientId = clientName,
                            clientName = clientName,
                            imageBase64 = base64Image,
                            orderId = orderId
                        )
                        
                        println("✅ [DEBUG] Imagen enviada")
                    }
                } catch (e: Exception) {
                    println("❌ [DEBUG] Error al convertir imagen: ${e.message}")
                    e.printStackTrace()
                } finally {
                    sendingImage = false
                }
            }
        }
    }
    
    // Auto-scroll al último mensaje
    LaunchedEffect(chatMessages.size) {
        if (chatMessages.isNotEmpty()) {
            listState.animateScrollToItem(chatMessages.size - 1)
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Column {
                        Text(
                            "💬 $clientName",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                        Text(
                            "📦 Pedido: $orderId",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Lista de mensajes
            LazyColumn(
                modifier = Modifier.weight(1f),
                state = listState,
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (chatMessages.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier.fillParentMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "💬",
                                    fontSize = 64.sp
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Text(
                                    text = "Aún no hay mensajes",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "¡Saluda al cliente!",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                } else {
                    items(chatMessages) { message ->
                        MessageBubble(
                            message = message,
                            isOwnMessage = message.senderId == deliveryPerson?.id
                        )
                    }
                }
            }
            
            // Campo para enviar mensaje
            Row(
                modifier = Modifier
                    .padding(16.dp)
                    .fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = newMessage,
                    onValueChange = { newMessage = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("Escribe un mensaje...") },
                    singleLine = true,
                    shape = RoundedCornerShape(24.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline
                    )
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                // Botón para adjuntar imagen
                FloatingActionButton(
                    onClick = { 
                        if (!sendingImage) {
                            println("📷 [DEBUG] Abriendo selector de imágenes")
                            pickImageLauncher.launch("image/*")
                        }
                    },
                    containerColor = if (sendingImage) Color.Gray else MaterialTheme.colorScheme.secondary,
                    shape = CircleShape
                ) {
                    Icon(
                        imageVector = Icons.Default.PhotoCamera,
                        contentDescription = "Enviar imagen",
                        modifier = Modifier.size(20.dp),
                        tint = if (sendingImage) Color.DarkGray else Color.Unspecified
                    )
                }
                
                Spacer(modifier = Modifier.width(8.dp))
                
                FloatingActionButton(
                    onClick = {
                        val currentDeliveryPerson = deliveryPerson
                        if (newMessage.trim().isNotEmpty() && currentDeliveryPerson != null) {
                            // DEBUG: Ver qué valores se están usando
                            println("🔍 [DEBUG] Enviando mensaje:")
                            println("   ├── deliveryPerson.id: ${currentDeliveryPerson.id}")
                            println("   ├── deliveryPerson.name: ${currentDeliveryPerson.name}")
                            println("   ├── clientName (phone_): $clientName")
                            println("   └── orderId: $orderId")
                            
                            // Usar el phone_ como receiverId para consistencia
                            viewModel.sendMessageToClient(
                                clientId = clientName,  // ✅ "phone_XXXX" es único y consistente
                                clientName = clientName,
                                message = newMessage.trim(),
                                orderId = orderId
                            )
                            newMessage = ""
                        }
                    },
                    containerColor = MaterialTheme.colorScheme.primary,
                    shape = CircleShape
                ) {
                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = "Enviar",
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun MessageBubble(
    message: Message,
    isOwnMessage: Boolean
) {
    val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
    val timeString = timeFormat.format(Date(message.timestamp))
    
    Box(
        modifier = Modifier.fillMaxWidth(),
        contentAlignment = if (isOwnMessage) Alignment.CenterEnd else Alignment.CenterStart
    ) {
        Card(
            modifier = Modifier.widthIn(max = 280.dp),
            shape = RoundedCornerShape(
                topStart = 12.dp,
                topEnd = 12.dp,
                bottomStart = if (!isOwnMessage) 4.dp else 12.dp,
                bottomEnd = if (isOwnMessage) 4.dp else 12.dp
            ),
            colors = CardDefaults.cardColors(
                containerColor = if (isOwnMessage) {
                    MaterialTheme.colorScheme.primary
                } else {
                    MaterialTheme.colorScheme.surfaceVariant
                }
            )
        ) {
            Column(
                modifier = Modifier.padding(12.dp)
            ) {
                // Si es imagen, mostrarla primero
                if (message.messageType == com.example.repartidor.data.model.MessageType.IMAGE && !message.imageUrl.isNullOrEmpty()) {
                    coil.compose.AsyncImage(
                        model = message.imageUrl,
                        contentDescription = "Imagen enviada",
                        modifier = Modifier
                            .fillMaxWidth(0.8f)
                            .heightIn(max = 250.dp)
                            .clip(RoundedCornerShape(8.dp)),
                        contentScale = ContentScale.Crop
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }
                
                // Texto del mensaje
                Text(
                    text = message.message,
                    color = if (isOwnMessage) {
                        MaterialTheme.colorScheme.onPrimary
                    } else {
                        MaterialTheme.colorScheme.onSurfaceVariant
                    },
                    fontSize = 15.sp
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = timeString,
                    fontSize = 11.sp,
                    color = if (isOwnMessage) {
                        MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f)
                    } else {
                        MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                    }
                )
            }
        }
    }
}

// Función auxiliar para comprimir imagen
fun compressImage(imageBytes: ByteArray): ByteArray {
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
    val outputStream = java.io.ByteArrayOutputStream()
    resizedBitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 70, outputStream)
    
    return outputStream.toByteArray()
}
