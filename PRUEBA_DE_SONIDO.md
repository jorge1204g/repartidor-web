# 🔊 PRUEBA DE SONIDO - App Repartidor

## ✅ CÓDIGO AGREGADO EXITOSAMENTE

Se ha agregado una prueba de sonido automático en `MainActivity.kt` (líneas 46-49).

---

## 📋 ¿QUÉ HACE ESTE CÓDIGO?

```kotlin
// AGREGA ESTO PARA PROBAR SONIDO MANUALMENTE
delay(2000) // Esperar 2 segundos
SoundNotificationService.playNewOrderSound(this@MainActivity)
println("🔊 [TEST] Sonido de prueba reproducido")
```

**Funcionamiento:**
1. ⏱️ Espera 2 segundos después de que la app inicia
2. 🔊 Reproduce el sonido de notificación automáticamente
3. 📝 Imprime un log confirmando que se reprodujo

---

## 🧪 INSTRUCCIONES DE PRUEBA

### Paso 1: Compilar la App
```
Android Studio > Build > Make Project
```

O desde PowerShell:
```powershell
cd "c:\1234\Nueva carpeta (22)\apl\Prueba New"
.\gradlew assembleDebug
```

### Paso 2: Instalar en Dispositivo/Emulador
```
Run > Run 'app-repartidor'
```

O desde PowerShell:
```powershell
adb install -r app-repartidor/build/outputs/apk/debug/app-repartidor-debug.apk
```

### Paso 3: Abrir LogCat
```
Android Studio > Logcat (parte inferior)
```

**Filtros recomendados:**
- Filtra por: `SoundNotification`
- O filtra por: `repartidor`

### Paso 4: Iniciar la App
Abre la app del repartidor en tu dispositivo/emulador.

### Paso 5: Escuchar y Verificar

**Después de 2 segundos deberías:**

✅ **ESCUCHAR**: El sonido de notificación

✅ **VER EN LOGCAT**:
```
🔊 Reproduciendo sonido de pedido nuevo
✅ Sonido completado
🔇 Recursos liberados
🔊 [TEST] Sonido de prueba reproducido
```

---

## 🎯 RESULTADOS POSIBLES

### ✅ Resultado 1: EL SONIDO SUENA CORRECTAMENTE

**Lo que verás:**
```
🔊 Reproduciendo sonido de pedido nuevo
✅ Sonido completado
🔇 Recursos liberados
🔊 [TEST] Sonido de prueba reproducido
```

**Conclusión**: 
- ✅ El archivo de audio está bien
- ✅ MediaPlayer funciona correctamente
- ✅ El contexto es válido
- ✅ **El problema es la detección de pedidos, no el sonido**

**Siguiente paso**: Ir a la sección "Si el sonido SÍ funciona" abajo.

---

### ❌ Resultado 2: EL SONIDO NO SUENA PERO HAY LOGS

**Lo que verás:**
```
⚠️ Sonido personalizado no encontrado, usando tono del sistema
🔊 Reproduciendo sonido de pedido nuevo
```

**O posiblemente:**
```
❌ Error al reproducir sonido: [mensaje de error]
```

**Causas posibles:**

#### A. Archivo de audio no existe o tiene mal nombre
```powershell
# Verifica esto:
Test-Path "c:\1234\Nueva carpeta (22)\apl\Prueba New\app-repartidor\src\main\res\raw\new_order_notification.mp3"
```

**Debe retornar**: `True`

**Solución**:
1. Verifica que el archivo existe
2. Verifica que se llama EXACTAMENTE `new_order_notification.mp3` (todo minúsculas)
3. Limpia y recompila:
   ```powershell
   .\gradlew clean
   ```

#### B. Archivo de audio corrupto o formato inválido

**Verifica las características del archivo:**
- Formato: MP3 o WAV
- Tamaño: 50 KB - 200 KB
- Sample rate: 44.1 kHz o 48 kHz
- Bitrate: 128 kbps (CBR preferiblemente)

**Solución**:
1. Convierte el audio con Audacity u otra herramienta
2. Reemplaza el archivo
3. Limpia y recompila

#### C. Excepción en MediaPlayer

**Busca en LogCat sin filtros** para ver el error completo:
```
❌ Error al reproducir sonido: [detalle]
java.lang.Exception: [stack trace completo]
```

**Solución**: Copia el error completo y envíamelo.

---

### ❌ Resultado 3: NO HAY LOGS NI SONIDO

**Lo que verás:** Nada relacionado con SoundNotification

**Causas posibles:**

#### A. La app crashea antes de los 2 segundos

**Verifica en LogCat:**
```
FATAL EXCEPTION: main
Process: com.example.repartidor
java.lang.RuntimeException: [error]
```

**Solución**: Copia el crash y envíamelo.

#### B. El código no se ejecuta por algún motivo

