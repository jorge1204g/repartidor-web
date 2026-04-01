# Leer el archivo ClientListPage.tsx
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\ClientListPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Agregar import de AudioNotificationService
old_import = "import { DeliveryPerson } from '../types/DeliveryPerson';"
new_import = """import { DeliveryPerson } from '../types/DeliveryPerson';
import AudioNotificationService from '../utils/AudioNotificationService';"""

content = content.replace(old_import, new_import)

# 2. Agregar estado para último mensaje
old_state = """const [filteredConversations, setFilteredConversations] = useState<ChatConversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);"""

new_state = """const [filteredConversations, setFilteredConversations] = useState<ChatConversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(0);"""

content = content.replace(old_state, new_state)

# 3. Agregar notificación de sonido después de actualizar conversaciones
old_update = """setConversations(convArray);
          setLoading(false);"""

new_update = """// Detectar si hay mensajes nuevos para notificación sonora
          const totalMessages = convArray.reduce((sum, conv) => sum + conv.unreadCount, 0);
          if (totalMessages > lastMessageCount && lastMessageCount > 0) {
            // Hay mensajes nuevos - reproducir sonido
            AudioNotificationService.playMessageReceivedSound();
          }
          setLastMessageCount(totalMessages);
          
          setConversations(convArray);
          setLoading(false);"""

content = content.replace(old_update, new_update)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\ClientListPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Sonido de notificación agregado a ClientListPage")
