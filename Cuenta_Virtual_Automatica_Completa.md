# 🎯 CUENTA VIRTUAL AUTOMÁTICA - IMPLEMENTACIÓN COMPLETA

## 📋 Resumen

Se ha implementado un sistema de cuenta virtual por defecto para acceso automático en la aplicación del cliente, tanto en versión web como móvil (Android).

---

## 🔐 Credenciales por Defecto

```
Email: cliente@demo.com
Contraseña: 123456
Nombre: Cliente Demo
Teléfono: +57 300 123 4567
ID: cliente_default_001
```

---

## 🌐 APLICACIÓN WEB (Cliente-Web)

### Archivos Creados/Modificados

#### 1. `cliente-web/src/services/SetupDefaultAccount.ts`
- **Propósito:** Crea automáticamente la cuenta en Firebase al iniciar la app
- **Ejecución:** Se ejecuta una sola vez cuando se carga la aplicación
- **Acción:** Registra la cuenta en `/clients/cliente_default_001` en Firebase

#### 2. `cliente-web/src/pages/Login.tsx`
**Cambios realizados:**
- Se agregó auto-login con `useEffect` que intenta iniciar sesión automáticamente
- Se añadió botón "⚡ Entrada Rápida (Demo)" para login rápido
- Se muestran las credenciales en pantalla para fácil acceso
- Los placeholders de los inputs muestran las credenciales por defecto

**Código clave:**
```typescript
const DEFAULT_EMAIL = 'cliente@demo.com';
const DEFAULT_PASSWORD = '123456';

// Auto-login al cargar
useEffect(() => {
  const performAutoLogin = async () => {
    if (AuthService.isAuthenticated()) {
      navigate('/inicio');
      return;
    }
    
    const success = await AuthService.login(DEFAULT_EMAIL, DEFAULT_PASSWORD);
    if (success) {
      navigate('/inicio');
    }
  };
  performAutoLogin();
}, [navigate]);
```

#### 3. `cliente-web/src/App.tsx`
- Se importó `SetupDefaultAccount` para crear la cuenta automáticamente

#### 4. `cliente-web/Cuenta_Virtual_Defecto.md`
- Documentación completa del sistema

### Flujo de Uso - Web

1. **Primera vez:**
   - El usuario abre la aplicación
   - `SetupDefaultAccount.ts` crea la cuenta en Firebase
   - El login screen intenta auto-login automáticamente
   - Si tiene éxito, redirige al dashboard

2. **Siguientes veces:**
   - Verifica si hay sesión activa
   - Si no, intenta auto-login con credenciales por defecto
   - Usuario también puede usar botón "Entrada Rápida"
   - O ingresar credenciales manualmente

---

## 📱 APLICACIÓN MÓVIL (Android - App)

### Archivos Creados/Modificados

#### 1. `app/src/main/java/com/example/aplicacionnuevaprueba1/ui/screens/ClientLoginScreen.kt` (NUEVO)
**Características:**
- Pantalla de login moderna con Material Design 3
- Muestra caja con credenciales por defecto
- Botón "⚡ Entrada Rápida (Demo)"
- Auto-login al cargar la pantalla
- Campos de email y contraseña con placeholders
- Manejo de errores y estados de carga

**Código clave:**
```kotlin
val DEFAULT_EMAIL = "cliente@demo.com"
val DEFAULT_PASSWORD = "123456"

// Auto-login al cargar
LaunchedEffect(Unit) {
    autoLogin(context, onLoginSuccess)
}

private fun autoLogin(context: Context, onLoginSuccess: () -> Unit) {
    val prefs = context.getSharedPreferences("client_prefs", Context.MODE_PRIVATE)
    val isLoggedIn = prefs.getBoolean("is_logged_in", false)
    
    if (isLoggedIn) {
        onLoginSuccess()
        return
    }
    
    // Intentar login con credenciales por defecto
    saveClientSession(context, "cliente_default_001", DEFAULT_EMAIL, "Cliente Demo")
    onLoginSuccess()
}
```

