# Leer el archivo ClientChatPage.tsx
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\ClientChatPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Reemplazar la lógica de marcar como leído para usar el nuevo método
old_read_logic = '''// Marcar mensajes como leídos
          const incomingMessages = receivedMessages.filter(msg => 
            msg.senderId === clientId && !msg.isRead
          );
          for (const message of incomingMessages) {
            await MessageService.markMessageAsRead(message.id);
          }'''

new_read_logic = '''// Marcar TODOS los mensajes como leídos cuando abre el chat
          await MessageService.markMessagesAsRead(clientId, deliveryId!);'''

content = content.replace(old_read_logic, new_read_logic)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\ClientChatPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Auto-marcar mensajes como leídos actualizado")
