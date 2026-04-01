# Leer el archivo MessageService.ts
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\services\MessageService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Mover el método dentro de la clase
old_text = """  }
}


  // Método para marcar mensajes como leídos
  async markMessagesAsRead(senderId: string, receiverId: string): Promise<MessageServiceResponse> {"""

new_text = """  }

  // Método para marcar mensajes como leídos
  async markMessagesAsRead(senderId: string, receiverId: string): Promise<MessageServiceResponse> {"""

content = content.replace(old_text, new_text)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\services\MessageService.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Método markMessagesAsRead movido dentro de la clase")
