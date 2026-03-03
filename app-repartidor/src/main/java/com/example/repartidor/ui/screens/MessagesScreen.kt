package com.example.repartidor.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.repartidor.data.model.Message
import com.example.repartidor.ui.viewmodel.DeliveryViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MessagesScreen(
    viewModel: DeliveryViewModel,
    onBackToDashboard: () -> Unit
) {
    val messages by viewModel.messages.collectAsState()
    var newMessage by remember { mutableStateOf("") }
    val deliveryPerson by viewModel.deliveryPerson.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mensajes con Administrador") },
                navigationIcon = {
                    IconButton(onClick = onBackToDashboard) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Volver")
                    }
                }
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
                modifier = Modifier
                    .weight(1f)
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (messages.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier.fillParentMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "No hay mensajes aún.\n¡Envía el primero!",
                                textAlign = TextAlign.Center,
                                fontStyle = FontStyle.Italic,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                } else {
                    items(messages.filter { it.receiverId == "admin" || it.senderId == "admin" }) { message ->
                        MessageItem(
                            message = message,
                            isOwnMessage = message.senderId == deliveryPerson?.id
                        )
                    }
                }
            }

            // Campo para enviar nuevo mensaje
            Row(
                modifier = Modifier
                    .padding(8.dp)
                    .fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextField(
                    value = newMessage,
                    onValueChange = { newMessage = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("Escribe un mensaje...") },
                    singleLine = true
                )

                IconButton(
                    onClick = {
                        if (newMessage.trim().isNotEmpty()) {
                            viewModel.sendMessage(
                                receiverId = "admin",
                                receiverName = "Administrador",
                                message = newMessage.trim()
                            )
                            newMessage = ""
                        }
                    },
                    enabled = newMessage.trim().isNotEmpty()
                ) {
                    Icon(Icons.Filled.Send, contentDescription = "Enviar")
                }
            }
        }
    }
}

@Composable
fun MessageItem(
    message: Message,
    isOwnMessage: Boolean
) {
    val alignment = if (isOwnMessage) {
        Alignment.End
    } else {
        Alignment.Start
    }

    val backgroundColor = if (isOwnMessage) {
        MaterialTheme.colorScheme.primary
    } else {
        MaterialTheme.colorScheme.surfaceVariant
    }

    val contentColor = if (isOwnMessage) {
        MaterialTheme.colorScheme.onPrimary
    } else {
        MaterialTheme.colorScheme.onSurfaceVariant
    }

    val horizontalPadding = if (isOwnMessage) {
        PaddingValues(start = 60.dp, end = 8.dp)
    } else {
        PaddingValues(start = 8.dp, end = 60.dp)
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontalPadding),
        horizontalArrangement = if (isOwnMessage) Arrangement.End else Arrangement.Start
    ) {
        Card(
            modifier = Modifier
                .wrapContentWidth()
                .padding(vertical = 4.dp),
            colors = CardDefaults.cardColors(
                containerColor = backgroundColor
            ),
            shape = if (isOwnMessage) {
                MaterialTheme.shapes.extraLarge.copy(
                    bottomEnd = if (isOwnMessage) androidx.compose.foundation.shape.CornerSize(0.dp) else androidx.compose.foundation.shape.CornerSize(16.dp)
                )
            } else {
                MaterialTheme.shapes.extraLarge.copy(
                    bottomStart = if (!isOwnMessage) androidx.compose.foundation.shape.CornerSize(0.dp) else androidx.compose.foundation.shape.CornerSize(16.dp)
                )
            }
        ) {
            Column(
                modifier = Modifier.padding(12.dp)
            ) {
                Text(
                    text = message.senderName,
                    style = MaterialTheme.typography.bodySmall,
                    color = contentColor,
                    fontStyle = FontStyle.Italic
                )
                
                Text(
                    text = message.message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = contentColor
                )
                
                Text(
                    text = java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault())
                        .format(java.util.Date(message.timestamp)),
                    style = MaterialTheme.typography.labelSmall,
                    color = contentColor,
                    textAlign = TextAlign.End
                )
            }
        }
    }
}