# 🔍 VERIFICACIÓN DE DATOS EN FIREBASE

## 📋 Instrucciones

Necesito que me ayudes a verificar QUÉ HAY REALMENTE en Firebase. Sigue estos pasos:

---

### **Paso 1: Abrir Firebase Console**

1. Ir a: https://console.firebase.google.com/
2. Seleccionar tu proyecto
3. Ir a **Realtime Database** (en el menú izquierdo)

---

### **Paso 2: Buscar Mensajes**

En la base de datos, navegar a:
```
messages
  └── [mensaje más reciente]
```

Buscar un mensaje enviado DESDE el cliente HACIA el repartidor.

---

### **Paso 3: Verificar Campos del Mensaje**

Necesito que me compartas una CAPTURA DE PANTALLA o copies estos campos:

```json
{
  "id": "-xyz123abc",
  "senderId": "???",        ← ¿Qué valor tiene?
  "senderName": "???",      ← ¿Qué valor tiene?
  "receiverId": "???",      ← ¿Qué valor tiene?
  "receiverName": "???",    ← ¿Qué valor tiene?
  "message": "???",         ← El texto del mensaje
  "timestamp": 1234567890,
  "messageType": "TEXT"
}
```

---

### **Paso 4: Verificar Pedido**

También necesito ver cómo está guardado el pedido:

Navegar a:
```
client_orders
  └── [pedido más reciente]
    └── customer
```

Y verificar:
```json
{
  "customer": {
    "name": "???",      ← ¿Dice "Jorge Garcia" O dice un ID como "-abc123"?
    "phone": "???",
    "email": "???"
  }
}
```

---

## 🎯 Qué Buscar

### **Escenario A: Message con IDs Reales** ✅

```json
{
  "senderId": "cliente123",       // ID real de Firebase
  "senderName": "Jorge Garcia",   // Nombre legible
  "receiverId": "repartidor456",  // ID real de Firebase
  "receiverName": "Jose L"        // Nombre legible
}
```

**Si es así**: El problema está en otra parte

---

### **Escenario B: Message con Nombres en lugar de IDs** ❌

```json
{
  "senderId": "Jorge Garcia",     // ¡Nombre en vez de ID!
  "senderName": "Jorge Garcia",
  "receiverId": "Jose L",         // ¡Nombre en vez de ID!
  "receiverName": "Jose L"
}
```

**Si es así**: El problema está en cómo se guardan los mensajes

---

### **Escenario C: Order.customer.name con ID** ⚠️

```json
{
  "customer": {
    "name": "-OmqqZ4HbDDkEzijIc2D",  // ID en vez de nombre
    "phone": "4931250144",
    "email": ""
  }
}
```

**Si es así**: El problema está en cómo se crean los pedidos

---

## 📸 Capturas Necesarias

Por favor comparte:

1. **Captura de un mensaje reciente** en Firebase (mostrando todos los campos)
2. **Captura del customer** en el pedido (mostrando name, phone, email)
3. **Captura de la consola del navegador** cuando abres el chat del cliente

---

## 🔧 Mientras Tanto...

Déjame revisar el código de cómo se envían los mensajes desde la app del cliente:
