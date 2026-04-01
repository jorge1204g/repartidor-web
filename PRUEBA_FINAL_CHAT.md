# 🧪 GUÍA DE PRUEBA FINAL - CHAT BIDIRECCIONAL

## ✅ Cambios Realizados

### App Móvil del Repartidor:
1. ✅ Usa `phone_XXXX` como identificador del cliente
2. ✅ Filtra mensajes por `phone_XXXX`
3. ✅ Envía mensajes con `receiverId = phone_XXXX`

### App Web del Cliente:
1. ✅ Obtiene teléfono del cliente con `getClientPhone()`
2. ✅ Usa `phone_XXXX` como `currentUserId`
3. ✅ Escucha mensajes filtrando por `phone_XXXX`

---

## 📋 Instrucciones de Prueba

### **Paso 1: Compilar Apps**

#### App Móvil (Android Studio):
```
Build > Build Bundle(s) / APK(s) > Build APK(s)
Esperar compilación exitosa
Instalar en dispositivo/emulador
```

#### App Cliente (Vercel o Local):
```bash
cd cliente-web
npm run build
vercel --prod --yes

# O para pruebas locales:
npm run dev
```

---

### **Paso 2: Verificar Datos del Cliente**

**En la app del cliente:**
1. Iniciar sesión como cliente
2. Abrir DevTools (F12)
3. Ir a pestaña "Console"
4. Recargar página (F5)

**Deberías ver:**
```
🔍 [DEBUG] Datos del cliente:
   ├── clientId: -abc123xyz          (ID de Firebase)
   └── clientName: Jorge Garcia       (Nombre)
   └── clientPhone: 4931250144        (Teléfono)
   └── currentUserId establecido a: phone_4931250144  ✅
```

**✅ Verificar**: `currentUserId` debe ser `phone_4931250144`

---

### **Paso 3: Probar Mensaje Repartidor → Cliente**

#### Desde App Móvil del Repartidor:

1. **Abrir app del repartidor**
2. **Ir a pestaña "Clientes"**
3. **Tocar cliente "Jorge Garcia"** (debería mostrar Pedido: 1774680785125)
4. **Enviar mensaje**: "PRUEBA 123"

**Verificar Logcat (Android Studio):**
```
🔍 [DEBUG] Enviando mensaje:
   ├── deliveryPerson.id: -OmqqZ4HbDDkEzijIc2D
   ├── deliveryPerson.name: Jose L
   ├── clientName (phone_): phone_4931250144
   └── orderId: 1774680785125

💾 [DEBUG] Guardando mensaje en Firebase:
   ├── senderId: -OmqqZ4HbDDkEzijIc2D
   ├── senderName: Jose L
   ├── receiverId: phone_4931250144    ← ¡DEBE DECIR ESTO!
   ├── receiverName: phone_4931250144
   └── message: PRUEBA 123

✅ [DEBUG] Mensaje guardado exitosamente
```

---

#### En App Web del Cliente:

**Inmediatamente después de enviar desde el repartidor:**

**Consola del navegador debería mostrar:**
```
🔍 [listenMessages] userId1: phone_4931250144 userId2: -OmqqZ4HbDDkEzijIc2D
═══════════════════════════════════════════════
📦 Total mensajes en Firebase: X

📨 Mensaje revisando:
   ID: -xyz789
   senderId: -OmqqZ4HbDDkEzijIc2D
   receiverId: phone_4931250144         ← ¡DEBE COINCIDIR!
   message: PRUEBA 123
   ¿Coincide? ✅ SÍ
   Comparación:
     - (senderId === userId1): false
     - (receiverId === userId2): true   ✅
     - (senderId === userId2): true     ✅
     - (receiverId === userId1): false

✅ [MATCH] Mensaje que coincide:
   ├── senderId: -OmqqZ4HbDDkEzijIc2D
   ├── receiverId: phone_4931250144
   └── message: PRUEBA 123

📊 [RESULTADO] Mensajes filtrados: 1
═══════════════════════════════════════════════
```

**UI del cliente debería mostrar:**
```
💬 Chat con tu Repartidor
🚚 Jose L

[Hora actual]
PRUEBA 123                    ← ¡DEBE APARECER!
```

---

### **Paso 4: Probar Mensaje Cliente → Repartidor**

#### Desde App Web del Cliente:

1. **Escribir mensaje**: "RESPUESTA 456"
2. **Click en enviar**

**Consola del navegador:**
```
Enviando mensaje de: phone_4931250144 a: -OmqqZ4HbDDkEzijIc2D
```

---

#### En App Móvil del Repartidor:

**Consola/Logcat debería mostrar:**
```
🔍 [DEBUG] Recibiendo mensaje...
💾 [DEBUG] Mensaje recibido en Firebase
   ├── senderId: phone_4931250144
   ├── receiverId: -OmqqZ4HbDDkEzijIc2D
   └── message: RESPUESTA 456

✅ Mensaje incluido en chatMessages
```

