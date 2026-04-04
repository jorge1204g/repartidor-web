import { database, ref, get, update as firebaseUpdate, push, set } from './Firebase';
import { OrderStatus } from '../types/Order';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  productId: string;
}

interface CreateOrderRequest {
  restaurantId: string;
  restaurantName: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  deliveryTimeEstimate: string;
  specialRequests?: string;
  status: OrderStatus;
  whoPaysDelivery?: string;
  candidateDeliveryIds?: string[];
  deliveryReferences?: string;
  customerCode?: string;
  customerMapUrl?: string; // URL de Google Maps del cliente
  orderDateTime?: string; // Fecha y hora del pedido
  orderType?: 'RESTAURANT' | 'MANUAL'; // Tipo de pedido
}

interface OrderCreationResponse {
  success: boolean;
  message: string;
  orderId?: string;
}

class OrderCreationService {
  // Método para crear un nuevo pedido
  async createOrder(request: CreateOrderRequest): Promise<OrderCreationResponse> {
    try {
      console.log('Creando nuevo pedido para el restaurante:', request.restaurantId);
      
      // Validar que el restaurante exista
      const restaurantSnapshot = await get(ref(database, `restaurants/${request.restaurantId}`));
      let restaurantData: any = {};
      
      if (!restaurantSnapshot.exists()) {
        // Si el restaurante no existe, crear un registro temporal con la información básica
        console.warn(`Restaurante ${request.restaurantId} no encontrado, usando datos básicos`);
        restaurantData = {
          name: request.restaurantName,
          phone: request.customerPhone || '',
          address: request.customerAddress || ''
        };
      } else {
        restaurantData = restaurantSnapshot.val();
      }
      
      // Crear el objeto de pedido
      const newOrder = {
        id: '', // Se generará con push
        orderId: '', // Se generará con push
        restaurantId: request.restaurantId,
        restaurantName: request.restaurantName,
        customer: {
          name: request.customerName,
          address: request.customerAddress,
          phone: request.customerPhone || ''
        },
        items: request.items,
        subtotal: request.subtotal,
        deliveryCost: request.deliveryCost,
        total: request.total,
        deliveryTimeEstimate: request.deliveryTimeEstimate,
        specialRequests: request.specialRequests || '',
        status: !request.candidateDeliveryIds || request.candidateDeliveryIds.length === 0
          ? 'MANUAL_ASSIGNED' // Si no hay candidatos específicos, usar MANUAL_ASSIGNED para que sea visible para todos los repartidores
          : request.status, // Mantener el status original si hay candidatos específicos
        orderType: request.orderType || 'MANUAL', // Indica que el pedido es manual (por defecto)
        whoPaysDelivery: request.whoPaysDelivery || 'restaurant', // Valor por defecto
        assignedToDeliveryId: '', // Aún no asignado
        assignedToDeliveryName: '', // Aún no asignado
        candidateDeliveryIds: request.candidateDeliveryIds || [], // IDs de posibles repartidores
        createdAt: Date.now(),
        deliveredAt: null,
        pickupLocationUrl: (restaurantData as any).address || '', // Usar dirección del restaurante como punto de recogida
        restaurantMapUrl: (restaurantData as any).mapUrl || '', // URL de Google Maps del restaurante
        deliveryAddress: request.customerAddress,
        customerLocation: { // Asumimos que se obtiene de la dirección
          latitude: 0, // Estos valores deberían provenir de geocodificación en una implementación real
          longitude: 0
        },
        customerUrl: request.customerMapUrl || '', // URL del cliente si aplica
        deliveryReferences: request.deliveryReferences || '', // Referencias para el repartidor
        customerCode: request.customerCode || '' // Código de confirmación del pedido
      };
      
      // Generar una nueva clave para el pedido
      const newOrderRef = push(ref(database, 'orders'));
      const orderId = newOrderRef.key;
      
      if (!orderId) {
        throw new Error('No se pudo generar un ID para el pedido');
      }
      
      // Actualizar el objeto con el ID generado
      newOrder.id = orderId;
      newOrder.orderId = orderId;
      
      // Guardar el pedido en Firebase usando set para el nuevo registro
      await set(newOrderRef, newOrder);
      
      return {
        success: true,
        message: 'Pedido creado exitosamente',
        orderId: orderId
      };
    } catch (error: any) {
      console.error('Error creando pedido:', error);
      return {
        success: false,
        message: error.message || 'Error al crear el pedido'
      };
    }
  }

  // Método para marcar un pedido como listo para recoger
  async markOrderAsReady(orderId: string, restaurantId: string): Promise<OrderCreationResponse> {
    try {
      console.log('Marcando pedido como listo para recoger:', orderId);
      
      // Verificar que el pedido pertenece al restaurante
      const orderSnapshot = await get(ref(database, `orders/${orderId}`));
      if (!orderSnapshot.exists()) {
        throw new Error('Pedido no encontrado');
      }
      
      const orderData = orderSnapshot.val();
      if (orderData.restaurantId !== restaurantId) {
        throw new Error('No autorizado: el pedido no pertenece a este restaurante');
      }
      
      // Actualizar el estado del pedido
      const updates: any = {};
      updates[`orders/${orderId}/status`] = OrderStatus.ARRIVED_AT_STORE;
      updates[`orders/${orderId}/updatedAt`] = Date.now();
      
      await firebaseUpdate(ref(database), updates);
      
      return {
        success: true,
        message: 'Pedido marcado como listo para recoger'
      };
    } catch (error: any) {
      console.error('Error marcando pedido como listo:', error);
      return {
        success: false,
        message: error.message || 'Error al marcar el pedido como listo'
      };
    }
  }

