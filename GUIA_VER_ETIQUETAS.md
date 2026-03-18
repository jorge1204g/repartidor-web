# 📋 GUÍA PASO A PASO - Ver Etiquetas de Pedidos

## ⚠️ IMPORTANTE LEER PRIMERO

Los cambios **SÍ están aplicados en el código**, pero necesitas seguir estos pasos para verlos:

---

## 🔹 PASO 1: Refrescar el Navegador (Limpieza de Caché)

### En la App del Repartidor:
1. Abre la app del repartidor en tu navegador
2. Presiona las teclas al mismo tiempo:
   - **Windows/Linux:** `Ctrl + Shift + R` o `Ctrl + F5`
   - **Mac:** `Cmd + Shift + R`
3. Esto forzará al navegador a cargar la versión más reciente del código

---

## 🔹 PASO 2: Crear un Pedido DE VERDAD desde la App del Restaurante

### En la App del Restaurante:
1. Abre la app del restaurante: http://localhost:5173 (o tu puerto)
2. Inicia sesión si es necesario
3. Ve a **"Crear Pedido"** o **"Pedidos"**
4. Llena TODOS los datos del formulario:
   - Nombre del cliente
   - Dirección del cliente
   - Teléfono
   - Monto en el restaurante (ej: 150)
   - Costo de envío (ej: 35)
   - Método de pago
5. **IMPORTANTE:** No uses el botón de "Simular" - crea un pedido REAL
6. Haz clic en **"Crear Pedido"**
7. Deberías ver un mensaje de éxito con el ID del pedido

---

## 🔹 PASO 3: Verificar en la App del Repartidor

### Regresa a la App del Repartidor:
1. Ve a la app del repartidor: http://localhost:5174 (o tu puerto)
2. Si es necesario, refresca nuevamente con `Ctrl + Shift + R`
3. Busca el pedido que acabas de crear
4. **DEBERÍAS VER ESTO:**

```
┌─────────────────────────────────────────────────────┐
│  Pedido #[ID_DEL_PEDIDO]    [🍽️ Restaurante] [Pendiente] │
├─────────────────────────────────────────────────────┤
│  (borde gris separando)                             │
│                                                     │
│  Restaurante: [Nombre del Restaurante]              │
│  Método de Pago: Efectivo                           │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

---

## 🔹 ¿Aún No Ves las Etiquetas?

### Opción A: Ejecutar Script de Actualización

Este script actualizará TODOS los pedidos existentes en Firebase:

#### Desde la Consola del Navegador:

1. **Abre la app del restaurante** en tu navegador
2. **Presiona F12** para abrir las herramientas de desarrollador
3. Ve a la pestaña **"Console"** o **"Consola"**
4. **Copia y pega** TODO el siguiente código de una sola vez:

```javascript
async function actualizarOrderTypePedidos() {
  console.log('🔄 Iniciando actualización de orderType en pedidos...');
  
  const firebase = window.firebase;
  if (!firebase) {
    console.error('❌ Firebase no está disponible. Asegúrate de estar en una página con Firebase inicializado.');
    return;
  }
  
  const { database, ref, get, update } = firebase;
  
  try {
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
      
      if (!order.orderType) {
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
    alert(`✅ Actualización completada\n📊 ${actualizados} pedidos actualizados, ${errores} errores`);
    
  } catch (error) {
    console.error('❌ Error general:', error);
    alert('❌ Error al actualizar: ' + error.message);
  }
}

// Ejecutar la función
actualizarOrderTypePedidos();
```

5. Presiona **Enter**
6. Espera a que termine (verás mensajes en la consola)
7. Deberías ver una alerta confirmando la actualización
8. **Refresca la app del repartidor** con `Ctrl + Shift + R`
9. ¡Ahora deberías ver las etiquetas en TODOS los pedidos!

---

## 🔹 Diagnóstico de Problemas

### ❌ "No veo las etiquetas ni siquiera después de crear un pedido nuevo"

**Verifica esto:**

1. **¿El pedido se creó DESPUÉS de los cambios?**
   - Los pedidos creados ANTES NO tendrán la etiqueta
   - Solo los pedidos nuevos tendrán `orderType: 'RESTAURANT'`

2. **¿Refrescaste el navegador correctamente?**
   - Usa `Ctrl + Shift + R` (no solo F5)
   - Esto limpia el caché

3. **¿Estás viendo el pedido correcto?**
   - Busca el ID del pedido que aparece en el mensaje de éxito
   - Compara con los IDs en la lista del repartidor

4. **¿Hay errores en la consola?**
   - Abre F12 en la app del repartidor
   - Ve a la pestaña "Console"
   - Busca mensajes en rojo

### ❌ "Las etiquetas se ven pero todas dicen 'Manual'"

Esto significa que:
- ✅ El código SÍ está funcionando
- ❌ Pero los pedidos son antiguos (no tienen `orderType`)
- 👉 **Ejecuta el script de actualización** (Opción A arriba)

### ❌ "Veo errores en la consola"

Copia el error completo y envíamelo para ayudarte.

---

## 🔹 Verificación Manual en Firebase (Opcional)

Si quieres verificar directamente en Firebase:

1. Ve a Firebase Console: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Ve a **Firestore Database** o **Realtime Database**
4. Navega a `orders`
5. Busca un pedido reciente
6. Deberías ver el campo `orderType: "RESTAURANT"`

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir TODOS estos pasos aún no ves las etiquetas:

1. Abre la consola del navegador (F12) en la app del repartidor
2. Toma una captura de pantalla
3. Envíame:
   - La captura de pantalla
   - El ID de un pedido que creaste recientemente
   - Cualquier error que veas en la consola

---

**Fecha de creación:** Marzo 2026
**Versión:** 1.0
