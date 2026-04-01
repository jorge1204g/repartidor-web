# Leer archivo
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\services\MessageService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Agregar nuevo método antes del export default
new_method = '''
  // Método para obtener últimos mensajes de todas las conversaciones
  observeLastMessages(userId: string, callback: (messages: Message[]) => void) {
    const messagesRef = ref(database, 'messages');
    
    onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const allMessages = snapshot.val();
        const userMessages: Message[] = [];
        const conversationMap = new Map<string, Message>();
        
        // Obtener último mensaje de cada conversación
        for (const messageId in allMessages) {
          const msg = allMessages[messageId];
          
          if (msg.senderId === userId || msg.receiverId === userId) {
            const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            
            // Mantener solo el mensaje más reciente de cada conversación
            if (!conversationMap.has(otherUserId) || 
                msg.timestamp > conversationMap.get(otherUserId)!.timestamp) {
              conversationMap.set(otherUserId, {
                id: messageId,
                senderId: msg.senderId || '',
                senderName: msg.senderName || '',
                receiverId: msg.receiverId || '',
                receiverName: msg.receiverName || '',
                message: msg.message || '',
                timestamp: msg.timestamp || Date.now(),
                isRead: msg.isRead || false,
                messageType: msg.messageType || 'TEXT'
              });
            }
          }
        }
        
        // Convertir map a array y ordenar por timestamp
        conversationMap.forEach(msg => userMessages.push(msg));
        userMessages.sort((a, b) => b.timestamp - a.timestamp);
        
        callback(userMessages);
      } else {
        callback([]);
      }
    });
  }

'''

# Insertar antes del export default
content = content.replace('export default new MessageService();', new_method + 'export default new MessageService();')

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\services\MessageService.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Método observeLastMessages agregado al MessageService")
