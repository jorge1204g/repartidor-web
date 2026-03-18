import { database, ref, onValue, get, child, update as firebaseUpdate } from './Firebase';
import { Order, OrderStatus } from '../types/Order';

interface OrderServiceResponse {
  success: boolean;
  message: string;
  data?: any;
}

class OrderService {
  // Método para obtener las órdenes del restaurante
  async getRestaurantOrders(restaurantId: string): Promise<Order[]> {
    try {
      console.log('Obteniendo órdenes para el restaurante:', restaurantId);
      
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, 'orders'));

      if (!snapshot.exists()) {
        return [];
      }

      const allOrders = snapshot.val();
      const ordersArray: Order[] = [];

      for (const orderId in allOrders) {
        const order = allOrders[orderId];
        
        // Filtrar solo las órdenes de este restaurante
        // Solo mostrar pedidos que EXPLÍCITAMENTE tengan este restaurantId
        if (order.restaurantId === restaurantId) {
          const orderObj: Order = {
            id: orderId,
            orderId: order.orderId || orderId,
            restaurantName: order.restaurantName || '',
            dateTime: order.dateTime || '',
            paymentMethod: order.paymentMethod || '',
            customer: {
              name: order.customer?.name || '',
              phone: order.customer?.phone || '',
              address: order.customer?.address || '',
              location: {
                latitude: order.customer?.location?.latitude || 0,
                longitude: order.customer?.location?.longitude || 0
              }
            },
            items: order.items && Array.isArray(order.items) ? order.items.map((item: any) => ({
              name: item.name || item.productName || '',
              quantity: item.quantity || item.qty || 0,
              price: item.unitPrice || item.price || 0
            })) : [],
            subtotal: order.subtotal || 0,
            deliveryCost: order.deliveryCost || 0,
            total: order.total || 0,
            customerLocation: {
              latitude: order.customerLocation?.latitude || 0,
              longitude: order.customerLocation?.longitude || 0
            },
            pickupLocationUrl: order.pickupLocationUrl || '',
            deliveryAddress: order.deliveryAddress || '',
            customerUrl: order.customerUrl || '',
            deliveryReferences: order.deliveryReferences || '',
            customerCode: order.customerCode || '',
            status: order.status as OrderStatus || OrderStatus.PENDING,
            assignedToDeliveryId: order.assignedToDeliveryId || '',
            assignedToDeliveryName: order.assignedToDeliveryName || '',
            candidateDeliveryIds: Array.isArray(order.candidateDeliveryIds) ? order.candidateDeliveryIds : [],
            createdAt: order.createdAt || Date.now(),
            deliveredAt: order.deliveredAt || null,
            orderType: order.orderType || 'RESTAURANT'
          };
          
          ordersArray.push(orderObj);
        }
      }

      return ordersArray.sort((a, b) => b.createdAt - a.createdAt);
      
    } catch (error) {
      console.error('Error obteniendo órdenes del restaurante:', error);
      return [];
    }
  }

  // Método para actualizar el estado de un pedido
  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<OrderServiceResponse> {
    try {
      console.log('Actualizando estado del pedido:', orderId, 'a:', newStatus);
      
      const updates: any = {};
      updates[`orders/${orderId}/status`] = newStatus;
      
      // Si el nuevo estado es DELIVERED, registrar el momento de entrega
      if (newStatus === 'DELIVERED') {
        updates[`orders/${orderId}/deliveredAt`] = Date.now();
      }
      
      await firebaseUpdate(ref(database), updates);
      
      return {
        success: true,
        message: 'Estado del pedido actualizado exitosamente'
      };
    } catch (error: any) {
      console.error('Error actualizando estado del pedido:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar el estado del pedido'
      };
    }
  }

  // Método para observar cambios en tiempo real en las órdenes del restaurante
  observeRestaurantOrders(restaurantId: string, callback: (orders: Order[]) => void): () => void {
    console.log('Observando cambios en órdenes para el restaurante:', restaurantId);
    
    const ordersRef = ref(database, 'orders');
    
    const unsubscribe = onValue(ordersRef, async (snapshot) => {
      if (snapshot.exists()) {
        const allOrders = snapshot.val();
        const ordersArray: Order[] = [];

        for (const orderId in allOrders) {
          const order = allOrders[orderId];
          
          // Filtrar solo las órdenes de este restaurante
          // Solo mostrar pedidos que EXPLÍCITAMENTE tengan este restaurantId
          if (order.restaurantId === restaurantId) {
            const orderObj: Order = {
              id: orderId,
              orderId: order.orderId || orderId,
              restaurantName: order.restaurantName || '',
              dateTime: order.dateTime || '',
              paymentMethod: order.paymentMethod || '',
              customer: {
                name: order.customer?.name || '',
                phone: order.customer?.phone || '',
                address: order.customer?.address || '',
                location: {
                  latitude: order.customer?.location?.latitude || 0,
                  longitude: order.customer?.location?.longitude || 0
                }
              },
              items: order.items && Array.isArray(order.items) ? order.items.map((item: any) => ({
                name: item.name || item.productName || '',
                quantity: item.quantity || item.qty || 0,
                price: item.unitPrice || item.price || 0
              })) : [],
              subtotal: order.subtotal || 0,
              deliveryCost: order.deliveryCost || 0,
              total: order.total || 0,
              customerLocation: {
                latitude: order.customerLocation?.latitude || 0,
                longitude: order.customerLocation?.longitude || 0
              },
              pickupLocationUrl: order.pickupLocationUrl || '',
              deliveryAddress: order.deliveryAddress || '',
              customerUrl: order.customerUrl || '',
              deliveryReferences: order.deliveryReferences || '',
              customerCode: order.customerCode || '',
              status: order.status as OrderStatus || OrderStatus.PENDING,
              assignedToDeliveryId: order.assignedToDeliveryId || '',
              assignedToDeliveryName: order.assignedToDeliveryName || '',
              candidateDeliveryIds: Array.isArray(order.candidateDeliveryIds) ? order.candidateDeliveryIds : [],
              createdAt: order.createdAt || Date.now(),
              deliveredAt: order.deliveredAt || null,
              orderType: order.orderType || 'RESTAURANT'
            };
            
            ordersArray.push(orderObj);
          }
        }

        callback(ordersArray.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error observando órdenes:', error);
      callback([]);
    });
    
    return unsubscribe;
  }
  
  // Método para asignar manualmente un pedido a un repartidor
  async assignOrderToDelivery(orderId: string, deliveryId: string, deliveryName: string): Promise<OrderServiceResponse> {
    try {
      console.log('Asignando pedido a repartidor:', orderId, '->', deliveryId);
      
      const updates: any = {};
      updates[`orders/${orderId}/assignedToDeliveryId`] = deliveryId;
      updates[`orders/${orderId}/assignedToDeliveryName`] = deliveryName;
      updates[`orders/${orderId}/status`] = 'ASSIGNED';
      updates[`orders/${orderId}/candidateDeliveryIds`] = [];
      updates[`orders/${orderId}/orderType`] = 'MANUAL'; // Marcar como asignación manual del admin
      
      await firebaseUpdate(ref(database), updates);
      
      return {
        success: true,
        message: 'Pedido asignado exitosamente al repartidor'
      };
    } catch (error: any) {
      console.error('Error asignando pedido al repartidor:', error);
      return {
        success: false,
        message: error.message || 'Error al asignar el pedido al repartidor'
      };
    }
  }
}

export default new OrderService();