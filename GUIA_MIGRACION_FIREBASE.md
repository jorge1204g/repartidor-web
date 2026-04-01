# Guía de Migración a Nueva Cuenta Firebase

## Resumen
Migración del proyecto de Firebase `myappdelivery-4a576` a `proyecto-new-37f18` para renovar los 30 días de modo de prueba.

---

## 1. Crear Nuevo Proyecto en Firebase

1. Ir a https://console.firebase.google.com/
2. Click en "Añadir proyecto"
3. Nombre: `proyecto-new-37f18`
4. Habilitar **Realtime Database** en modo de prueba

---

## 2. Registrar Apps en Firebase

### Apps Web (3)

#### cliente-web
1. Firebase Console → Agregar app → Web
2. Alias: `cliente-web`
3. Copiar configuración:
   - apiKey: `AIzaSyDT6lLWCT2pzns4LR_tCy-vafyVoBSe3jo`
   - authDomain: `proyecto-new-37f18.firebaseapp.com`
   - databaseURL: `https://proyecto-new-37f18-default-rtdb.firebaseio.com`
   - projectId: `proyecto-new-37f18`
   - storageBucket: `proyecto-new-37f18.firebasestorage.app`
   - messagingSenderId: `253121042757`
   - appId: `1:253121042757:web:92654439c7cc02b08b862c`

#### repartidor-web
1. Agregar app → Web
2. Alias: `repartidor-web`
3. Guardar databaseURL

#### restaurante-web
1. Agregar app → Web
2. Alias: `restaurante-web`
3. Guardar databaseURL

### Apps Android (2)

#### app (cliente/admin)
1. Agregar app → Android
2. Nombre del paquete: `com.example.aplicacionnuevaprueba1`
3. Descargar `google-services.json`
4. Reemplazar en: `app/google-services.json`

#### app-repartidor
1. Agregar app → Android
2. Nombre del paquete: `com.example.repartidor`
3. Descargar `google-services.json`
4. Reemplazar en: `app-repartidor/google-services.json`

---

## 3. Actualizar Variables en Vercel

### cliente-web
URL: https://vercel.com/jorge1204gs-projects/cliente-web/settings/environment-variables

Variables a actualizar:
- `VITE_FIREBASE_API_KEY` = `AIzaSyDT6lLWCT2pzns4LR_tCy-vafyVoBSe3jo`
- `VITE_FIREBASE_AUTH_DOMAIN` = `proyecto-new-37f18.firebaseapp.com`
- `VITE_FIREBASE_DATABASE_URL` = `https://proyecto-new-37f18-default-rtdb.firebaseio.com`
- `VITE_FIREBASE_PROJECT_ID` = `proyecto-new-37f18`
- `VITE_FIREBASE_STORAGE_BUCKET` = `proyecto-new-37f18.firebasestorage.app`
- `VITE_FIREBASE_MESSAGING_SENDER_ID` = `253121042757`
- `VITE_FIREBASE_APP_ID` = `1:253121042757:web:92654439c7cc02b08b862c`

Pasos:
1. Ir a Settings → Environment Variables
2. Editar cada variable (3 puntos → Edit)
3. Guardar cambios
4. Ir a Deployments → Redeploy

### repartidor-web
URL: https://vercel.com/jorge1204gs-projects/repartidor-web/settings/environment-variables

Variable a agregar:
- `VITE_FIREBASE_DATABASE_URL` = `https://proyecto-new-37f18-default-rtdb.firebaseio.com`

### restaurante-web
URL: https://vercel.com/jorge1204gs-projects/restaurante-web/settings/environment-variables

Variable a agregar:
- `VITE_FIREBASE_DATABASE_URL` = `https://proyecto-new-37f18-default-rtdb.firebaseio.com`

---

## 4. Actualizar Archivos Locales

### Archivos ya actualizados:
- `app/google-services.json` ✅
- `app-repartidor/google-services.json` ✅
- `cliente-web/.env.local` ✅
- `repartidor-web/.env.local` ✅
- `restaurante-web/.env.local` ✅
- `repartidor-web/src/services/Firebase.ts` ✅
- `restaurante-web/src/services/Firebase.ts` ✅
- `repartidor-web/src/config/appConfig.ts` ✅
- `cliente-web/test-firebase.html` ✅
- `cliente-web/test-chat-debug.html` ✅
- `cliente-web/eliminar-mensajes.html` ✅
- `firebase-rules.json` ✅

---

## 5. Configurar Reglas de Firebase

1. Ir a Firebase Console → Realtime Database → Reglas
2. Pegar:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
3. Click en Publicar

---

## 6. Recompilar Apps Móviles

### En Android Studio:
1. Seleccionar módulo `:app`
2. Build → Clean Project
3. Build → Rebuild Project
4. Run → Instalar en dispositivo
5. Repetir para `:app-repartidor`

### Importante:
- Desinstalar apps antiguas del dispositivo primero
- Las apps antiguas apuntan al Firebase anterior

---

## URLs de las Apps Web

| App | URL |
|-----|-----|
| cliente-web | https://cliente-web-mu.vercel.app |
| repartidor-web | https://repartidor-web.vercel.app |
| restaurante-web | https://restaurante-web-teal.vercel.app |

---

## Próxima Migración (dentro de 30 días)

Cuando vuelva a vencer el modo de prueba:
1. Crear nuevo proyecto en Firebase
2. Repetir todos los pasos anteriores
3. Actualizar las mismas variables y archivos

---

## Notas Importantes

- La base de datos nueva está vacía (sin datos del proyecto anterior)
- Para migrar datos: Firebase Console → Exportar JSON (proyecto antiguo) → Importar JSON (proyecto nuevo)
- Las apps móviles deben reinstalarse para usar la nueva configuración
- Las apps web se actualizan automáticamente al redeployar

---

Fecha de migración: Marzo 2026
Próxima renovación: Abril 2026 (dentro de 30 días)
