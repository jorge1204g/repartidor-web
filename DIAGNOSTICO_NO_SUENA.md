# 🐛 DIAGNÓSTICO: Por qué NO suena la app del repartidor

## 🔍 PROBLEMAS ENCONTRADOS EN EL CÓDIGO

### ✅ El código está CORRECTO (pero puede fallar por...)

Revisé exhaustivamente el código y **la lógica está bien implementada**. El sonido DEBERÍA funcionar porque:

1. ✅ `SoundNotificationService` existe y está bien implementado
2. ✅ `applicationContext` se guarda correctamente (línea 279)
3. ✅ `observeAssignedOrdersWithContext()` llama al servicio de sonido (líneas 682-689)
4. ✅ El método se inicializa en `initialize()` (línea 283)

---

## 🚨 POSIBLES CAUSAS DEL PROBLEMA

### Causa 1: **Los logs NO muestran "PEDIDO NUEVO DETECTADO"**

Si en LogCat NO ves este mensaje:
```
🔔 ¡PEDIDO NUEVO DETECTADO! Repartidor: [id-del-repartidor]
```

Entonces el problema es que **NO está entrando al `if (newAssignedOrders.isNotEmpty())`**

Esto significa que:
- ❌ O no llegan pedidos nuevos
- ❌ O el filtro no los está detectando como "nuevos"

---

### Causa 2: **Filtro demasiado restrictivo** (Línea 656-660)

```kotlin
val newAssignedOrders = activeOrders.filter { order ->
    (order.status in listOf("ASSIGNED", "MANUAL_ASSIGNED", "ACCEPTED") || 
     order.orderType == "MANUAL" || order.orderType == "RESTAURANT") &&
    order.assignedToDeliveryId == deliveryId &&
    previousOrders.none { it.id == order.id }
}
```

**Problemas potenciales:**

#### A. El estado del pedido NO está en la lista
Estados que SÍ detecta:
- ✅ `ASSIGNED`
- ✅ `MANUAL_ASSIGNED`
- ✅ `ACCEPTED`

Estados que NO detecta:
- ❌ `PENDING` (a menos que orderType sea MANUAL o RESTAURANT)
- ❌ `ON_THE_WAY_TO_STORE`
- ❌ `ARRIVED_AT_STORE`
- ❌ etc.

#### B. `assignedToDeliveryId` no coincide con el ID del repartidor
Si el pedido tiene:
- `assignedToDeliveryId = ""` (vacío) → NO lo detecta
- `assignedToDeliveryId = "otro-id"` → NO lo detecta
- `assignedToDeliveryId = "id-del-repartidor"` → ✅ SÍ lo detecta

#### C. El pedido YA estaba en `previousOrders`
Si el mismo ID ya existía antes → NO lo considera nuevo

---

### Causa 3: **El repositorio NO devuelve los pedidos esperados** (OrderRepository.kt líneas 18-39)

El repositorio filtra los pedidos así:

```kotlin
// Pedidos asignados al repartidor
val isAssignedToDelivery = order.assignedToDeliveryId == deliveryId && 
    order.status in listOf("ASSIGNED", "ACCEPTED", "ON_THE_WAY_TO_STORE", 
                           "ARRIVED_AT_STORE", "PICKING_UP_ORDER", 
                           "ON_THE_WAY_TO_CUSTOMER", "DELIVERED")

// Pedidos manuales disponibles
val isManualAvailable = order.status == "MANUAL_ASSIGNED" && 
    order.assignedToDeliveryId.isEmpty() &&
    (order.candidateDeliveryIds.isEmpty() || deliveryId in order.candidateDeliveryIds)

// Pedidos del restaurante disponibles
val isRestaurantAvailable = order.status in listOf("PENDING", "ASSIGNED") &&
    order.assignedToDeliveryId.isEmpty() &&
    (order.candidateDeliveryIds.isEmpty() || deliveryId in order.candidateDeliveryIds)
```

**Posibles problemas:**

1. ❌ El pedido tiene `assignedToDeliveryId` vacío pero NO está en `candidateDeliveryIds`
2. ❌ El estado es `PENDING` pero NO es de tipo restaurante
3. ❌ El Firebase NO está actualizando en tiempo real

---

### Causa 4: **MediaPlayer falla silenciosamente**

Aunque entre al `if`, el MediaPlayer puede fallar por:

```kotlin
// Línea 25 - SoundNotificationService.kt
val soundUri = try {
    Uri.parse("android.resource://${context.packageName}/${com.example.repartidor.R.raw.new_order_notification}")
} catch (e: Exception) {
    // Si falla, usa tono del sistema
    android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION)
}
```