**Verifica que el import esté correcto:**
```kotlin
import com.example.repartidor.utils.SoundNotificationService
```

Debe estar en las líneas 1-22 de MainActivity.kt.

**Solución**: 
1. Verifica que el archivo SoundNotificationService.kt existe
2. Verifica que el package es correcto
3. Limpia caché de Android Studio:
   ```
   File > Invalidate Caches / Restart
   ```

---

## 🎯 SI EL SONIDO SÍ FUNCIONA (Resultado 1)

### ✅ ¡EXCELENTE! El sistema de sonido está bien

**Significa que:**
- ✅ El archivo de audio es correcto
- ✅ MediaPlayer funciona perfectamente
- ✅ El contexto se guarda apropiadamente
- ✅ **El problema es OTRO lado**

### 🔍 El problema real es:

La detección de pedidos NO está funcionando. Revisa:

#### 1. Verifica si llegan logs de "PEDIDO NUEVO DETECTADO"

En LogCat, busca:
```
🔔 ¡PEDIDO NUEVO DETECTADO! Repartidor: [tu-id]
```

**Si NO aparece**: El problema es que los pedidos no llegan o el filtro no los detecta.

**Solución**: Agrega más logs como se describe en `DIAGNOSTICO_NO_SUENA.md`.

#### 2. Verifica los estados en Firebase

Entra a Firebase Console > Realtime Database y revisa:

```json
{
  "orders": {
    "pedido-nuevo": {
      "status": "ASSIGNED",  // ✅ Este estado SÍ se detecta
      "assignedToDeliveryId": "tu-id-de-repartidor",  // ✅ Debe coincidir exactamente
      "customer": { ... }
    }
  }
}
```

**Estados que SÍ detecta:**
- ✅ `ASSIGNED`
- ✅ `MANUAL_ASSIGNED`
- ✅ `ACCEPTED`

**Estados que NO detecta inicialmente:**
- ❌ `PENDING` (a menos que orderType sea MANUAL/RESTAURANT)
- ❌ Otros estados posteriores

#### 3. Verifica que el ID del repartidor coincida

En la app, cuando inicias sesión, verifica:
```
Tu ID de repartidor: [abc123]
```

En Firebase, el pedido debe tener:
```json
"assignedToDeliveryId": "abc123"
```

¡Deben ser IDÉNTICOS!

---

## 🔧 CÓMO REMOVER LA PRUEBA DESPUÉS

Una vez que hayas verificado que el sonido funciona:

### Opción 1: Comentar el código (Recomendado)

```kotlin
LaunchedEffect(Unit) {
    viewModel.initialize(this@MainActivity)
    NotificationHelper.createNotificationChannel(this@MainActivity)
    
    // COMENTAR ESTO DESPUÉS DE LA PRUEBA
    // delay(2000)
    // SoundNotificationService.playNewOrderSound(this@MainActivity)
    // println("🔊 [TEST] Sonido de prueba reproducido")
}
```

### Opción 2: Eliminar completamente

```kotlin
LaunchedEffect(Unit) {
    viewModel.initialize(this@MainActivity)
    NotificationHelper.createNotificationChannel(this@MainActivity)
}
```

---

## 📊 RESUMEN DE DIAGNÓSTICO

| Resultado | Conclusión | Siguiente Acción |
|-----------|-----------|------------------|
| ✅ Sonido suena + Logs OK | Sistema de sonido funciona | Diagnosticar detección de pedidos |
| ⚠️ Suena tono del sistema | Archivo no encontrado | Verificar ruta/nombre del archivo |
| ❌ Error en logs | Excepción en MediaPlayer | Enviar error completo |
| ❌ Sin logs ni sonido | Código no se ejecuta | Verificar imports y crashes |

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DE LA PRUEBA

### Si el sonido FUNCIONA:
1. Comenta o elimina el código de prueba
2. Enfócate en diagnosticar por qué no llega "PEDIDO NUEVO DETECTADO"
3. Revisa Firebase y los filtros del repositorio
4. Agrega logs extra como se describe en `DIAGNOSTICO_NO_SUENA.md`

### Si el sonido NO FUNCIONA:
1. Sigue las soluciones específicas para tu caso
2. Verifica el archivo de audio
3. Limpia y recompila el proyecto
4. Envíame los errores completos que aparezcan

---

## 📞 NECESITO QUE ME DIGAS:

Después de hacer la prueba, dime:

1. **¿Escuchaste el sonido?** Sí/No
2. **¿Qué logs ves en LogCat?** (Copia y pega)
3. **¿Hubo algún error?** (Copia y pega el error completo)

Con esa información podré decirte EXACTAMENTE cuál es el problema.

---

**Fecha**: Martes, 24 de Marzo de 2026  
**Estado**: 🔊 Listo para probar  
**Código agregado**: MainActivity.kt líneas 46-49
