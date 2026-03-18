# 🚚 Click Entrega - Configuración de Cuenta Virtual

## ✅ IMPLEMENTACIÓN COMPLETADA

Se ha implementado un sistema de **cuenta virtual por defecto** con auto-login para la aplicación del cliente.

---

## 🔐 CREDENCIALES POR DEFECTO

```
📧 Email:        cliente@demo.com
🔑 Contraseña:   123456
👤 Nombre:       Cliente Demo
📱 Teléfono:     +57 300 123 4567
```

---

## 🔥 CONFIGURAR FIREBASE (IMPORTANTE)

Para que funcione la cuenta virtual, necesitas configurar Firebase:

### 📋 Check-list Rápido:

- [ ] 1. Crear proyecto en Firebase Console
- [ ] 2. Activar Realtime Database
- [ ] 3. Configurar reglas de seguridad (modo desarrollo)
- [ ] 4. Registrar app web en Firebase
- [ ] 5. Crear archivo `.env.local` con credenciales
- [ ] 6. Instalar dependencias
- [ ] 7. Iniciar servidor

### 📖 Guías Disponibles:

| Archivo | Descripción |
|---------|-------------|
| [`cliente-web/VERIFICACION_RAPIDA.txt`](cliente-web/VERIFICACION_RAPIDA.txt) | ✅ Check-list rápida (empieza aquí) |
| [`cliente-web/VINCULAR_FIREBASE_GUIA.md`](cliente-web/VINCULAR_FIREBASE_GUIA.md) | 📚 Guía completa paso a paso |
| [`Cuenta_Virtual_Automatica_Completa.md`](Cuenta_Virtual_Automatica_Completa.md) | 📖 Documentación completa |
| [`CREDENCIALES_CUENTA_VIRTUAL.txt`](CREDENCIALES_CUENTA_VIRTUAL.txt) | 📝 Resumen de credenciales |

---

## 🚀 INICIO RÁPIDO

### 1. Configurar Firebase

```bash
# Sigue la guía: cliente-web/VERIFICACION_RAPIDA.txt
```

### 2. Probar Aplicación Web

```bash
cd cliente-web
npm install
npm run dev
```

Abre: http://localhost:5173

**Debería:** Auto-login automáticamente con la cuenta demo

---

## 🎯 ¿QUÉ SE VINCULA A FIREBASE?

### Necesario:

1. **Realtime Database** ✅
   - Para guardar clientes
   - Pedidos
   - Mensajes
   
2. **Configuración en `.env.local`** ✅
   ```bash
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_DATABASE_URL=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

### Opcional (para producción):

- Firebase Authentication
- Firebase Cloud Messaging (notificaciones push)
- Firebase Storage (imágenes)
- Firebase Analytics

---

## 📁 ESTRUCTURA EN FIREBASE

Después de ejecutar, verás esto en Firebase Realtime Database:

```
tu-base-de-datos/
├── clients/
│   └── cliente_default_001/          ← Cuenta virtual por defecto
│       ├── id: "cliente_default_001"
│       ├── email: "cliente@demo.com"
│       ├── password: "123456"
│       ├── name: "Cliente Demo"
│       ├── phone: "+57 300 123 4567"
│       ├── createdAt: 1234567890
│       └── status: "active"
│
├── orders/                            ← Pedidos (se crean dinámicamente)
│   └── ...
│
└── messages/                          ← Mensajes (se crean dinámicamente)
    └── ...
```

---

## 🔧 CAMBIAR CREDENCIALES

Si quieres cambiar el email/contraseña por defecto:

### Web:

1. Edita `cliente-web/src/pages/Login.tsx`:
```typescript
const DEFAULT_EMAIL = 'tu_nuevo_email@ejemplo.com'
const DEFAULT_PASSWORD = 'tu_nueva_contraseña'
```

2. Edita `cliente-web/src/services/SetupDefaultAccount.ts`:
```typescript
const DEFAULT_ACCOUNT = {
  email: "tu_nuevo_email@ejemplo.com",
  password: "tu_nueva_contraseña",
  // ... resto de datos
}
```

3. Actualiza en Firebase Console manualmente:
   - Realtime Database → `/clients/cliente_default_001`
   - Edita campos `email` y `password`

---

## 📱 APLICACIONES INCLUIDAS

### ✅ Web (cliente-web)
- Auto-login automático
- Botón de entrada rápida
- Credenciales visibles en pantalla

### ✅ Android (app)
- Pantalla de login con auto-login
- Persistencia de sesión
- Material Design 3

---

## ⚠️ SEGURIDAD - IMPORTANTE

Esta implementación es **SOLO PARA DESARROLLO Y PRUEBAS**.

### Para Producción usar:

- ✅ Firebase Authentication real
- ✅ Contraseñas encriptadas (bcrypt, argon2)
- ✅ Registro obligatorio de usuarios
- ✅ Validación de emails
- ✅ Tokens JWT
- ✅ Reglas de seguridad estrictas en Firebase

### Reglas para Desarrollo (temporal):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Reglas para Producción (recomendado):

```json
{
  "rules": {
    "clients": {
      "$clientId": {
        ".read": "$clientId === auth.uid",
        ".write": "$clientId === auth.uid"
      }
    }
  }
}
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Firebase not initialized"
→ Verifica `.env.local` con credenciales correctas
→ Reinicia el servidor

### Error: "permission_denied"
→ Cambia reglas de seguridad en Firebase Console
→ Permite lectura/escritura temporalmente

### Error: "Network error"
→ Verifica conexión a internet
→ Revisa URL de database en `.env.local`

### La cuenta no se crea
→ Abre DevTools (F12) → Consola
→ Busca errores específicos
→ Verifica Firebase Console → Realtime Database

---

## 📞 RECURSOS

- **Documentación Completa:** [`Cuenta_Virtual_Automatica_Completa.md`](Cuenta_Virtual_Automatica_Completa.md)
- **Guía Firebase:** [`cliente-web/VINCULAR_FIREBASE_GUIA.md`](cliente-web/VINCULAR_FIREBASE_GUIA.md)
- **Check-list:** [`cliente-web/VERIFICACION_RAPIDA.txt`](cliente-web/VERIFICACION_RAPIDA.txt)
- **Firebase Console:** https://console.firebase.google.com/

---

## ✨ CARACTERÍSTICAS

- ✅ Auto-login automático al abrir la app
- ✅ Botón "⚡ Entrada Rápida (Demo)"
- ✅ Credenciales visibles en pantalla
- ✅ Cuenta se crea automáticamente en Firebase
- ✅ Persistencia de sesión
- ✅ Funciona en Web y Android
- ✅ Fácil de cambiar o eliminar

---

**Fecha de implementación:** Marzo 6, 2026  
**Estado:** ✅ Funcional  
**Tiempo estimado de configuración:** 10-15 minutos

---

## 🎉 ¡LISTO!

Sigue la guía [`VERIFICACION_RAPIDA.txt`](cliente-web/VERIFICACION_RAPIDA.txt) para configurar Firebase en 7 pasos simples.