**Posibles fallos:**

1. ❌ El archivo `new_order_notification.mp3` NO existe en `res/raw`
2. ❌ El nombre del archivo tiene errores (mayúsculas, espacios, etc.)
3. ❌ El archivo está corrupto o no es MP3 válido
4. ❌ `MediaPlayer.create()` falla pero no lanza excepción

---

## 📋 CHECKLIST DE DIAGNÓSTICO

### Paso 1: Verificar Logs en LogCat

Abre Android Studio > LogCat y filtra por:
```
SoundNotification
```

**Busca estos logs en orden:**

```
✅ Deberías ver:
🔔 SoundNotificationService initialized with context
[Al crear un pedido]:
🔔 ¡PEDIDO NUEVO DETECTADO! Repartidor: [tu-id]
   📦 Pedido ID: [pedido-id], Status: [status], OrderType: [type]
   Cliente: [nombre]
   Restaurante: [nombre]
   Total pedidos nuevos: [cantidad]
🔊 Reproduciendo sonido de notificación...
[Si funciona]:
🔊 Reproduciendo sonido de pedido nuevo (desde SoundNotificationService)
✅ Sonido completado
🔇 Recursos liberados

❌ Si NO funciona, podrías ver:
⚠️ Sonido personalizado no encontrado, usando tono del sistema
o
❌ Error al reproducir sonido: [mensaje de error]
```

---

### Paso 2: Verificar Archivo de Audio

```powershell
# Ejecuta en PowerShell
Test-Path "c:\1234\Nueva carpeta (22)\apl\Prueba New\app-repartidor\src\main\res\raw\new_order_notification.mp3"

# Debe retornar: True

# Verificar tamaño
Get-ChildItem "c:\1234\Nueva carpeta (22)\apl\Prueba New\app-repartidor\src\main\res\raw\" | 
  Select-Object Name, Length
```

**Resultado esperado:**
- ✅ `True` en Test-Path
- ✅ Tamaño entre 50 KB - 200 KB
- ✅ Nombre exacto: `new_order_notification.mp3`

---

### Paso 3: Verificar Estados de los Pedidos en Firebase

Entra a Firebase Console > Realtime Database y verifica:

```json
{
  "orders": {
    "pedido-123": {
      "status": "ASSIGNED",  // ✅ Este estado SÍ se detecta
      "assignedToDeliveryId": "tu-id-de-repartidor",  // ✅ Debe coincidir
      "customer": { ... },
      "restaurantName": "..."
    }
  }
}
```

**Estados que SÍ se detectan:**
- ✅ `ASSIGNED`
- ✅ `MANUAL_ASSIGNED`
- ✅ `ACCEPTED`

**Estados que NO se detectan inicialmente:**
- ❌ `PENDING` (a menos que sea orderType MANUAL/RESTAURANT)
- ❌ `ON_THE_WAY_TO_STORE` (ya fue asignado antes)
- ❌ `DELIVERED` (está filtrado)

---

### Paso 4: Agregar Logs Extra para Debug

Modifica temporalmente el código para agregar MÁS logs:

```kotlin
// En DeliveryViewModel.kt - línea 649
orderRepository.observeAssignedOrders(deliveryId).collect { newOrders ->
    println("🔍 [DEBUG] Total de pedidos recibidos del repositorio: ${newOrders.size}")
    
    val activeOrders = newOrders.filter { order ->
        val isActive = order.status != "DELIVERED"
        println("   📋 Pedido ${order.id}: Status=${order.status}, Activo=$isActive")
        isActive
    }
    
    println("🔍 [DEBUG] Pedidos activos después de filtrar: ${activeOrders.size}")
    
    val newAssignedOrders = activeOrders.filter { order ->
        val statusOk = order.status in listOf("ASSIGNED", "MANUAL_ASSIGNED", "ACCEPTED") || 
                      order.orderType == "MANUAL" || order.orderType == "RESTAURANT"
        val assignedOk = order.assignedToDeliveryId == deliveryId
        val isNew = previousOrders.none { it.id == order.id }
        
        println("   🔍 Pedido ${order.id}: StatusOK=$statusOk, AssignedOK=$assignedOk, IsNew=$isNew")
        
        statusOk && assignedOk && isNew
    }
    
    println("🔍 [DEBUG] Pedidos NUEVOS detectados: ${newAssignedOrders.size}")
    
    if (newAssignedOrders.isNotEmpty()) {
        println("🔔 ¡PEDIDO NUEVO DETECTADO!")
        // ... resto del código
    }
}
```

---

## 🔧 SOLUCIONES RÁPIDAS

