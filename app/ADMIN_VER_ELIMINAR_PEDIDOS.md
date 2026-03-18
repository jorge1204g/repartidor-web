# 📋 ADMINISTRADOR: VER Y ELIMINAR PEDIDOS DEL CLIENTE

## ✅ LOS PEDIDOS DEL CLIENTE YA SE VEN EN EL ADMIN

Los pedidos creados desde la app del cliente (`cliente-web`) **YA SE GUARDAN** en la ruta `/orders/` de Firebase, que es la misma que usa el administrador.

---

## 🔍 ¿DÓNDE VERLOS EN LA APP DEL ADMIN?

### En tu Android:

1. Abre la app del administrador
2. Ve a la pestaña **"Pedidos"**
3. Verás TODOS los pedidos:
   - ✅ Pedidos manuales (creados por admin)
   - ✅ Pedidos de restaurantes
   - ✅ **Pedidos de clientes** ← ¡Están aquí!

---

## 📊 CÓMO IDENTIFICAR LOS PEDIDOS DEL CLIENTE

Los pedidos del cliente tienen:

```kotlin
orderType: "CLIENT"  // ← Esta es la clave
```

En la tarjeta del pedido verás:
- **Cliente:** Nombre del cliente
- **Teléfono:** Teléfono del cliente
- **Dirección:** Dirección de entrega
- **Ganancia:** $0.00 (o el deliveryCost si lo pusiste)
- **Total:** $0.00 (o el total si lo pusiste)

---

## 🗑️ CÓMO ELIMINAR PEDIDOS DESDE EL ADMIN

La app del admin **YA TIENE** dos botones para cada pedido:

### Botón 1: "Cancelar" (Ámbar)
- Cambia el estado a `CANCELLED`
- El pedido sigue en la base de datos
- Pero ya no está activo

### Botón 2: "Eliminar" (Rojo)
- **ELIMINA PERMANENTEMENTE** el pedido de Firebase
- Lo borra de `/orders/`
- **¡Cuidado!** No se puede deshacer

---

## 🎯 PASOS PARA ELIMINAR UN PEDIDO:

1. **Abre la app del admin**
2. **Busca el pedido** que quieres eliminar
3. **Haz clic en "Eliminar"** (botón rojo)
4. **Confirma** en el diálogo que aparece
5. **¡Listo!** El pedido desaparece

---

## 🔍 SI NO VES LOS PEDIDOS DEL CLIENTE:

### Posible Problema 1: Estructura incorrecta

Si los pedidos no tienen la estructura completa, el admin podría tener problemas para mostrarlos.

**Solución:** Verifica en Firebase Console que el pedido tenga:

```json
{
  "id": "...",
  "orderId": "...",
  "orderType": "CLIENT",
  "status": "PENDING",
  "customer": {
    "name": "Juan Pérez",
    "phone": "492 123 4567",
    "address": "Calle Principal #123"
  },
  "items": [...],
  "deliveryCost": 0,
  "total": 0,
  ...todos los campos
}
```

---

### Posible Problema 2: Filtro en el admin

Si el admin tiene algún filtro activo.

**Solución:** Revisa que no haya filtros aplicados en la app del admin.

---

## 🧪 PRUEBA AHORA:

### Paso 1: Crea un Pedido (Cliente Web)

```bash
# En cliente-web
http://localhost:3004/crear-pedido
```

Llena los datos y crea el pedido.

---

### Paso 2: Verifica en Firebase

```
https://console.firebase.google.com/project/myappdelivery-4a576/database
```

Busca en `/orders/{ultimo_pedido}` y verifica que tenga todos los campos.

---

### Paso 3: Abre la App del Admin (Android)

Deberías ver el pedido en la lista de "Pedidos Activos".

---

### Paso 4: Elimina el Pedido

Haz clic en **"Eliminar"** (botón rojo) y confirma.

---

## 💡 TIPS:

### Tip 1: Usa "Cancelar" en lugar de "Eliminar"

- **Cancelar:** Mantiene el registro histórico
- **Eliminar:** Borra completamente

Para producción, es mejor **cancelar** que eliminar.

---

### Tip 2: Filtra por orderType

Si quieres ver solo pedidos del cliente, puedes agregar un filtro visual en el admin:

```kotlin
// En OrdersMainScreen.kt
val clientOrders = orders.filter { it.orderType == "CLIENT" }
```

---

### Tip 3: Agrega un badge de tipo

Puedes mostrar un ícono o etiqueta según el tipo:

```kotlin
when (order.orderType) {
    "CLIENT" -> Text("🛒 Cliente")
    "MANUAL" -> Text("✋ Manual")
    "RESTAURANT" -> Text("🍽️ Restaurante")
}
```

---

## 📝 RESUMEN:

| Acción | ¿Dónde? | ¿Cómo? |
|--------|---------|--------|
| **Ver pedidos** | Admin → Pestaña "Pedidos" | Automático, aparecen todos |
| **Identificar cliente** | Busca `orderType: "CLIENT"` | O por datos del customer |
| **Cancelar pedido** | Botón ámbar "Cancelar" | Cambia status a CANCELLED |
| **Eliminar pedido** | Botón rojo "Eliminar" | Borra permanentemente |

---

## ⚠️ IMPORTANTE:

El botón **"Eliminar"** ya existe en la app del admin (Android). Está en la tarjeta de cada pedido, junto al botón "Cancelar".

Si NO lo ves:
1. Actualiza la app del admin
2. Revisa que el pedido no esté ya entregado o cancelado
3. Verifica que tengas permisos de administrador

---

## 🚀 FLUJO COMPLETO:

```
Cliente crea pedido (cliente-web)
         ↓
Se guarda en /orders/ con orderType: "CLIENT"
         ↓
Admin ve el pedido en su app (Android)
         ↓
Admin puede:
  - Cancelar (cambia status)
  - Eliminar (borra de Firebase)
  - Asignar repartidor
  - Ver detalles
```

---

**Fecha:** Marzo 6, 2026  
**Estado:** ✅ Funcionalidad ya existe  
**Prueba estimada:** 2 minutos

---

## ✨ ¡LISTO!

**Todo ya funciona:**
- ✅ Pedidos del cliente se ven en el admin
- ✅ Admin puede eliminar pedidos
- ✅ Admin puede cancelar pedidos
- ✅ Admin puede asignar repartidores

**¡Solo úsalo!**
