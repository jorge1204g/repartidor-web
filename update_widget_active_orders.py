# Leer el archivo ChatPreviewWidget.tsx
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\components\ChatPreviewWidget.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Agregar interfaz para OrderService
old_interface = """interface ChatPreview {
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}"""

new_interface = """import OrderService from '../services/OrderService';
import { Order, OrderStatus } from '../types/Order';

interface ChatPreview {
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  orderId: string;
  orderCode: string;
  isActive: boolean; // true si el pedido está en curso
}"""

content = content.replace(old_interface, new_interface)

# 2. Agregar estado para ordenes activas
old_state = """const [previews, setPreviews] = useState<ChatPreview[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [lastCount, setLastCount] = useState(0);"""

new_state = """const [previews, setPreviews] = useState<ChatPreview[]>([]);
  const [activeOrderIds, setActiveOrderIds] = useState<Set<string>>(new Set());
  const [totalUnread, setTotalUnread] = useState(0);
  const [lastCount, setLastCount] = useState(0);"""

content = content.replace(old_state, new_state)

# 3. Escuchar ordenes activas
old_effect_start = """useEffect(() => {
    const deliveryId = AuthService.getDeliveryId();
    
    if (!deliveryId) return;

    // Escuchar mensajes en tiempo real"""

new_effect_start = """useEffect(() => {
    const deliveryId = AuthService.getDeliveryId();
    
    if (!deliveryId) return;

    // Escuchar pedidos activos del repartidor
    const unsubscribeOrders = OrderService.listenToAcceptedOrders(deliveryId, (orders) => {
      const activeIds = new Set<string>();
      orders.forEach(order => {
        // Solo pedidos NO entregados y NO cancelados
        if (order.status !== OrderStatus.DELIVERED && 
            order.status !== OrderStatus.CANCELLED) {
          activeIds.add(order.id);
        }
      });
      setActiveOrderIds(activeIds);
    });

    return () => {
      unsubscribeOrders();
    };
  }, []);

  useEffect(() => {
    const deliveryId = AuthService.getDeliveryId();
    
    if (!deliveryId) return;

    // Escuchar mensajes en tiempo real"""

content = content.replace(old_effect_start, new_effect_start)

# 4. Filtrar solo mensajes de pedidos activos
old_filter = """for (const msg of messages) {
        if (msg.senderId !== 'admin' && !msg.senderId.startsWith('admin')) {
          const otherId = msg.senderId === deliveryId ? msg.receiverId : msg.senderId;
          const otherName = msg.senderId === deliveryId ? msg.receiverName : msg.senderName;
          
          if (!conversationMap.has(otherId)) {
            conversationMap.set(otherId, {
              clientId: otherId,
              clientName: otherName,
              lastMessage: msg.message,
              lastMessageTime: msg.timestamp,
              unreadCount: msg.receiverId === deliveryId && !msg.isRead ? 1 : 0
            });"""

new_filter = """for (const msg of messages) {
        if (msg.senderId !== 'admin' && !msg.senderId.startsWith('admin')) {
          const otherId = msg.senderId === deliveryId ? msg.receiverId : msg.senderId;
          const otherName = msg.senderId === deliveryId ? msg.receiverName : msg.senderName;
          const orderId = msg.orderId || '';
          
          // Verificar si este mensaje es de un pedido ACTIVO
          const isActive = activeOrderIds.has(orderId);
          
          // SOLO mostrar mensajes de pedidos activos en el preview
          if (!isActive) {
            continue; // Saltar mensajes de pedidos finalizados
          }
          
          if (!conversationMap.has(otherId)) {
            conversationMap.set(otherId, {
              clientId: otherId,
              clientName: otherName,
              orderId,
              orderCode: orderId,
              lastMessage: msg.message,
              lastMessageTime: msg.timestamp,
              unreadCount: msg.receiverId === deliveryId && !msg.isRead ? 1 : 0,
              isActive
            });"""

content = content.replace(old_filter, new_filter)

# 5. Actualizar la parte donde se actualizan mensajes existentes
old_update = """else {
            const existing = conversationMap.get(otherId)!;
            if (msg.timestamp > existing.lastMessageTime) {
              conversationMap.set(otherId, {
                ...existing,
                lastMessage: msg.message,
                lastMessageTime: msg.timestamp,
                unreadCount: existing.unreadCount + (msg.receiverId === deliveryId && !msg.isRead ? 1 : 0)
              });
            }
          }"""

new_update = """else {
            const existing = conversationMap.get(otherId)!;
            if (msg.timestamp > existing.lastMessageTime) {
              conversationMap.set(otherId, {
                ...existing,
                orderId,
                orderCode: orderId,
                lastMessage: msg.message,
                lastMessageTime: msg.timestamp,
                unreadCount: existing.unreadCount + (msg.receiverId === deliveryId && !msg.isRead ? 1 : 0),
                isActive
              });
            }
          }"""

content = content.replace(old_update, new_update)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\components\ChatPreviewWidget.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Widget actualizado - Solo muestra pedidos activos")
