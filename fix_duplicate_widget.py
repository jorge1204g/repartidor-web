# Leer el archivo Dashboard.tsx
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Eliminar el widget duplicado
old_widget = """      {/* Widget de Vista Previa de Mensajes */}
      {/* Widget de Vista Previa de Chats con Clientes */}
      <ChatPreviewWidget />

      {/* Widget de Vista Previa de Mensajes */}
      {/* Widget de Vista Previa de Chats con Clientes */}
      <ChatPreviewWidget />"""

new_widget = """      {/* Widget de Vista Previa de Chats con Clientes */}
      <ChatPreviewWidget />"""

content = content.replace(old_widget, new_widget)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Widget duplicado eliminado del Dashboard")
