import { database, ref, onValue, get, child, update as firebaseUpdate } from './Firebase';
import { Order, OrderStatus } from '../types/Order';
import AudioNotificationService from '../utils/AudioNotificationService';

interface OrderServiceResponse {
  success: boolean;
  message: string;
  data?: any;
}

class OrderService {
  private previousOrders: Order[] = [];

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
        // o que aún no tienen un repartidor asignado pero están en estado MANUAL_ASSIGNED o ASSIGNABLE
        if (
          order.assignedToDeliveryId === deliveryId ||
          ((order.status === 'MANUAL_ASSIGNED' || order.status === 'ASSIGNED' || order.status === 'PENDING') && !order.assignedToDeliveryId)
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
            deliveredAt: order.deliveredAt || null,
            restaurantMapUrl: order.restaurantMapUrl || '', // URL de Google Maps del restaurante
            orderType: order.orderType, // Leer el tipo de pedido (puede ser undefined para pedidos antiguos)
            serviceType: order.serviceType, // Tipo de servicio: MOTORCYCLE_TAXI, etc.
            pickupAddress: order.pickupAddress || '', // Dirección de origen para motocicleta
            distance: order.distance || undefined // Distancia calculada
          };
          
          ordersArray.push(orderObj);
        }
      }

      // Filtrar solo pedidos activos (no mostrar cancelados ni entregados, incluso si están asignados a este repartidor)
      return ordersArray.filter(order => 
        order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED
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
      
      // Actualizar en AMBAS colecciones (orders y client_orders)
      const updatesWithPath: any = {};
      Object.keys(updates).forEach(key => {
        updatesWithPath[`orders/${orderId}/${key}`] = updates[key];
        updatesWithPath[`client_orders/${orderId}/${key}`] = updates[key];  // TAMBIÉN EN CLIENT_ORDERS
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
      
      // Obtener el pedido para verificar si es MOTORCYCLE_TAXI
      const orderRef = ref(database, `orders/${orderId}`);
      const orderSnapshot = await get(orderRef);
      const order = orderSnapshot.val();
      
      // Mapeo de estados para MOTORCYCLE_TAXI
      const statusMapping: { [key: string]: string } = {
        // Flujo comida → Flujo motocicleta (taxi)
        'ON_THE_WAY_TO_STORE': 'ON_THE_WAY_TO_PICKUP',      // En camino al restaurante → En camino por ti
        'ARRIVED_AT_STORE': 'ARRIVED_AT_PICKUP',            // Llegué al restaurante → Repartidor llegó
        'ORDER_READY': 'ON_THE_WAY_TO_DESTINATION',         // Con alimentos → En camino al destino
        'ON_THE_WAY_TO_CUSTOMER': 'ON_THE_WAY_TO_DESTINATION', // En camino al cliente → En camino al destino
        'DELIVERED': 'DELIVERED'                             // Pedido entregado → Viaje completado
      };
      
      // Si es motocicleta, convertir el estado
      let finalStatus = newStatus;
      if (order?.serviceType === 'MOTORCYCLE_TAXI' && statusMapping[newStatus]) {
        console.log('🏍️ [MOTOCICLETA] Convirtiendo estado:', newStatus, '→', statusMapping[newStatus]);
        finalStatus = statusMapping[newStatus];
      }
      
      // Actualizar el estado del pedido en Firebase (AMBAS colecciones)
      const updates: any = {};
      updates[`orders/${orderId}/status`] = finalStatus;
      updates[`client_orders/${orderId}/status`] = finalStatus;  // ACTUALIZAR TAMBIÉN CLIENT_ORDERS
      
      // Si el nuevo estado es DELIVERED, registrar el momento de entrega
      if (finalStatus === 'DELIVERED') {
        updates[`orders/${orderId}/deliveredAt`] = Date.now();
        updates[`client_orders/${orderId}/deliveredAt`] = Date.now();  // TAMBIÉN EN CLIENT_ORDERS
        // Agregar fecha y hora formateada de entrega
        const deliveredDateTimeString = new Date().toLocaleString();
        updates[`orders/${orderId}/deliveredDateTime`] = deliveredDateTimeString;
        updates[`client_orders/${orderId}/deliveredDateTime`] = deliveredDateTimeString;  // TAMBIÉN EN CLIENT_ORDERS
      }
      
      await firebaseUpdate(ref(database), updates);
      
      console.log('✅ Estado actualizado:', finalStatus);
      
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
          // o que aún no tienen un repartidor asignado pero están en estado MANUAL_ASSIGNED o ASSIGNABLE
          if (
            order.assignedToDeliveryId === deliveryId ||
            ((order.status === 'MANUAL_ASSIGNED' || order.status === 'ASSIGNED' || order.status === 'PENDING') && !order.assignedToDeliveryId)
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
              deliveredAt: order.deliveredAt || null,
              orderType: order.orderType // Leer el tipo de pedido (puede ser undefined para pedidos antiguos)
            };
            
            ordersArray.push(orderObj);
          }
        }

        // Filtrar solo pedidos activos (no completados) excepto si están asignados a este repartidor
        const activeOrders = ordersArray.filter(order => 
          order.status !== OrderStatus.DELIVERED || order.assignedToDeliveryId === deliveryId
        ).sort((a, b) => b.createdAt - a.createdAt); // Ordenar por fecha descendente
        
        // Detectar nuevos pedidos asignados y reproducir sonido
        const newOrders = activeOrders.filter(newOrder => 
          !this.previousOrders.some(prevOrder => prevOrder.id === newOrder.id)
        );
        
        if (newOrders.length > 0) {
          // Hay nuevos pedidos asignados, disparar evento personalizado para notificación
          console.log('🔔 [ORDER SERVICE] Nuevo pedido detectado:', newOrders.length);
          window.dispatchEvent(new CustomEvent('new-order-detected', { 
            detail: { count: newOrders.length } 
          }));
        }
        
        // Actualizar la lista de pedidos anteriores
        this.previousOrders = [...activeOrders];
        
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

  // Método para escuchar pedidos aceptados por un repartidor en tiempo real
  listenToAcceptedOrders(deliveryId: string, callback: (orders: Order[]) => void) {
    const ordersRef = ref(database, 'orders');
    
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const allOrders = snapshot.val();
        const acceptedOrders: Order[] = [];
        
        for (const orderId in allOrders) {
          const order = allOrders[orderId];
          
          // Filtrar pedidos asignados a este repartidor y que NO estén entregados/cancelados
          if (order.assignedToDeliveryId === deliveryId &&
              order.status !== OrderStatus.DELIVERED &&
              order.status !== OrderStatus.CANCELLED) {
            
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
              restaurantMapUrl: order.restaurantMapUrl || '',
              orderType: order.orderType
            };
            
            acceptedOrders.push(orderObj);
          }
        }
        
        acceptedOrders.sort((a, b) => b.createdAt - a.createdAt);
        callback(acceptedOrders);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error escuchando pedidos aceptados:', error);
      callback([]);
    });
    
    return unsubscribe;
  }
}

export default new OrderService();