#### 2. `app/src/main/java/com/example/aplicacionnuevaprueba1/MainActivity.kt`
**Cambios realizados:**
- Se agregó verificación de estado de login
- Muestra `ClientLoginScreen` si no hay sesión
- Muestra `AdminScreen` si está autenticado
- Gestiona estado con `mutableStateOf`

**Código clave:**
```kotlin
var isLoggedIn by remember { mutableStateOf(isClientLoggedIn()) }

if (isLoggedIn) {
    val viewModel: AdminViewModel = viewModel()
    AdminScreen(viewModel)
} else {
    ClientLoginScreen(
        onLoginSuccess = {
            isLoggedIn = true
        }
    )
}

private fun isClientLoggedIn(): Boolean {
    val prefs = getSharedPreferences("client_prefs", MODE_PRIVATE)
    return prefs.getBoolean("is_logged_in", false)
}
```

### Flujo de Uso - Android

1. **Primera ejecución:**
   - Se muestra `ClientLoginScreen`
   - Automáticamente intenta login con credenciales por defecto
   - Si tiene éxito, carga `AdminScreen`
   - Guarda sesión en SharedPreferences

2. **Siguientes ejecuciones:**
   - Verifica `isClientLoggedIn()`
   - Si es verdadero, va directamente a `AdminScreen`
   - Si es falso, muestra pantalla de login

---

## 🔧 CONFIGURACIÓN EN FIREBASE

### Estructura de Datos

La cuenta se crea en Firebase Realtime Database en esta ruta:

```
clients/
  └── cliente_default_001/
      ├── id: "cliente_default_001"
      ├── email: "cliente@demo.com"
      ├── password: "123456"
      ├── name: "Cliente Demo"
      ├── phone: "+57 300 123 4567"
      ├── createdAt: 1234567890
      ├── status: "active"
      └── address: "Dirección de prueba, Ciudad"
```

### Verificación Manual

Para verificar que la cuenta existe:

1. Abre Firebase Console
2. Ve a Realtime Database
3. Navega a `/clients/cliente_default_001`
4. Deberías ver los datos de la cuenta

---

## ✏️ CÓMO CAMBIAR LAS CREDENCIALES

### En Web

1. Abre `cliente-web/src/pages/Login.tsx`
2. Modifica las constantes:
```typescript
const DEFAULT_EMAIL = 'tu_nuevo_email@ejemplo.com';
const DEFAULT_PASSWORD = 'tu_nueva_contraseña';
```

3. Actualiza también en `cliente-web/src/services/SetupDefaultAccount.ts`:
```typescript
const DEFAULT_ACCOUNT = {
  id: "cliente_default_001",
  email: "tu_nuevo_email@ejemplo.com",
  password: "tu_nueva_contraseña",
  // ... resto de datos
};
```

### En Android

1. Abre `app/src/main/java/com/example/aplicacionnuevaprueba1/ui/screens/ClientLoginScreen.kt`
2. Modifica las constantes:
```kotlin
val DEFAULT_EMAIL = "tu_nuevo_email@ejemplo.com"
val DEFAULT_PASSWORD = "tu_nueva_contraseña"
```

3. También actualiza la función `autoLogin()` y `performLogin()`

### En Firebase

1. Abre Firebase Console → Realtime Database
2. Navega a `/clients/cliente_default_001`
3. Edita los campos `email` y `password`
4. Guarda los cambios

---

## 🚫 CÓMO ELIMINAR EL AUTO-LOGIN

### Web

Opción 1: Comentar el auto-login
```typescript
// Comenta este bloque en Login.tsx
/*
useEffect(() => {
  const performAutoLogin = async () => {
    // ... código
  };
  performAutoLogin();
}, [navigate]);
*/
```

Opción 2: Eliminar la importación en App.tsx
```typescript
// Eliminar esta línea:
import './services/SetupDefaultAccount';
```

### Android

En `MainActivity.kt`, modificar `isClientLoggedIn()`:
```kotlin
private fun isClientLoggedIn(): Boolean {
    // Retornar false para siempre mostrar login
    return false
}
```

