# 🔔 GUÍA RÁPIDA: Notificación de Sonido para Pedidos Nuevos

## ✅ ¿Qué se implementó?

La app del administrador **ahora reproduce un sonido automáticamente** cuando llega un pedido nuevo, ya sea creado por un cliente o restaurante.

---

## 🎵 OPCIONES DE SONIDO

### Opción 1: Sonido del Sistema (YA FUNCIONA)
✅ **No necesitas hacer nada** - Usa el tono de notificación predeterminado de Android

### Opción 2: Sonido Personalizado (OPCIONAL)
🎵 Si quieres un sonido específico:

1. **Descarga un sonido gratuito**:
   - [Freesound.org](https://freesound.org/search/?q=notification+sound)
   - [Zapsplat.com](https://www.zapsplat.com/music/notifications/)
   - [Mixkit.co](https://mixkit.co/free-sound-effects/notification/)

2. **Guárdalo como**: `new_order_notification.mp3`

3. **Colócalo en**: 
   ```
   app/src/main/res/raw/new_order_notification.mp3
   ```

4. **Compila la app** y ¡listo!

---

## 🧪 CÓMO PROBAR QUE FUNCIONA

### Prueba Rápida (2 minutos):

```
1. 📱 Abre la app del administrador
2. 🏠 Mantén la app abierta (puedes minimizarla)
3. 👤 Desde la app del cliente → Crear un pedido nuevo
4. 🔊 Escucharás el sonido inmediatamente
5. 📊 Revisa el Logcat (Android Studio) para ver:
   "🔔 ¡PEDIDO NUEVO DETECTADO!"
```

### ¿Qué debe pasar?
- ✅ Suena una notificación
- ✅ En el Logcat aparece información del pedido
- ✅ El sonido se reproduce solo UNA vez
- ✅ Solo suena para pedidos ACTIVOS (no entregados/cancelados)

---

## 📊 COMPORTAMIENTO

| Situación | ¿Suena? |
|-----------|---------|
| 🆕 Pedido nuevo de cliente | ✅ SÍ |
| 🆕 Pedido nuevo de restaurante | ✅ SÍ |
| 🔄 Pedido cambia de estado | ❌ NO |
| ✅ Pedido entregado | ❌ NO |
| ❌ Pedido cancelado | ❌ NO |
| 📱 App en segundo plano | ✅ SÍ (si está en memoria) |

---

## 🔍 SOLUCIÓN DE PROBLEMAS

### ❌ No suena cuando llega un pedido

**Verifica:**
1. ✅ Volumen de notificaciones del teléfono activado
2. ✅ La app del administrador está abierta (no cerrada completamente)
3. ✅ El pedido es nuevo y activo (PENDING, ASSIGNED, etc.)
4. ✅ Revisa el Logcat en busca de errores

**Logs que debes buscar:**
```
🔔 ¡PEDIDO NUEVO DETECTADO! ID: xxx, Status: PENDING
   Cliente: Juan Pérez
   Servicio: FOOD
🔊 Reproduciendo sonido de notificación...
```

### 🔊 Sonido muy bajo

**Soluciones:**
- Sube el volumen de notificaciones del dispositivo
- Usa un archivo de sonido más fuerte/voluminoso
- Prueba con tono de alarma (ver configuración avanzada)

### ⚠️ Error al compilar "Resource raw not found"

**No es un error crítico** - El sistema usará automáticamente el tono del sistema Android.

Si quieres usar sonido personalizado:
- Asegúrate de que el archivo esté en: `app/src/main/res/raw/new_order_notification.mp3`
- Formatos soportados: `.mp3`, `.wav`, `.ogg`, `.m4a`

---

## ⚙️ CONFIGURACIÓN AVANZADA (Opcional)

### Cambiar tipo de sonido del sistema

En `SoundNotificationService.kt` (línea ~29), cambiar:

```kotlin
// Default: Notificación normal
android.media.RingtoneManager.getDefaultUri(
    android.media.RingtoneManager.TYPE_NOTIFICATION
)

// Más fuerte: Alarma
android.media.RingtoneManager.getDefaultUri(
    android.media.RingtoneManager.TYPE_ALARM
)

// Más fuerte: Timbre
android.media.RingtoneManager.getDefaultUri(
    android.media.RingtoneManager.TYPE_RINGTONE
)
```

---

## 📝 NOTAS IMPORTANTES

1. **Volumen**: El sonido usa el canal de notificaciones del sistema
2. **Segundo plano**: Funciona si la app está en memoria (no forzada)
3. **Batería**: Bajo consumo - no hay polling constante
4. **Automático**: No requiere configuración del usuario
5. **Flexible**: Puedes personalizar el sonido después

---

## 🎯 FLUJO DE TRABAJO RECOMENDADO

```
Administrador abre app → Deja en segundo plano
                    ↓
        Cliente crea pedido nuevo
                    ↓
        Firebase actualiza datos
                    ↓
     AdminViewModel detecta cambio
                    ↓
  SoundNotificationService reproduce sonido
                    ↓
    Administrador responde rápidamente ✨
```

---

## ✨ VENTAJAS

- ✅ **Respuesta rápida**: El admin sabe inmediatamente cuando hay pedido nuevo
- ✅ **Menos revisiones**: No necesita estar chequeando la pantalla constantemente
- ✅ **Automático**: Funciona sin configuración
- ✅ **Personalizable**: Cada admin puede elegir su sonido favorito
- ✅ **Confiable**: Usa APIs nativas de Android

---

## 📞 ¿Necesitas Ayuda?

### Recursos adicionales:
- 📄 Documentación completa: `CAMBIOS_SONIDO_PEDIDOS_NUEVOS.md`
- 📊 Resumen ejecutivo: `RESUMEN_NOTIFICACION_SONIDO.md`
- 🎵 Instrucciones de sonido: `app/src/main/res/raw/README_SOUND.md`

### Logs de depuración:
Revisa en Android Studio → Logcat → Filtra por "SoundNotification"

---

**¡Listo! El administrador ahora será notificado con sonido cada vez que llegue un pedido nuevo 🎉**
