# 🔔 Sonido de Notificación para Pedidos Nuevos

## Instrucciones:

### Opción 1: Descargar un sonido gratuito

1. Descarga un sonido de notificación desde alguno de estos sitios:
   - [Freesound.org](https://freesound.org/search/?q=notification+sound)
   - [Zapsplat.com](https://www.zapsplat.com/music/notifications/)
   - [Mixkit.co](https://mixkit.co/free-sound-effects/notification/)

2. Busca un sonido corto y agradable (recomendado: 1-3 segundos)

3. Convierte el archivo a formato **MP3** o **WAV** si es necesario

4. Renombra el archivo a: `new_order_notification.mp3`

5. Coloca el archivo en esta carpeta:
   ```
   app/src/main/res/raw/new_order_notification.mp3
   ```

### Opción 2: Usar un sonido del sistema Android

Puedes usar uno de los sonidos predeterminados de Android modificando el código en `SoundNotificationService.kt`:

```kotlin
// En lugar de usar R.raw.new_order_notification
// Usar un tono del sistema
val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
mediaPlayer = MediaPlayer.create(context, uri)
```

### Opción 3: Generar un tono simple online

1. Usa [ToneGenerator.com](https://tonegenerator.com/)
2. Genera un tono de 2 segundos con frecuencia de 800-1000 Hz
3. Descarga y guarda como `new_order_notification.wav`
4. Colócalo en `app/src/main/res/raw/`

## Formatos Soportados:

- ✅ `.mp3` (Recomendado - menor tamaño)
- ✅ `.wav` (Mejor calidad, mayor tamaño)
- ✅ `.ogg` (Alternativa)
- ✅ `.m4a`

## Volumen:

El sonido se reproducirá al volumen máximo de notificaciones del dispositivo.

## Importante:

⚠️ **Sin este archivo de sonido, la compilación fallará.**

Asegúrate de agregar el archivo antes de compilar la aplicación.
