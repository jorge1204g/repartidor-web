// Script para actualizar pedidos existentes y agregarles el campo orderType
// Ejecutar desde la consola del navegador en la app del repartidor o restaurante

async function actualizarOrderTypePedidos() {
  console.log('🔄 Iniciando actualización de orderType en pedidos...');
  
  // Importar Firebase (asegúrate de estar en una página que ya tenga Firebase inicializado)
  const { database, ref, get, update } = window.firebase;
  
  try {
    // Obtener todos los pedidos
    const ordersRef = ref(database, 'orders');
    const snapshot = await get(ordersRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No hay pedidos en la base de datos');
      return;
    }
    
    const orders = snapshot.val();
    let actualizados = 0;
    let errores = 0;
    
    console.log(`📦 Encontrados ${Object.keys(orders).length} pedidos`);
    
    for (const orderId in orders) {
      const order = orders[orderId];
      
      // Solo actualizar si no tiene orderType
      if (!order.orderType) {
        // Determinar si es del restaurante o manual basado en otros campos
        // Los pedidos del restaurante usualmente tienen restaurantId
        const orderType = order.restaurantId ? 'RESTAURANT' : 'MANUAL';
        
        try {
          const updates = {};
          updates[`orders/${orderId}/orderType`] = orderType;
          
          await update(ref(database), updates);
          console.log(`✅ Pedido ${orderId} actualizado a ${orderType}`);
          actualizados++;
        } catch (error) {
          console.error(`❌ Error actualizando pedido ${orderId}:`, error);
          errores++;
        }
      } else {
        console.log(`⏭️  Pedido ${orderId} ya tiene orderType: ${order.orderType}`);
      }
    }
    
    console.log('✅ Actualización completada');
    console.log(`📊 Resumen: ${actualizados} actualizados, ${errores} errores`);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la actualización
actualizarOrderTypePedidos();
