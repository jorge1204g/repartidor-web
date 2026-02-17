import { database, ref, onValue, get, child, update as firebaseUpdate } from './Firebase';
import { Order, OrderStatus } from '../types/Order';

interface OrderServiceResponse {
  success: boolean;
  message: string;
  data?: any;
}

class OrderService {
  // Método para obtener las órdenes asignadas a un repartidor
  async getAssignedOrders(deliveryId: string): Promise<Order[]> {
    try {
      console.log('Obteniendo órdenes asignadas para:', deliveryId);
      
      // Consultar todas las órdenes en la base de datos
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, 'orders'));

      if (!snapshot.exists()) {
        return [];
      }

      const allOrders = snapshot.val();
      const ordersArray: Order[] = [];

      for (const orderId in allOrders) {
        const order = allOrders[orderId];
        
        // Filtrar solo las órdenes que están asignadas a este repartidor
        // o que aún no tienen un repartidor asignado pero están en estado MANUAL_ASSIGNED
        if (
          order.assignedToDeliveryId === deliveryId ||
          (order.status === 'MANUAL_ASSIGNED' && !order.assignedToDeliveryId)
        ) {
          // Convertir la estructura a nuestro tipo Order
          const orderObj: Order = {
            id: orderId,
            orderId: order.orderId || orderId,
            restaurantName: order.restaurantName || '',
            dateTime: order.dateTime || '',
            paymentMethod: order.paymentMethod || '',
            customer: {
              name: order.customer?.name || '',
              phone: order.customer?.phone || '',
              address: order.customer?.address || '', // Usar address en lugar de email
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
            deliveredAt: order.deliveredAt || null
          };
          
          ordersArray.push(orderObj);
        }
      }

      // Filtrar solo pedidos activos (no completados) excepto si están asignados a este repartidor
      return ordersArray.filter(order => 
        order.status !== OrderStatus.DELIVERED || order.assignedToDeliveryId === deliveryId
      ).sort((a, b) => b.createdAt - a.createdAt); // Ordenar por fecha descendente
      
    } catch (error) {
      console.error('Error obteniendo órdenes asignadas:', error);
      return [];
    }
  }

  // Método para aceptar un pedido
  async acceptOrder(orderId: string, deliveryId: string, deliveryName: string): Promise<OrderServiceResponse> {
    try {
      console.log('Aceptando pedido:', orderId, 'para repartidor:', deliveryId);
      
      // Consultar el pedido en la base de datos
      const dbRef = ref(database);
      const orderSnapshot = await get(child(dbRef, `orders/${orderId}`));
      
      if (!orderSnapshot.exists()) {
        throw new Error('Pedido no encontrado');
      }
      
      const order = orderSnapshot.val();
      
      // Verificar que el pedido esté en estado MANUAL_ASSIGNED y no tenga repartidor asignado
      if (order.status !== 'MANUAL_ASSIGNED' || order.assignedToDeliveryId) {
        throw new Error('Pedido no disponible para aceptar');
      }
      
      // Actualizar solo los campos necesarios para aceptar el pedido, manteniendo toda la información existente
      const updates: any = {
        assignedToDeliveryId: deliveryId,
        assignedToDeliveryName: deliveryName,
        status: 'ACCEPTED',
        candidateDeliveryIds: []  // Limpiar candidatos una vez asignado
      };
      
      // Actualizar solo los campos específicos del pedido, manteniendo el resto de la información intacta
      const updatesWithPath: any = {};
      Object.keys(updates).forEach(key => {
        updatesWithPath[`orders/${orderId}/${key}`] = updates[key];
      });
      
      await firebaseUpdate(ref(database), updatesWithPath);
      
      return {
        success: true,
        message: 'Pedido aceptado exitosamente'
      };
    } catch (error: any) {
      console.error('Error aceptando pedido:', error);
      return {
        success: false,
        message: error.message || 'Error al aceptar el pedido'
      };
    }
  }

  // Método para actualizar el estado de un pedido
  async updateOrderStatus(orderId: string, newStatus: string): Promise<OrderServiceResponse> {
    try {
      console.log('Actualizando estado del pedido:', orderId, 'a:', newStatus);
      
      // Actualizar el estado del pedido en Firebase
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

  // Método para observar cambios en tiempo real en las órdenes
  observeOrders(deliveryId: string, callback: (orders: Order[]) => void): () => void {
    console.log('Observando cambios en órdenes para:', deliveryId);
    
    // Crear una referencia a la base de datos de órdenes
    const ordersRef = ref(database, 'orders');
    
    // Configurar listener en tiempo real
    const unsubscribe = onValue(ordersRef, async (snapshot) => {
      if (snapshot.exists()) {
        const allOrders = snapshot.val();
        const ordersArray: Order[] = [];

        for (const orderId in allOrders) {
          const order = allOrders[orderId];
          
          // Filtrar solo las órdenes que están asignadas a este repartidor
          // o que aún no tienen un repartidor asignado pero están en estado MANUAL_ASSIGNED
          if (
            order.assignedToDeliveryId === deliveryId ||
            (order.status === 'MANUAL_ASSIGNED' && !order.assignedToDeliveryId)
          ) {
            // Convertir la estructura a nuestro tipo Order
            const orderObj: Order = {
              id: orderId,
              orderId: order.orderId || orderId,
              restaurantName: order.restaurantName || '',
              dateTime: order.dateTime || '',
              paymentMethod: order.paymentMethod || '',
              customer: {
                name: order.customer?.name || '',
                phone: order.customer?.phone || '',
                address: order.customer?.address || '', // Usar address en lugar de email
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
              deliveredAt: order.deliveredAt || null
            };
            
            ordersArray.push(orderObj);
          }
        }

        // Filtrar solo pedidos activos (no completados) excepto si están asignados a este repartidor
        const activeOrders = ordersArray.filter(order => 
          order.status !== OrderStatus.DELIVERED || order.assignedToDeliveryId === deliveryId
        ).sort((a, b) => b.createdAt - a.createdAt); // Ordenar por fecha descendente
        
        callback(activeOrders);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error observando órdenes:', error);
      callback([]);
    });
    
    // Devolver función para cancelar la suscripción
    return unsubscribe;
  }
}

export default new OrderService();