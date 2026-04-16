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
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.shape.CircleShape
import androidx.lifecycle.viewModelScope
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
    
    // Launcher para tomar foto con la cámara
    val context = LocalContext.current
    val pickImageLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap: android.graphics.Bitmap? ->
        println("📥 [DEBUG] Launcher callback ejecutado")
        println("📥 [DEBUG] Bitmap recibido: ${bitmap != null}")
        
        bitmap?.let {
            println("📷 [DEBUG] Foto tomada con cámara: ${it.width}x${it.height}")
            sendingImage = true
            
            // Convertir Bitmap a Base64 y comprimir
            CoroutineScope(Dispatchers.Main).launch {
                try {
                    // Convertir bitmap a bytes (JPEG 80% calidad)
                    val outputStream = java.io.ByteArrayOutputStream()
                    it.compress(android.graphics.Bitmap.CompressFormat.JPEG, 80, outputStream)
                    val originalBytes = outputStream.toByteArray()
                    
                    println("📦 [DEBUG] Tamaño original: ${originalBytes.size} bytes (${originalBytes.size / 1024} KB)")
                    
                    // Comprimir imagen si es mayor a 150KB
                    val compressedBytes = if (originalBytes.size > 150 * 1024) {
                        println("⚠️ [DEBUG] Comprimiendo imagen...")
                        compressImageForCamera(originalBytes)
                    } else {
                        originalBytes
                    }
                    
                    println("✅ [DEBUG] Tamaño comprimido: ${compressedBytes.size} bytes (${compressedBytes.size / 1024} KB)")
                    
                    // Convertir a Base64 (sin saltos de línea)
                    val base64Image = android.util.Base64.encodeToString(compressedBytes, android.util.Base64.NO_WRAP)
                    
                    println("📤 [DEBUG] Enviando imagen comprimida (${base64Image.length} chars)")
                    println("📤 [DEBUG] Base64 preview: ${base64Image.substring(0, minOf(50, base64Image.length))}")
                    
                    viewModel.sendImage(
                        clientId = clientName,
                        clientName = clientName,
                        imageBase64 = base64Image,
                        orderId = orderId
                    )
                    
                    println("✅ [DEBUG] Imagen enviada")
                } catch (e: Exception) {
                    println("❌ [DEBUG] Error al convertir imagen: ${e.message}")
                    e.printStackTrace()
                } finally {
                    sendingImage = false
                }
            }
        } ?: run {
            println("⚠️ [DEBUG] No se tomó ninguna foto (usuario canceló)")
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
                
                // Botón para tomar foto con cámara
                FloatingActionButton(
                    onClick = { 
                        println("🔴 [DEBUG] Botón de cámara presionado")
                        println("🔴 [DEBUG] sendingImage = $sendingImage")
                        if (!sendingImage) {
                            println("🟢 [DEBUG] Abriendo cámara...")
                            try {
                                pickImageLauncher.launch(null)
                                println("✅ [DEBUG] Cámara abierta correctamente")
                            } catch (e: Exception) {
                                println("❌ [DEBUG] Error al abrir cámara: ${e.message}")
                                e.printStackTrace()
                            }
                        } else {
                            println("⚠️ [DEBUG] No se puede abrir, ya se está enviando una imagen")
                        }
                    },
                    containerColor = if (sendingImage) Color.Gray else MaterialTheme.colorScheme.secondary,
                    shape = CircleShape
                ) {
                    Icon(
                        imageVector = Icons.Default.PhotoCamera,
                        contentDescription = "Tomar foto",
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
                    println("🖼️ [DEBUG] Cargando imagen:")
                    println("   ├── messageType: ${message.messageType}")
                    println("   ├── imageUrl length: ${message.imageUrl.length}")
                    
                    // Extraer el Base64 del data URI
                    val base64String = if (message.imageUrl.startsWith("data:image")) {
                        val commaIndex = message.imageUrl.indexOf(',')
                        if (commaIndex != -1 && commaIndex < message.imageUrl.length - 1) {
                            message.imageUrl.substring(commaIndex + 1)
                        } else {
                            null
                        }
                    } else {
                        null
                    }
                    
                    if (base64String != null) {
                        // Decodificar Base64 a bytes
                        val imageBytes = android.util.Base64.decode(base64String, android.util.Base64.DEFAULT)
                        val bitmap = android.graphics.BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
                        
                        if (bitmap != null) {
                            println("✅ [DEBUG] Bitmap decodificado: ${bitmap.width}x${bitmap.height}")
                            
                            // Usar AndroidView con ImageView nativo
                            AndroidView(
                                factory = { context ->
                                    android.widget.ImageView(context).apply {
                                        setImageBitmap(bitmap)
                                        scaleType = android.widget.ImageView.ScaleType.CENTER_CROP
                                    }
                                },
                                modifier = Modifier
                                    .fillMaxWidth(0.8f)
                                    .heightIn(max = 250.dp)
                                    .clip(RoundedCornerShape(8.dp))
                            )
                        } else {
                            println("❌ [DEBUG] No se pudo decodificar el bitmap")
                            Text(
                                text = "⚠️ Error al cargar imagen",
                                color = MaterialTheme.colorScheme.error,
                                fontSize = 12.sp
                            )
                        }
                    }
                    
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

// Función para comprimir foto de la cámara
fun compressImageForCamera(imageBytes: ByteArray): ByteArray {
    // Decodificar bitmap
    var bitmap = android.graphics.BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
    
    // Redimensionar a máximo 800px
    val maxDimension = 800
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
    
    // Comprimir progresivamente
    var quality = 75
    val outputStream = java.io.ByteArrayOutputStream()
    
    while (quality > 20) {
        outputStream.reset()
        bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, quality, outputStream)
        
        val compressedSize = outputStream.size()
        println("🔄 [DEBUG] Calidad: $quality%, Tamaño: ${compressedSize / 1024} KB")
        
        if (compressedSize <= 150 * 1024) { // 150KB
            println("✅ [DEBUG] Tamaño objetivo alcanzado con calidad $quality%")
            break
        }
        
        quality -= 10
    }
    
    return outputStream.toByteArray()
}
