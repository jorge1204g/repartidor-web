# 🚀 Configuración Rápida - Variables de Entorno en Vercel

## ⚡ Método 1: Dashboard Web (Recomendado)

### Paso 1: Abrir Vercel Dashboard
```
https://vercel.com/dashboard
```

### Paso 2: Seleccionar Proyecto
- Busca tu proyecto `cliente-web` o el nombre que tenga
- Click en el nombre del proyecto

### Paso 3: Ir a Configuración
- Click en **Settings** (pestaña superior)
- Click en **Environment Variables** (menú izquierdo)

### Paso 4: Agregar Variables
Click en **"New Variable"** y agrega UNA POR UNA:

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyDT6lLWCT2pzns4LR_tCy-vafyVoBSe3jo` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `proyecto-new-37f18.firebaseapp.com` |
| `VITE_FIREBASE_DATABASE_URL` | `https://proyecto-new-37f18-default-rtdb.firebaseio.com` |
| `VITE_FIREBASE_PROJECT_ID` | `proyecto-new-37f18` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `proyecto-new-37f18.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `253121042757` |
| `VITE_FIREBASE_APP_ID` | `1:253121042757:web:92654439c7cc02b08b862c` |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSyCjqlvk5RqykmtVyjYwe6vF0QWxZ9RFRYE` |

**IMPORTANTE:** 
- ✅ El "Name" debe ser EXACTAMENTE como está arriba (incluyendo `VITE_`)
- ✅ El "Value" debe ser exactamente el valor proporcionado
- ✅ No agregues espacios antes o después
- ✅ Asegúrate de que no haya caracteres extraños

### Paso 5: Guardar Cada Variable
- Después de escribir cada variable, click en **Save**
- Repite para las 8 variables

### Paso 6: Redeploy
Una vez agregadas TODAS las variables:

1. Ve a **Deployments** (pestaña superior)
2. Click en los **⋮** (tres puntos) del deployment más reciente
3. Click en **Redeploy**
4. Confirma con **Redeploy** nuevamente

**Espera 2-5 minutos** a que el deploy se complete.

---

## ⚡ Método 2: Vercel CLI (Automático)

### Prerrequisitos
Tener Vercel CLI instalado:
```powershell
npm install -g vercel
```

### Paso 1: Iniciar Sesión
```powershell
vercel login
```

### Paso 2: Navegar al Proyecto
```powershell
cd "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\cliente-web"
```

### Paso 3: Vincular Proyecto
```powershell
vercel link
```
- Selecciona tu cuenta
- Selecciona el proyecto existente
- O crea uno nuevo si no existe

### Paso 4: Pull de Variables (si ya existen en Vercel)
```powershell
vercel env pull
```

### Paso 5: Push de Variables Locales
```powershell
# Esto sube las variables de .env.local a Vercel
vercel env add VITE_FIREBASE_API_KEY AIzaSyDT6lLWCT2pzns4LR_tCy-vafyVoBSe3jo
vercel env add VITE_FIREBASE_AUTH_DOMAIN proyecto-new-37f18.firebaseapp.com
vercel env add VITE_FIREBASE_DATABASE_URL https://proyecto-new-37f18-default-rtdb.firebaseio.com
vercel env add VITE_FIREBASE_PROJECT_ID proyecto-new-37f18
vercel env add VITE_FIREBASE_STORAGE_BUCKET proyecto-new-37f18.firebasestorage.app
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID 253121042757
vercel env add VITE_FIREBASE_APP_ID 1:253121042757:web:92654439c7cc02b08b862c
vercel env add VITE_GOOGLE_MAPS_API_KEY AIzaSyCjqlvk5RqykmtVyjYwe6vF0QWxZ9RFRYE
```

### Paso 6: Deploy
```powershell
vercel --prod
```

---

## ✅ Verificación Post-Configuración

### Test 1: Verificar en Vercel Dashboard
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Verifica que las 8 variables estén listadas

### Test 2: Verificar Deploy Exitoso
1. Ve a Deployments
2. El más reciente debe decir **"Ready"** (verde)
3. Click en **"Visit"** para abrir la app

