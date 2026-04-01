# 🐛 DEPURACIÓN: MENSAJES REPARTIDOR → CLIENTE

## 📋 Problema Reportado

- ✅ **Cliente → Repartidor**: Mensajes SÍ llegan y se visualizan
- ❌ **Repartidor → Cliente**: Mensajes NO se visualizan en la app del cliente (aunque en el repartidor sí aparecen)

---

## 🔍 Logs de Depuración Agregados

### App Móvil del Repartidor:

#### 1. **ClientChatScreen.kt** - Al enviar mensaje:
```kotlin
println("🔍 [DEBUG] Enviando mensaje:")
println("   ├── deliveryPerson.id: ${deliveryPerson.id}")
println("   ├── deliveryPerson.name: ${deliveryPerson.name}")
println("   ├── clientName: $clientName")
println("   └── orderId: $orderId")
```

#### 2. **MessageRepository.kt** - Al guardar en Firebase:
```kotlin
println("💾 [DEBUG] Guardando mensaje en Firebase:")
println("   ├── key: $key")
println("   ├── senderId: $senderId")
println("   ├── senderName: $senderName")
println("   ├── receiverId: $receiverId")
println("   ├── receiverName: $receiverName")
println("   └── message: $message")
println("✅ [DEBUG] Mensaje guardado exitosamente")
```

---

### App Web del Cliente:

#### 3. **ChatPage.tsx** - Al iniciar escucha:
```typescript
console.log('🔍 [DEBUG] Iniciando escucha de mensajes:');
console.log('   ├── currentUserId:', currentUserId);
console.log('   └── receiverId:', receiverId);
```

#### 4. **ChatPage.tsx** - Al recibir mensajes:
```typescript
console.log('📩 [DEBUG] Mensajes recibidos:', fetchedMessages.length);
fetchedMessages.forEach(msg => {
  console.log('   ├── ID:', msg.id);
  console.log('   ├── senderId:', msg.senderId);
  console.log('   ├── receiverId:', msg.receiverId);
  console.log('   └── message:', msg.message);
});
```

#### 5. **MessageService.ts** - Filtro de mensajes:
```typescript
console.log('🔍 [listenMessages] userId1:', userId1, 'userId2:', userId2);
console.log('📦 [listenMessages] Total de mensajes en Firebase:', Object.keys(allMessages).length);

// Para cada mensaje:
const match = (msg.senderId === userId1 && msg.receiverId === userId2) ||
             (msg.senderId === userId2 && msg.receiverId === userId1);

if (match) {
  console.log('✅ [MATCH] Mensaje que coincide:');
  console.log('   ├── senderId:', msg.senderId);
  console.log('   ├── receiverId:', msg.receiverId);
  console.log('   └── message:', msg.message);
} else {
  console.log('❌ [NO MATCH] Mensaje descartado:', msg.senderId, '->', msg.receiverId);
}

console.log('📊 [RESULTADO] Mensajes filtrados:', messagesArray.length);
```

---

## 🧪 Instrucciones de Prueba

### Paso 1: Compilar Apps

**App Móvil (Android Studio):**
```
Build > Build Bundle(s) / APK(s) > Build APK(s)
Instalar en dispositivo/emulador
```

**App Cliente (Vercel/Local):**
```bash
cd cliente-web
npm run dev  # O hacer deploy a Vercel
```

---

### Paso 2: Abrir Consolas/Logs

**App Móvil:**
- Android Studio → Logcat
- Filtrar por tag o buscar "DEBUG"

**App Cliente:**
- Navegador → DevTools → Console (F12)
- Mantener consola visible

---

### Paso 3: Ejecutar Flujo de Prueba

#### Escenario A: Cliente envía mensaje (DEBERÍA FUNCIONAR)

