# 📋 VERIFICACIÓN RÁPIDA - Geolocalización Vercel

## ⚡ Antes de Empezar (2 minutos)

### 1. ¿El código está actualizado?
```bash
cd "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\cliente-web"
git log --oneline -3
```
✅ Deberías ver commits recientes

---

## 🔧 Configuración en Vercel (5 minutos)

### 2. Variables de Entorno

**URL:** https://vercel.com/dashboard

**Pasos:**
1. Selecciona proyecto `cliente-web`
2. Settings → Environment Variables
3. Verifica estas 8 variables:

| Variable | ¿Existe? | Valor Correcto? |
|----------|----------|-----------------|
| `VITE_FIREBASE_API_KEY` | ☐ | ☐ |
| `VITE_FIREBASE_AUTH_DOMAIN` | ☐ | ☐ |
| `VITE_FIREBASE_DATABASE_URL` | ☐ | ☐ |
| `VITE_FIREBASE_PROJECT_ID` | ☐ | ☐ |
| `VITE_FIREBASE_STORAGE_BUCKET` | ☐ | ☐ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ☐ | ☐ |
| `VITE_FIREBASE_APP_ID` | ☐ | ☐ |
| `VITE_GOOGLE_MAPS_API_KEY` | ☐ | ☐ |

**Si falta alguna:** Agregarla manualmente → Save

---

## 🚀 Deploy (3 minutos)

### 3. Forzar Nuevo Deploy

```bash
cd "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\cliente-web"
git status
git add .
git commit -m "actualizar configuracion"
git push origin main
```

**Esperar:** 2-5 minutos

---

## ✅ Verificación Final (3 minutos)

### 4. En Vercel Dashboard

- [ ] Deployment dice **"Ready"** (verde)
- [ ] URL usa **HTTPS** (`https://...`)
- [ ] No hay errores en deploy

### 5. En el Navegador

Abre tu app y presiona **F12**:

**Consola debe mostrar:**
```
🔍 Iniciando búsqueda...
📍 [PERMISOS] Iniciando solicitud de permiso...
⏳ [PERMISOS] Solicitando ubicación actual al usuario...
💡 [INFO] Debería aparecer el prompt del navegador
```

**Debe aparecer:** Prompt del navegador preguntando por ubicación

**Si permites:**
```
✅ [UBICACIÓN] Permiso concedido. Ubicación: {...}
💾 [FIREBASE] Guardando coordenadas del cliente en Firebase...
✅ [FIREBASE] Coordenadas guardadas exitosamente
📊 [INFO] El restaurante ahora puede ver la ubicación
```

---

## 🎯 Resultado Esperado

- ✅ Prompt de geolocalización aparece **SIEMPRE**
- ✅ Coordenadas se guardan en Firebase automáticamente
- ✅ Restaurante ve ubicación del cliente en tiempo real
- ✅ Mapa muestra marcador verde en ubicación del cliente

---

## ❌ Si Algo Falla

### Problema: Variables no aparecen

**Solución:**
1. Verifica nombres EXACTOS (incluyendo `VITE_`)
2. Haz Redeploy manual desde Vercel
3. Limpia caché del navegador

### Problema: Prompt no aparece

**Causa:** Usuario denegó permisos antes

**Solución:**
1. Click en 🔒 junto a la URL
2. Configuración del sitio → Ubicación → Permitir
3. Recargar página (F5)

### Problema: Error de Firebase

**Causa:** Variables mal configuradas

**Solución:**
1. Verifica las 7 variables de Firebase en Vercel
2. Compara con `.env.local` (deben ser idénticas)
3. Redeploy

---

## 📞 Información de Soporte

Si necesitas ayuda, proporciona:

1. **URL de Vercel:** _________________________
2. **Variables configuradas:** ☐ Sí  ☐ No
3. **Deploy exitoso:** ☐ Sí  ☐ No
4. **Errores en consola:** _________________________
5. **¿Prompt aparece?** ☐ Sí  ☐ No

---

## ✅ Checklist Completo

**Configuración:**
- [ ] 8 variables en Vercel Dashboard
- [ ] Nombres exactos (con `VITE_`)
- [ ] Values correctos

**Deploy:**
- [ ] Git push completado
- [ ] Deploy en Vercel = "Ready"
- [ ] URL con HTTPS

**Funcionalidad:**
- [ ] Prompt de geolocalización aparece
- [ ] Coordenadas se guardan en Firebase
- [ ] Mapa muestra marcadores
- [ ] Restaurante ve ubicación

---

**Tiempo total estimado:** 10-15 minutos  
**Dificultad:** Fácil-Medio  
**Requiere:** Acceso a Vercel Dashboard

---

## 💡 Tip Importante

**Las variables de entorno NO se actualizan automáticamente.**
Cada vez que cambies algo en `.env.local`, debes:
1. Actualizar manualmente en Vercel Dashboard
2. Hacer Redeploy para que surtan efecto

---

**Versión:** 1.0  
**Fecha:** 2 abril 2026  
**Proyecto:** cliente-web / Vercel