### Test 3: Verificar en la App
Abre la app y presiona F12 (Consola):

```javascript
// Ejecuta en la consola del navegador:
console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY);
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
```

**Resultado esperado:** Deberías ver los valores reales, NO `undefined`

### Test 4: Probar Geolocalización
1. Abre tu app en Vercel (ej: `https://tu-proyecto.vercel.app`)
2. Navega a un pedido con seguimiento
3. Debería aparecer el prompt de ubicación
4. Permite el acceso
5. Verifica en consola (F12) que diga:
   ```
   ✅ [UBICACIÓN] Permiso concedido. Ubicación: {...}
   💾 [FIREBASE] Guardando coordenadas...
   ✅ [FIREBASE] Coordenadas guardadas exitosamente
   ```

---

## 🐛 Solución de Problemas Comunes

### Problema: Las variables no se aplican

**Síntoma:** La app dice `undefined` para las variables

**Solución:**
1. Verifica que los nombres sean EXACTOS (incluyendo `VITE_`)
2. Haz un **Redeploy** manual desde Vercel
3. Limpia caché del navegador (Ctrl + Shift + Supr)

---

### Problema: Error "Failed to fetch" en Firebase

**Síntoma:** Consola muestra errores de conexión a Firebase

**Solución:**
1. Verifica que `VITE_FIREBASE_DATABASE_URL` sea correcta
2. Debe empezar con `https://` y terminar en `firestore.com` o `firebaseio.com`
3. Verifica reglas de Firebase (deben permitir lectura/escritura)

---

### Problema: Google Maps no carga

**Síntoma:** Mapa aparece gris o con error

**Solución:**
1. Verifica que `VITE_GOOGLE_MAPS_API_KEY` esté configurada
2. Ve a Google Cloud Console: https://console.cloud.google.com/apis/credentials
3. Verifica que la API Key esté habilitada para:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Verifica que no haya restricciones de HTTP referrer muy estrictas

---

### Problema: Geolocalización no funciona

**Síntoma:** Prompt no aparece o error de permisos

**Causas posibles:**
1. ❌ Usuario denegó permisos previamente
2. ❌ Sitio no usa HTTPS (Vercel usa HTTPS automático)
3. ❌ Navegador no soporta geolocalización

**Solución:**
1. Click en 🔒 junto a la URL
2. Configuración del sitio → Ubicación → Permitir
3. Recargar página (F5)
4. Si persiste, probar en modo incógnito

---

## 📋 Checklist Final

Antes de considerar el problema resuelto:

- [ ] Las 8 variables están en Vercel Dashboard
- [ ] Los nombres son EXACTOS (incluyendo `VITE_`)
- [ ] Se hizo Redeploy después de configurar variables
- [ ] El deploy está en estado "Ready" (verde)
- [ ] La URL usa HTTPS (`https://...`)
- [ ] Consola del navegador NO muestra `undefined` en variables
- [ ] Firebase está conectado (sin errores en consola)
- [ ] Google Maps carga correctamente
- [ ] Prompt de geolocalización aparece
- [ ] Coordenadas se guardan en Firebase (ver consola)

---

## 🆘 Contacto y Soporte

Si después de seguir esta guía el problema persiste, proporciona:

1. **URL de tu app en Vercel**
2. **Captura de pantalla de Environment Variables en Vercel** (ocultando valores)
3. **Errores en consola del navegador** (F12)
4. **Estado del deploy** en Vercel

---

## 💡 Tips Profesionales

1. **Variables por entorno:** Vercel permite tener variables diferentes para Development/Preview/Production
2. **No commits .env:** El archivo `.env.local` está en `.gitignore` por seguridad
3. **Rotación de keys:** Cambia tus API Keys periódicamente por seguridad
4. **Monitoreo:** Usa Firebase Monitoring para ver uso de la base de datos

---

**Fecha de actualización:** 2 de abril de 2026  
**Proyecto:** cliente-web  
**Plataforma:** Vercel + Firebase