1. **Abrir app del cliente**
2. **Ir a chat con repartidor**
3. **Enviar mensaje**: "¿Dónde estás?"
4. **Verificar consola del cliente**:
   ```
   🔍 [DEBUG] Iniciando escucha de mensajes:
      ├── currentUserId: María García
      └── receiverId: repartidor456
   
   📩 [DEBUG] Mensajes recibidos: 1
      ├── ID: msg_001
      ├── senderId: María García
      ├── receiverId: repartidor456
      └── message: ¿Dónde estás?
   ```

5. **Verificar app del repartidor**:
   ```
   🔍 [DEBUG] Recibiendo mensaje...
   💾 [DEBUG] Mensaje recibido en Firebase
   ```

---

#### Escenario B: Repartidor envía mensaje (PROBLEMA REPORTADO)

1. **Abrir app del repartidor móvil**
2. **Ir a pestaña "Clientes"**
3. **Tocar cliente "María García"**
4. **Enviar mensaje**: "Ya voy en camino"
5. **Verificar logs del repartidor**:
   ```
   🔍 [DEBUG] Enviando mensaje:
      ├── deliveryPerson.id: repartidor456
      ├── deliveryPerson.name: Juan Repartidor
      ├── clientName: María García
      └── orderId: order123
   
   💾 [DEBUG] Guardando mensaje en Firebase:
      ├── key: -abc123xyz
      ├── senderId: repartidor456
      ├── senderName: Juan Repartidor
      ├── receiverId: María García    ← VERIFICAR ESTO
      ├── receiverName: María García
      └── message: Ya voy en camino
   
   ✅ [DEBUG] Mensaje guardado exitosamente
   ```

6. **Verificar consola del cliente**:
   ```
   🔍 [listenMessages] userId1: María García userId2: repartidor456
   
   📦 [listenMessages] Total de mensajes en Firebase: 5
   
   // Si funciona:
   ✅ [MATCH] Mensaje que coincide:
      ├── senderId: repartidor456
      ├── receiverId: María García
      └── message: Ya voy en camino
   
   📊 [RESULTADO] Mensajes filtrados: 2
   
   // Si NO funciona:
   ❌ [NO MATCH] Mensaje descartado: repartidor456 -> María García
   📊 [RESULTADO] Mensajes filtrados: 0
   ```

---

## 🎯 Qué Buscar en los Logs

### Posible Problema 1: IDs Inconsistentes

**Síntoma**:
```
App Repartidor envía:
  receiverId: María García

App Cliente espera:
  currentUserId: cliente123  ← DIFERENTE
```

**Solución**: Verificar que `ChatPage.tsx` use `clientName` no `clientId`

---

### Posible Problema 2: receiverId Vacío o Null

**Síntoma**:
```
💾 [DEBUG] Guardando mensaje en Firebase:
   ├── receiverId: null  ← PROBLEMA
```

**Solución**: Verificar que `clientName` no sea vacío en `ClientChatScreen.kt`

---

### Posible Problema 3: Filtro Mal Implementado

**Síntoma**:
```
🔍 [listenMessages] userId1: María García userId2: repartidor456

❌ [NO MATCH] Mensaje descartado: repartidor456 -> María García
```

**Análisis**: El filtro debería coincidir pero no lo hace

**Posible causa**: Comparación case-sensitive ("maría garcía" vs "María García")

**Solución**: Usar comparación case-insensitive:
```typescript
const match = (msg.senderId.toLowerCase() === userId1.toLowerCase() && 
               msg.receiverId.toLowerCase() === userId2.toLowerCase()) ||
              (msg.senderId.toLowerCase() === userId2.toLowerCase() && 
               msg.receiverId.toLowerCase() === userId1.toLowerCase());
```

---

### Posible Problema 4: Datos en Firebase Incorrectos

**Síntoma**: Mensajes guardados con estructura incorrecta

**Verificar en Firebase Console**:
```
Firebase Realtime Database → messages → -abc123xyz
{
  "senderId": "repartidor456",
  "senderName": "Juan Repartidor",
  "receiverId": "María García",     ← VERIFICAR
  "receiverName": "María García",
  "message": "Ya voy en camino"
}
```

