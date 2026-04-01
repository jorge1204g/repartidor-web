# Leer el archivo Dashboard.tsx
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Eliminar imports duplicados de MessagePreviewWidget y agregar ChatPreviewWidget
old_imports = """import MessagePreviewWidget from '../components/MessagePreviewWidget';
import MessagePreviewWidget from '../components/MessagePreviewWidget';
import MessagePreviewWidget from '../components/MessagePreviewWidget';
import MessagePreviewWidget from '../components/MessagePreviewWidget';"""

new_imports = """import ChatPreviewWidget from '../components/ChatPreviewWidget';"""

content = content.replace(old_imports, new_imports)

# 2. Reemplazar el widget en el dashboard
old_widget = """      <MessagePreviewWidget />

      {/* Widget de Vista Previa de Mensajes */}
      <MessagePreviewWidget />"""

new_widget = """      {/* Widget de Vista Previa de Chats con Clientes */}
      <ChatPreviewWidget />"""

content = content.replace(old_widget, new_widget)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ ChatPreviewWidget agregado al Dashboard")