### Solución 1: **Ampliar los estados detectados**

Si los pedidos llegan con otros estados, amplía el filtro:

```kotlin
// Línea 656-660 - Ampliar estados
val newAssignedOrders = activeOrders.filter { order ->
    // AGREGAR MÁS ESTADOS SEGÚN NECESIDAD
    (order.status in listOf(
        "ASSIGNED", 
        "MANUAL_ASSIGNED", 
        "ACCEPTED",
        "PENDING",              // ← Agregar si llega con este estado
        "ON_THE_WAY_TO_STORE",  // ← Agregar si quieres detectar cambios
        "ARRIVED_AT_STORE",     // ← Agregar si quieres detectar cambios
        "PICKING_UP_ORDER",     // ← Agregar si quieres detectar cambios
        "ON_THE_WAY_TO_CUSTOMER" // ← Agregar si quieres detectar cambios
    ) || order.orderType == "MANUAL" || order.orderType == "RESTAURANT") &&
    order.assignedToDeliveryId == deliveryId &&
    previousOrders.none { it.id == order.id }
}
```

---

### Solución 2: **Detectar TODOS los pedidos asignados (sin importar estado)**

```kotlin
val newAssignedOrders = activeOrders.filter { order ->
    // Solo verificar que esté asignado y sea nuevo
    order.assignedToDeliveryId == deliveryId &&
    previousOrders.none { it.id == order.id }
}
```

---

### Solución 3: **Forzar detección aunque el pedido tenga assignedToDeliveryId vacío**

```kotlin
val newAssignedOrders = activeOrders.filter { order ->
    // Verificar si está asignado O si está disponible y debería tomarlo
    val isAssigned = order.assignedToDeliveryId == deliveryId || 
                    order.assignedToDeliveryId.isEmpty()
    
    val statusOk = order.status in listOf("ASSIGNED", "MANUAL_ASSIGNED", "ACCEPTED") || 
                  order.orderType == "MANUAL" || order.orderType == "RESTAURANT"
    
    val isNew = previousOrders.none { it.id == order.id }
    
    isAssigned && statusOk && isNew
}
```

---

### Solución 4: **Verificar que el audio funcione manualmente**

Agrega un botón o comando para probar el sonido manualmente:

```kotlin
// En MainActivity.kt o donde puedas触发
fun testSound() {
    applicationContext?.let { ctx ->
        SoundNotificationService.playNewOrderSound(ctx)
        println("🔊 [TEST] Probando sonido manualmente...")
    }
}
```

---

## 🎯 PRUEBA DEFINITIVA

### Test Completo:

1. **Compilar con logs extra** (Solución arriba)
2. **Instalar en dispositivo**
3. **Abrir LogCat** y monitorear
4. **Crear pedido desde cliente-web** con estado `ASSIGNED`
5. **Verificar en LogCat**:

```
🔍 [DEBUG] Total de pedidos recibidos: 1
   📋 Pedido abc123: Status=ASSIGNED, Activo=true
🔍 [DEBUG] Pedidos activos: 1
   🔍 Pedido abc123: StatusOK=true, AssignedOK=true, IsNew=true
🔍 [DEBUG] Pedidos NUEVOS detectados: 1
🔔 ¡PEDIDO NUEVO DETECTADO! Repartidor: tu-id
🔊 Reproduciendo sonido...
🔊 Reproduciendo sonido de pedido nuevo
✅ Sonido completado
```

---

## 📊 RESUMEN DE DIAGNÓSTICO

| Síntoma | Causa Probable | Solución |
|---------|---------------|----------|
| No hay logs de "PEDIDO NUEVO" | El repositorio no devuelve pedidos | Verificar Firebase y filtros del repositorio |
| Hay logs pero no entra al if | Filtro muy restrictivo | Ampliar estados (Solución 1) |
| Entra al if pero no suena | MediaPlayer falla | Verificar archivo de audio |
| Suena tono del sistema | Archivo no encontrado | Verificar ruta y nombre del archivo |
| Logs dicen "Error al reproducir" | Excepción en MediaPlayer | Revisar LogCat completo |

---

## 🚀 ACCIÓN INMEDIATA

### Lo que debes hacer AHORA:

1. **Abre LogCat en Android Studio**
2. **Filtra por "SoundNotification"**
3. **Crea un pedido de prueba**
4. **Copia y pega TODOS los logs aquí**

Con esos logs podré decirte EXACTAMENTE dónde está el problema.

---

**Fecha**: Martes, 24 de Marzo de 2026  
**Estado**: 🔍 Esperando logs para diagnóstico preciso  
**Urgencia**: ⚠️ Alta
