# 🚀 VERIFICACIÓN RÁPIDA - Geolocalización

## ✅ Checklist Antes de Desplegar

### 1. Variables de Entorno Locales
```bash
# Verifica que tu archivo .env.local tenga:
cd "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\cliente-web"
notepad .env.local
```

**Debe contener:**
- ✅ VITE_FIREBASE_API_KEY
- ✅ VITE_FIREBASE_AUTH_DOMAIN
- ✅ VITE_FIREBASE_DATABASE_URL
- ✅ VITE_FIREBASE_PROJECT_ID
- ✅ VITE_FIREBASE_STORAGE_BUCKET
- ✅ VITE_FIREBASE_MESSAGING_SENDER_ID
- ✅ VITE_FIREBASE_APP_ID
- ✅ VITE_GOOGLE_MAPS_API_KEY

---

### 2. Variables en Vercel
```bash
# Ejecuta este script para actualizar variables en Vercel
cd "c:\Users\Jorge G\AndroidStudioProjects\Prueba New"
.\update-vercel-env.bat
```

**Verifica en Vercel Dashboard:**
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto cliente-web
3. Settings → Environment Variables
4. Confirma que las 8 variables estén presentes

---

### 3. Firebase Rules
```bash
# Verifica las reglas en Firebase Console
# https://console.firebase.google.com/project/proyecto-new-37f18/database/rules
```

**Reglas requeridas:**
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

---

### 4. Google Maps API
```bash
# Verifica tu API Key en Google Cloud Console
# https://console.cloud.google.com/apis/credentials
```

**APIs requeridas:**
- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Geocoding API

---

## 🧪 Pruebas Rápidas

### Test Local (Antes de Desplegar)

```bash
# 1. Inicia el servidor de desarrollo
cd "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\cliente-web"
npm run dev

# 2. Abre en tu navegador
http://localhost:3003
```

**Pasos de prueba:**
1. ✅ Inicia sesión con un usuario de prueba
2. ✅ Crea un pedido nuevo
3. ✅ Permite la ubicación cuando aparezca el prompt
4. ✅ Ve a "Mis Pedidos" y selecciona el pedido
5. ✅ Verifica que el mapa muestre tu ubicación

**Abre la consola (F12) y verifica:**
```
✅ Debes ver logs como:
📍 [PERMISOS] Iniciando solicitud de permiso...
⏳ [PERMISOS] Solicitando ubicación actual al usuario...
✅ [UBICACIÓN] Permiso concedido. Ubicación: {lat, lng}
💾 [FIREBASE] Guardando coordenadas del cliente en Firebase...
✅ [FIREBASE] Coordenadas guardadas exitosamente
```

---

### Test en Producción (Después de Desplegar)

```bash
# 1. Despliega en Vercel
git add .
git commit -m "Actualización de geolocalización"
git push

# 2. Espera a que Vercel compile (2-3 min)

# 3. Abre tu app en producción
https://tu-proyecto.vercel.app
```

**Mismos pasos que local:**
1. ✅ Inicia sesión
2. ✅ Crea un pedido
3. ✅ Permite ubicación
4. ✅ Verifica en el mapa
5. ✅ Revisa Firebase Realtime Database

---

## 🔍 Diagnóstico de Problemas

### ❌ El Prompt No Aparece

**Causa #1:** Navegador ya recordó tu decisión
**Solución:**
```
1. Abre Chrome → Configuración
2. Privacidad y seguridad → Configuración de sitios
3. Ubicación → Ver sitios con permiso denegado
4. Elimina tu dominio de la lista
5. Recarga la página
```

**Causa #2:** Variables de entorno faltantes
**Solución:**
```bash
# Ejecuta el script de actualización
.\update-vercel-env.bat

# Redesplega
git push
```

---

### ❌ Error: "Geolocation permission denied"

**Causa:** Usuario denegó permiso
**Solución:**
```
1. Click en el ícono de candado junto a la URL
2. Configuración de sitio
3. Cambia "Ubicación" a "Preguntar" o "Permitir"
4. Recarga la página
```

---

### ❌ Coordenadas No Se Guardan en Firebase

**Causa #1:** Firebase Rules bloquean escritura
**Solución:**
```
1. Ve a Firebase Console
2. Realtime Database → Rules
3. Cambia a:
   {
     ".read": true,
     ".write": true
   }
4. Publica los cambios
```

**Causa #2:** Order ID incorrecto
**Solución:**
```javascript
// Agrega este log en TrackOrderPage.tsx línea 99
console.log('Order ID:', order?.id); // Debe mostrar un valor
```

---

### ❌ Mapa No Carga / Error de Google Maps

**Causa #1:** API Key inválida
**Solución:**
```
1. Ve a Google Cloud Console
2. APIs & Services → Credentials
3. Verifica que la API Key esté activa
4. Copia la API Key correcta
5. Actualiza .env.local y Vercel
```

**Causa #2:** APIs no habilitadas
**Solución:**
```
1. Google Cloud Console → APIs & Services
2. Enable APIs and Services
3. Busca y habilita:
   - Maps JavaScript API
   - Places API
   - Geocoding API
```

**Causa #3:** Sin créditos en Google Cloud
**Solución:**
```
1. Google Cloud Console → Billing
2. Verifica que tengas una cuenta de facturación activa
3. Agrega $200 USD de crédito gratuito (si es tu primera vez)
```

---

## 📊 Verificación en Firebase

### Cómo Verificar que las Coordenadas Se Guardaron

```
1. Ve a Firebase Console
2. Realtime Database
3. Expande: orders → {orderId} → customerLocation

DEBERÍAS VER:
{
  "latitude": 23.6345,
  "longitude": -102.5528,
  "timestamp": 1712000000000,
  "accuracy": 10
}
```

---

## 🎯 Flujo Completo Correcto

```
USUARIO → Permite ubicación
   ↓
NAVEGADOR → Obtiene coordenadas GPS
   ↓
CÓDIGO → Guarda en Firebase (customerLocation)
   ↓
RESTAURANTE → Ve ubicación en tiempo real
   ↓
MAPA → Muestra marcador verde en ubicación del cliente
```

**Si todos los pasos funcionan:** ✅ ¡ÉXITO!

---

## 📞 Comandos Útiles

### Limpiar Caché y Reinstalar
```bash
cd "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\cliente-web"
rm -rf node_modules package-lock.json
npm install
```

### Build de Producción
```bash
npm run build
npm run preview
```

### Ver Logs de Vercel
```
1. Vercel Dashboard → Tu proyecto
2. Deployments → Click en el último
3. Funciones → Ver logs
```

---

## ⚡ Solución Rápida (5 minutos)

Si algo falla, haz esto:

```bash
# 1. Actualizar variables en Vercel
cd "c:\Users\Jorge G\AndroidStudioProjects\Prueba New"
.\update-vercel-env.bat

# 2. Forzar redespliegue
git add .
git commit -m "Force redeploy - geolocation fix"
git push

# 3. Esperar 2-3 minutos

# 4. Probar en incógnito
Ctrl + Shift + N
https://tu-proyecto.vercel.app

# 5. Si persiste el problema, revisar consola (F12)
```

---

## 📝 Recursos

- **Documentación Completa:** `VERIFICACION_GEOLOCALIZACION_COMPLETA.md`
- **Firebase Console:** https://console.firebase.google.com/project/proyecto-new-37f18
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Google Cloud Console:** https://console.cloud.google.com/

---

**Última Actualización:** Abril 1, 2026  
**Estado:** ✅ Todo Verificado y Funcionando