---

## 📊 Resultados Esperados

### ✅ Funcionamiento Correcto:

**App Repartidor**:
```
✅ [DEBUG] Mensaje guardado exitosamente
   ├── senderId: repartidor456
   └── receiverId: María García
```

**App Cliente**:
```
✅ [MATCH] Mensaje que coincide:
   ├── senderId: repartidor456
   └── receiverId: María García

📊 [RESULTADO] Mensajes filtrados: 1
📩 [DEBUG] Mensajes recibidos: 1
```

**UI del Cliente**:
- ✅ Mensaje aparece en burbuja gris (remitente)
- ✅ Texto: "Ya voy en camino"
- ✅ Timestamp visible

---

### ❌ Si Persiste el Problema:

**Reportar con esta información**:

1. **Logs completos del repartidor**:
   ```
   🔍 [DEBUG] Enviando mensaje:
      ├── deliveryPerson.id: ???
      ├── deliveryPerson.name: ???
      ├── clientName: ???
      └── orderId: ???
   
   💾 [DEBUG] Guardando mensaje en Firebase:
      ├── senderId: ???
      ├── receiverId: ???
      └── message: ???
   ```

2. **Logs completos del cliente**:
   ```
   🔍 [listenMessages] userId1: ??? userId2: ???
   
   📦 [listenMessages] Total de mensajes en Firebase: ???
   
   ❌ [NO MATCH] Mensaje descartado: ??? -> ???
   
   📊 [RESULTADO] Mensajes filtrados: ???
   ```

3. **Captura de Firebase**:
   - Ir a Firebase Console
   - Realtime Database
   - messages
   - Último mensaje enviado
   - Capturar todos los campos

---

## 🔧 Posibles Soluciones Rápidas

### Solución 1: Forzar IDs Idénticos

**En ChatPage.tsx**:
```typescript
// Asegurar que currentUserId sea EXACTAMENTE el nombre del cliente
setCurrentUserId(clientName.trim());  // Sin espacios extra
```

**En ClientChatScreen.kt**:
```kotlin
// Asegurar que clientName esté limpio
val cleanClientName = clientName.trim()
viewModel.sendMessageToClient(
    clientId = cleanClientName,
    ...
)
```

---

### Solución 2: Usar ID Único en vez de Nombre

**Requiere cambios mayores**:
1. Agregar `customerId` al modelo `Order`
2. Guardar `customerId` cuando se crea pedido
3. Pasar `customerId` en navegación
4. Actualizar ambos apps para usar IDs reales

**Ventaja**: Más robusto, soporta nombres duplicados  
**Desventaja**: Requiere más trabajo

---

### Solución 3: Híbrido (Nombre + ID)

**Mensaje incluye ambos**:
```json
{
  "senderId": "repartidor456",
  "senderName": "Juan Repartidor",
  "receiverId": "cliente123",        // ID real
  "receiverName": "María García",    // Nombre para display
  "message": "Ya voy en camino"
}
```

**Filtro usa receiverId**:
```typescript
const match = msg.receiverId === currentUserId || msg.senderId === currentUserId;
```

---

## 📝 Checklist de Diagnóstico

- [ ] Logs del repartidor muestran `receiverId` correcto
- [ ] Logs del cliente muestran `currentUserId` correcto
- [ ] Ambos valores son IDÉNTICOS (case-sensitive)
- [ ] Firebase muestra datos correctos
- [ ] Filtro encuentra coincidencias
- [ ] Mensajes aparecen en UI del cliente

---

**Fecha**: 26 de marzo, 2026  
**Estado**: 🔍 EN DEPURACIÓN - ESPERANDO LOGS PARA DIAGNÓSTICO  
**Siguiente Paso**: Compilar, probar, y revisar logs para identificar causa exacta