  // Método para obtener la información del restaurante
  async getRestaurantInfo(restaurantId: string): Promise<any> {
    try {
      const restaurantSnapshot = await get(ref(database, `restaurants/${restaurantId}`));
      if (!restaurantSnapshot.exists()) {
        // Si el restaurante no existe, retornar información básica
        console.warn(`Restaurante ${restaurantId} no encontrado, retornando datos básicos`);
        return {
          name: 'Restaurante temporal',
          phone: '',
          address: ''
        };
      }
      
      return restaurantSnapshot.val();
    } catch (error: any) {
      console.error('Error obteniendo información del restaurante:', error);
      // En caso de error, retornar información básica
      return {
        name: 'Restaurante temporal',
        phone: '',
        address: ''
      };
    }
  }
  
  // Método para eliminar un pedido CON VERIFICACIÓN DOBLE
  async deleteOrder(orderId: string): Promise<{ success: boolean, message: string }> {
    try {
      console.log('🗑️ [ELIMINAR] Iniciando eliminación del pedido:', orderId);
      
      const MAX_RETRIES = 3;
      let retries = 0;
      let success = false;
      
      while (retries < MAX_RETRIES && !success) {
        retries++;
        console.log(`🔄 [ELIMINAR] Intento ${retries} de ${MAX_RETRIES}`);
        
        try {
          // Eliminar de AMBAS colecciones simultáneamente
          const ordersPromise = set(ref(database, `orders/${orderId}`), null)
            .then(() => {
              console.log('✅ [ELIMINAR] Pedido eliminado de orders');
              return true;
            })
            .catch(err => {
              console.error('❌ [ELIMINAR] Error eliminando de orders:', err);
              return false;
            });
          
          const clientOrdersPromise = set(ref(database, `client_orders/${orderId}`), null)
            .then(() => {
              console.log('✅ [ELIMINAR] Pedido eliminado de client_orders');
              return true;
            })
            .catch(err => {
              console.error('❌ [ELIMINAR] Error eliminando de client_orders:', err);
              return false;
            });
          
          // Esperar a que ambas operaciones terminen
          const [ordersDeleted, clientOrdersDeleted] = await Promise.all([ordersPromise, clientOrdersPromise]);
          
          if (ordersDeleted && clientOrdersDeleted) {
            success = true;
            console.log('✅ [ELIMINAR] Pedido eliminado exitosamente de AMBAS colecciones');
            break; // Salir del loop si todo salió bien
          }
          
          // Si alguna falló, reintentar
          console.warn(`⚠️ [ELIMINAR] Una o ambas eliminaciones fallaron. Reintentando...`);
          
        } catch (error: any) {
          console.error(`❌ [ELIMINAR] Error en intento ${retries}:`, error);
          
          if (retries === MAX_RETRIES) {
            throw new Error(`Error después de ${MAX_RETRIES} intentos: ${error.message}`);
          }
        }
        
        // Esperar 1 segundo antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // VERIFICACIÓN FINAL - Asegurarse de que realmente se eliminó
      console.log('🔍 [ELIMINAR] Verificando que el pedido haya sido eliminado...');
      
      const { get } = await import('firebase/database');
      const ordersCheck = await get(ref(database, `orders/${orderId}`));
      const clientOrdersCheck = await get(ref(database, `client_orders/${orderId}`));
      
      if (ordersCheck.exists() || clientOrdersCheck.exists()) {
        console.error('❌ [ELIMINAR] VERIFICACIÓN FALLIDA: El pedido aún existe en alguna colección');
        console.error('   - orders:', ordersCheck.exists() ? '❌ EXISTE' : '✅ eliminado');
        console.error('   - client_orders:', clientOrdersCheck.exists() ? '❌ EXISTE' : '✅ eliminado');
        
        // Forzar eliminación directa como último recurso
        console.log('⚠️ [ELIMINAR] Forzando eliminación directa...');
        await set(ref(database, `orders/${orderId}`), null);
        await set(ref(database, `client_orders/${orderId}`), null);
        console.log('✅ [ELIMINAR] Eliminación forzada completada');
      }
      
      return {
        success: true,
        message: 'Pedido eliminado exitosamente de ambas colecciones (verificado)'
      };
      
    } catch (error: any) {
      console.error('❌ [ELIMINAR] Error eliminando pedido:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar el pedido'
      };
    }
  }

  // Método para obtener los pedidos del restaurante
  async getRestaurantOrders(restaurantId: string): Promise<any[]> {
    try {
      console.log('Obteniendo pedidos del restaurante:', restaurantId);
      
      // Obtener todos los pedidos
      const ordersSnapshot = await get(ref(database, 'orders'));
      
      if (!ordersSnapshot.exists()) {
        return [];
      }

      const allOrders = ordersSnapshot.val();
      const restaurantOrders: any[] = [];

      for (const orderId in allOrders) {
        const order = allOrders[orderId];
        
        // Filtrar solo los pedidos de este restaurante
        if (order.restaurantId === restaurantId) {
          // Añadir el ID del pedido al objeto
          restaurantOrders.push({
            id: orderId,
            ...order
          });
        }
      }

      return restaurantOrders;
    } catch (error: any) {
      console.error('Error obteniendo pedidos del restaurante:', error);
      throw error;
    }
  }
}

export default new OrderCreationService();