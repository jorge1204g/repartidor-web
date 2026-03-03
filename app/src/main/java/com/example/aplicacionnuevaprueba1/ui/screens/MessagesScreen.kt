package com.example.aplicacionnuevaprueba1.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.unit.dp
import com.example.aplicacionnuevaprueba1.data.model.DeliveryPerson
import com.example.aplicacionnuevaprueba1.data.model.Message
import com.example.aplicacionnuevaprueba1.ui.viewmodel.AdminViewModel
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.ExperimentalMaterial3Api

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MessagesScreen(
    deliveryPersons: List<DeliveryPerson>,
    viewModel: AdminViewModel
) {
    var expanded by remember { mutableStateOf(false) }
    var selectedDeliveryPerson by remember { mutableStateOf<DeliveryPerson?>(null) }
    val messages by viewModel.messages.collectAsState()
    
    Column(modifier = Modifier.fillMaxSize()) {
        // Selector de repartidor
        ExposedDropdownMenuBox(
            expanded = expanded,
            onExpandedChange = { expanded = !expanded }
        ) {
            TextField(
                value = selectedDeliveryPerson?.name ?: "Seleccionar repartidor",
                onValueChange = { },
                readOnly = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor(MenuAnchorType.PrimaryNotEditable)
            )
            
            ExposedDropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false }
            ) {
                deliveryPersons.forEach { person ->
                    DropdownMenuItem(
                        text = { Text("${person.name} (${if (person.isOnline) "En línea" else "Desconectado"})") },
                        onClick = {
                            selectedDeliveryPerson = person
                            expanded = false
                        }
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        if (selectedDeliveryPerson != null) {
            // Mostrar mensajes con el repartidor seleccionado
            val filteredMessages = messages.filter { 
                it.senderId == selectedDeliveryPerson?.id || it.receiverId == selectedDeliveryPerson?.id 
            }.sortedBy { it.timestamp }
            
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredMessages) { message ->
                    var sender: DeliveryPerson? = null
                    for (dp in deliveryPersons) {
                        if (dp.id == message.senderId) {
                            sender = dp
                            break
                        }
                    }
                    MessageItem(message, sender)
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Campo para enviar mensaje
            SendMessageSection(selectedDeliveryPerson!!, viewModel)
        } else {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Selecciona un repartidor para comenzar a chatear",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun MessageItem(message: Message, sender: DeliveryPerson?) {
    val isOwnMessage = message.senderId == "admin"
    
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isOwnMessage) Arrangement.End else Arrangement.Start
    ) {
        Card(
            modifier = Modifier
                .wrapContentSize()
                .padding(4.dp),
            colors = if (isOwnMessage) {
                CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary)
            } else {
                CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            }
        ) {
            Column(
                modifier = Modifier.padding(8.dp)
            ) {
                Text(
                    text = message.message,
                    color = if (isOwnMessage) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "${sender?.name ?: "Admin"} • ${formatTimestamp(message.timestamp)}",
                    style = MaterialTheme.typography.labelSmall,
                    color = if (isOwnMessage) MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f) else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                    fontStyle = FontStyle.Italic
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SendMessageSection(deliveryPerson: DeliveryPerson, viewModel: AdminViewModel) {
    var messageText by remember { mutableStateOf("") }
    
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        TextField(
            value = messageText,
            onValueChange = { messageText = it },
            label = { Text("Escribe un mensaje") },
            modifier = Modifier.weight(1f)
        )
        
        Button(
            onClick = {
                if (messageText.isNotBlank()) {
                    viewModel.sendMessage(
                        receiverId = deliveryPerson.id,
                        receiverName = deliveryPerson.name,
                        message = messageText
                    )
                    messageText = ""
                }
            },
            enabled = messageText.isNotBlank()
        ) {
            Text("Enviar")
        }
    }
}

fun formatTimestamp(timestamp: Long): String {
    val date = java.util.Date(timestamp)
    return android.text.format.DateFormat.format("HH:mm", date).toString()
}