# Leer el archivo MessageService.ts
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\services\MessageService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Agregar método para marcar mensajes como leídos
mark_read_method = '''
  // Método para marcar mensajes como leídos
  async markMessagesAsRead(senderId: string, receiverId: string): Promise<MessageServiceResponse> {
    try {
      const messagesRef = ref(database, 'messages');
      const snapshot = await get(messagesRef);
      
      if (!snapshot.exists()) {
        return { success: true, message: 'No hay mensajes' };
      }

      const updates: any = {};
      let updatedCount = 0;

      for (const messageId in snapshot.val()) {
        const msg = snapshot.val()[messageId];
        if (msg.senderId === senderId && msg.receiverId === receiverId && !msg.isRead) {
          updates[`messages/${messageId}/isRead`] = true;
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        await update(messagesRef, updates);
        console.log(`✅ ${updatedCount} mensajes marcados como leídos`);
      }

      return { success: true, message: `${updatedCount} mensajes actualizados` };
    } catch (error: any) {
      console.error('Error al marcar mensajes como leídos:', error);
      return { success: false, message: error.message };
    }
  }

'''

# Insertar antes del export default
content = content.replace('export default new MessageService();', mark_read_method + 'export default new MessageService();')

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\services\MessageService.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Método markMessagesAsRead agregado")