**UI del repartidor debería mostrar:**
```
Chats con Clientes
Jorge Garcia
Pedido: 1774680785125

[Hora actual]
RESPUESTA 456              ← ¡DEBE APARECER!
```

---

### **Paso 5: Conversación Completa**

**Intercambiar 5-10 mensajes en ambos sentidos:**

**Verificar en AMBAS apps:**
- ✅ Todos los mensajes aparecen
- ✅ Orden cronológico correcto
- ✅ Nombres de remitentes correctos
- ✅ Timestamps correctos
- ✅ Sin mensajes duplicados
- ✅ Sin mensajes perdidos

---

## 🎯 Criterios de Éxito

### ✅ **PRUEBA EXITOSA** si:

1. **Repartidor → Cliente funciona:**
   - ✅ Mensaje enviado desde móvil
   - ✅ Aparece INMEDIATAMENTE en web del cliente
   - ✅ Logs muestran `receiverId: phone_4931250144`
   - ✅ Filtro encuentra coincidencia

2. **Cliente → Repartidor funciona:**
   - ✅ Mensaje enviado desde web
   - ✅ Aparece INMEDIATAMENTE en móvil
   - ✅ Logs muestran `senderId: phone_4931250144`
   - ✅ Filtro encuentra coincidencia

3. **Bidireccional completo:**
   - ✅ Pueden conversar libremente
   - ✅ Mensajes en tiempo real
   - ✅ Sin retrasos significativos (< 2 segundos)

---

## ❌ Solución de Problemas

### **Problema A: Mensajes NO llegan al cliente**

**Síntoma**: Repartidor envía pero cliente no recibe

**Verificar en consola del cliente:**
```
🔍 [listenMessages] userId1: ??? userId2: ???
```

**Posibles causas:**

1. **`userId1` NO es `phone_4931250144`:**
   ```
   ❌ userId1: -abc123xyz     (ID de Firebase)
   ✅ userId1: phone_4931250144  (Teléfono)
   ```
   **Solución**: Verificar que `ChatPage.tsx` usa `phone_XXXX`

2. **`receiverId` en Firebase NO es `phone_4931250144`:**
   ```
   ❌ receiverId: "Jorge Garcia"
   ✅ receiverId: phone_4931250144
   ```
   **Solución**: Verificar logs del repartidor al enviar

---

### **Problema B: Mensajes NO llegan al repartidor**

**síntoma**: Cliente envía pero repartidor no recibe

**Verificar en Logcat del repartidor:**
```
🔍 [DEBUG] Recibiendo mensaje...
```

**Posibles causas:**

1. **`clientName` NO es `phone_4931250144`:**
   ```
   ❌ clientName: "Jorge Garcia"
   ✅ clientName: phone_4931250144
   ```
   **Solución**: Verificar `ClientChatListScreen.kt` línea 108

2. **Filtro incorrecto en `ClientChatScreen.kt`:**
   ```kotlin
   // Debe filtrar por ID, no por nombre
   (message.senderId == deliveryPerson?.id && message.receiverId == clientName) ||
   (message.receiverId == deliveryPerson?.id && message.senderId == clientName)
   ```

---

### **Problema C: Teléfono es NULL**

**síntoma**: `clientPhone` es null en la app del cliente

**Verificar en consola:**
```
🔍 [DEBUG] Datos del cliente:
   └── clientPhone: null   ❌
```

**Solución:**
1. El cliente debe tener teléfono registrado
2. Verificar que `AuthService.getClientPhone()` retorna valor
3. Si es null, usar fallback a `clientId`

---

## 📸 Capturas Recomendadas

Compartir estas capturas si hay problemas:

1. **Firebase Console** → messages → último mensaje
   - Mostrar todos los campos (senderId, receiverId, etc.)

2. **Firebase Console** → orders → customer
   - Mostrar name y phone

3. **Consola del navegador** (cliente)
   - Logs completos al recibir mensaje

4. **Logcat** (repartidor)
   - Logs completos al enviar/recibir mensaje

---

## ✨ Resultado Esperado

**Al finalizar las pruebas deberías ver:**

```
=== APP MÓVIL REPARTIDOR ===
Chats con Clientes
├─ Jorge Garcia
│  └─ Pedido: 1774680785125
│     ├─ PRUEBA 123 (enviado 22:30)
│     ├─ RESPUESTA 456 (recibido 22:31)
│     └─ Más mensajes...

=== APP WEB CLIENTE ===
💬 Chat con tu Repartidor
🚚 Jose L
├─ PRUEBA 123 (22:30) ✅
├─ RESPUESTA 456 (22:31) ✅
└─ Más mensajes...
```

**¡COMUNICACIÓN BIDIRECCIONAL 100% FUNCIONAL! 🎉**

---

**Fecha**: 26 de marzo, 2026  
**Estado**: Listo para probar  
**Tiempo estimado**: 10 minutos
