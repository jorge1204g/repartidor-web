# Leer el archivo OrderService.ts
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\services\OrderService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Agregar método listenToAcceptedOrders antes del cierre de la clase
old_close = """  }
}

export default new OrderService();"""

new_close = """  }

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

export default new OrderService();"""

content = content.replace(old_close, new_close)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\services\OrderService.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Método listenToAcceptedOrders agregado al OrderService")
