# 🧪 Guía Rápida de Prueba - Permisos de Ubicación

## 🎯 Objetivo
Verificar que al abrir el link de seguimiento compartido desde el restaurante, se solicite permiso de ubicación al usuario.

---

## 📋 Pasos de Prueba

### Paso 1: Compartir Pedido desde Restaurante
```
1. Abre: https://restaurante-web-teal.vercel.app/inicio
2. Inicia sesión como restaurante
3. Busca un pedido con estado "ACCEPTED" o en proceso
4. Haz clic en botón "🗺️ Seguimiento"
5. Se abrirá una nueva pestaña con el seguimiento
```

### Paso 2: Verificar Permiso de Ubicación
```
Al abrirse la página de seguimiento:
✅ Debería aparecer prompt del navegador pidiendo permiso de ubicación
✅ Mensaje similar a: "¿Permitir que cliente-web-mu.vercel.app acceda a tu ubicación?"
```

### Paso 3: Probar los 3 Escenarios

#### ✅ Escenario A: Usuario Permite
```
1. Haz clic en "Permitir" en el prompt
2. Abre consola (F12)
3. Deberías ver:
   - "📍 Solicitando permiso de ubicación..."
   - "⏳ Solicitando permiso de ubicación al usuario..."
   - "✅ Permiso concedido. Ubicación: {...}"
4. El mapa debería centrarse en tu ubicación actual
5. Deberías ver un marcador verde 🟢 en tu posición
```

#### ⏳ Escenario B: Usuario Deniega
```
1. Haz clic en "Bloquear" o "No permitir"
2. Abre consola (F12)
3. Deberías ver:
   - "📍 Solicitando permiso de ubicación..."
   - "❌ Permiso de ubicación denegado por el usuario"
4. El mapa muestra solo al repartidor (si está disponible)
5. NO vuelve a solicitar el permiso al recargar
```

#### 🔄 Escenario C: Permiso Previamente Concedido
```
1. Si ya permitiste el acceso antes
2. Al abrir el link NO aparece ningún prompt
3. En consola ves:
   - "📍 Solicitando permiso de ubicación..."
   - "✅ Permiso de ubicación ya concedido"
4. El mapa carga inmediatamente con tu ubicación
```

---

## 🔍 Verificación en Consola

### Console Logs Esperados

**Éxito:**
```
🔍 Iniciando búsqueda...
📋 Parámetros: {orderId: "...", phone: "...", orderCode: "..."}
📍 Solicitando permiso de ubicación...
⏳ Solicitando permiso de ubicación al usuario...
✅ Permiso concedido. Ubicación: {latitude: 19.4326, longitude: -99.1332}
🔥 Conectando a Firebase...
📦 Snapshot recibido: true
🗺️ Cargando mapa...
✅ Google Maps API cargada
✅ Mapa creado
✅ Marcador cliente agregado
```

**Denegado:**
```
🔍 Iniciando búsqueda...
📋 Parámetros: {...}
📍 Solicitando permiso de ubicación...
⚠️ Permiso denegado o error: User denied Geolocation
🔥 Conectando a Firebase...
...
```

---

## 📱 Pruebas en Diferentes Dispositivos

### Desktop (Chrome/Edge/Firefox)
```
1. Abre Chrome/Edge/Firefox
2. Ve al link de seguimiento
3. Prompt aparece en esquina superior izquierda
4. Permite/Bloquea
5. Verifica comportamiento del mapa
```

### Android (Chrome)
```
1. Abre Chrome en Android
2. Ve al link de seguimiento
3. Prompt aparece abajo con opciones "Permitir"/"Bloquear"
4. Selecciona una opción
5. El mapa debería funcionar correctamente
```

### iOS (Safari)
```
1. Abre Safari en iPhone
2. Ve al link de seguimiento
3. Alert nativa de iOS aparece
4. Toca "Permitir" o "Rechazar"
5. Verifica que el mapa cargue
```

---

## ✅ Checklist de Verificación

- [ ] Prompt de permiso aparece al cargar la página
- [ ] Al permitir, el mapa se centra en ubicación actual
- [ ] Al denegar, el mapa NO vuelve a pedir permiso
- [ ] El seguimiento del repartidor funciona igual
- [ ] Los logs en consola son claros
- [ ] No hay errores en consola
- [ ] Funciona en desktop y móvil

---

## 🐛 Posibles Problemas y Soluciones

### Problema: No aparece el prompt
**Causa:** Ya se había concedido/denegado antes
**Solución:** 
- Chrome: Configuración → Privacidad → Configuración de sitios → Ubicación
- Firefox: Opciones → Privacidad → Permisos → Ubicación
- Safari: Preferencias → Sitios web → Ubicación

### Problema: Error "Geolocalización no soportada"
**Causa:** Navegador antiguo o HTTP (no HTTPS)
**Solución:** Usar navegador moderno con HTTPS

### Problema: Timeout al obtener ubicación
**Causa:** GPS desactivado o señal débil
**Solución:** Activar GPS o esperar unos segundos

---

## 📊 Criterios de Aceptación

La implementación es exitosa si:

1. ✅ El prompt de ubicación aparece al cargar seguimiento
2. ✅ El usuario puede permitir o denegar
3. ✅ Si permite, el mapa muestra su ubicación
4. ✅ Si deniega, NO se vuelve a solicitar
5. ✅ El seguimiento del repartidor trabaja en ambos casos
6. ✅ No hay errores en consola
7. ✅ Funciona en desktop y móvil

---

## 🎉 Resultado Esperado

Al finalizar la prueba, deberías tener:

- Un sistema que solicita permisos de ubicación respetuosamente
- Usuarios que pueden compartir su ubicación opcionalmente
- Mapa que funciona con o sin permiso
- Experiencia de usuario mejorada
- Sin errores ni comportamientos extraños

---

## 📝 Notas Finales

**Importante:** 
- El permiso es por dominio (solo pide una vez por dominio)
- El usuario puede cambiar el permiso después en configuración del navegador
- La funcionalidad principal (ver repartidor) trabaja sin el permiso

**URLs de prueba:**
- Restaurante: https://restaurante-web-teal.vercel.app/inicio
- Seguimiento: https://cliente-web-mu.vercel.app/seguimiento?codigo=XXXX

¡Listo! 🚀