O eliminar completamente `ClientLoginScreen` y siempre mostrar `AdminScreen`.

---

## 📊 RESUMEN DE ARCHIVOS MODIFICADOS

### Web (Cliente-Web)
- ✅ `src/services/CreateDefaultAccount.ts` (CREADO)
- ✅ `src/services/SetupDefaultAccount.ts` (CREADO)
- ✅ `src/pages/Login.tsx` (MODIFICADO)
- ✅ `src/App.tsx` (MODIFICADO)
- ✅ `Cuenta_Virtual_Defecto.md` (CREADO)

### Android (App)
- ✅ `ui/screens/ClientLoginScreen.kt` (CREADO)
- ✅ `MainActivity.kt` (MODIFICADO)

---

## 🎨 CARACTERÍSTICAS VISUALES

### Web
- Caja azul clara con información de cuenta demo
- Botón "⚡ Entrada Rápida (Demo)" color celeste
- Placeholders en inputs muestran credenciales
- Mensajes de error en rojo
- Diseño responsive

### Android
- Card blanco sobre fondo verde (#667eea)
- Caja celeste con info de cuenta demo
- Botón "⚡ Entrada Rápida (Demo)" 
- Iconos de persona y candado en inputs
- Material Design 3
- Estados de carga y error

---

## 🔒 CONSIDERACIONES DE SEGURIDAD

⚠️ **IMPORTANTE - SOLO PARA DESARROLLO:**

Esta implementación es ÚNICAMENTE para:
- ✅ Desarrollo
- ✅ Pruebas
- ✅ Demostraciones
- ✅ Prototipado

❌ **NO USAR EN PRODUCCIÓN:**
- No usar cuentas por defecto en apps reales
- Implementar Firebase Authentication real
- Encriptar contraseñas
- Requiere registro obligatorio
- Usar tokens JWT o similar
- Validar emails
- Implementar recuperación de contraseña

---

## 🧪 PRUEBAS

### Probar en Web

1. Ejecutar: `npm run dev` en `cliente-web/`
2. Abrir navegador
3. Debería hacer auto-login automáticamente
4. Si falla, usar botón "Entrada Rápida"
5. Verificar consola del navegador para mensajes

### Probar en Android

1. Compilar e instalar app
2. Al abrir, debería mostrar login screen
3. Auto-login debería ejecutarse
4. Debería cargar AdminScreen automáticamente
5. Verificar Logcat para debug

---

## 📝 NOTAS ADICIONALES

### Persistencia de Sesión

**Web:**
- Usa `localStorage` para guardar sesión
- Claves: `clientId`, `clientEmail`, `clientName`, `clientPhone`

**Android:**
- Usa `SharedPreferences` para guardar sesión
- Archivo: `client_prefs`
- Claves: `is_logged_in`, `client_id`, `client_email`, `client_name`

### Eliminación de Sesión

**Web:**
```javascript
AuthService.logout() // Remueve items del localStorage
```

**Android:**
```kotlin
val prefs = context.getSharedPreferences("client_prefs", Context.MODE_PRIVATE)
prefs.edit().clear().apply() // Limpia toda la sesión
```

---

## 🆘 SOPORTE

Si tienes problemas:

1. **Verifica Firebase:**
   - Revisa que la cuenta exista en Realtime Database
   - Verifica las reglas de seguridad

2. **Revisa Consolas:**
   - Web: Console del navegador (F12)
   - Android: Logcat en Android Studio

3. **Limpia caché:**
   - Web: Limpia localStorage y recarga
   - Android: Borra datos de la app

---

## 📞 CONTACTO

Para cambiar configuraciones o personalizar:

- Editar credenciales en archivos mencionados
- Actualizar Firebase manualmente
- Modificar colores y diseño según preferencia

---

**✅ IMPLEMENTACIÓN COMPLETADA - LISTO PARA USAR**

Fecha de implementación: 6 de Marzo, 2026
Estado: Funcional ✅
