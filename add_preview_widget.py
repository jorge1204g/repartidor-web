# Leer archivo
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Agregar import del MessagePreviewWidget
old_imports = '''import { useMessage } from '../contexts/MessageContext';'''
new_imports = '''import { useMessage } from '../contexts/MessageContext';
import MessagePreviewWidget from '../components/MessagePreviewWidget';'''

content = content.replace(old_imports, new_imports)

# Agregar el widget después de las ganancias
old_position = '''{/* Ganancias */}
      <div className="earnings-grid">'''
      
new_position = '''{/* Widget de Vista Previa de Mensajes */}
      <MessagePreviewWidget />

      {/* Ganancias */}
      <div className="earnings-grid">'''

content = content.replace(old_position, new_position)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ MessagePreviewWidget agregado al Dashboard")
