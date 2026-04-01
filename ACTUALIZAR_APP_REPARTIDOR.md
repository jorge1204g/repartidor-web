# 📱 Actualización App Repartidor - Firebase Storage

## ✅ Cambios Realizados

### 1. **Agregado Firebase Storage**
- Archivo: `build.gradle.kts`
- Se agregó: `implementation(libs.firebase.storage.ktx)`

### 2. **Actualizado MessageRepository.kt**
- Ahora usa Firebase Storage para subir imágenes
- Comprime imágenes automáticamente (800x800px, JPEG 70%)
- Guarda URLs en lugar de Base64
- Función `compressImage()` agregada

### 3. **Actualizado ClientChatScreen.kt**
- Comprime imágenes antes de enviar (si son >500KB)
- Mejor manejo de errores
- Función `compressImage()` agregada

## 🔧 Cómo Compilar la APK

### Opción 1: Android Studio (Recomendado)

1. **Abrir proyecto en Android Studio**
   ```
   File → Open → app-repartidor
   ```

2. **Sincronizar Gradle**
   - Android Studio detectará los cambios automáticamente
   - Esperar a que termine "Sync Now"

3. **Limpiar proyecto**
   ```
   Build → Clean Project
   ```

4. **Reconstruir proyecto**
   ```
   Build → Rebuild Project
   ```

5. **Generar APK**
   ```
   Build → Build Bundle(s) / APK(s) → Build APK(s)
   ```

6. **APK generada en:**
   ```
   app-repartidor/build/outputs/apk/debug/app-debug.apk
   ```

### Opción 2: Línea de Comandos

```bash
cd "c:\1234\Nueva carpeta (22)\apl\Prueba New\app-repartidor"

# Limpiar
gradlew clean

# Construir APK debug
gradlew assembleDebug

# APK estará en:
# app-repartidor/build/outputs/apk/debug/app-debug.apk
```

## 📋 Verificaciones

### ✅ Antes de Instalar

1. **Verifica que las reglas de Firebase Storage permitan lectura/escritura:**

```json
{
  "rules": {
    "images": {
      "$image_id": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

2. **Configura Firebase Storage en Firebase Console:**
   - Ve a Firebase Console → Storage
   - Si no está configurado, haz clic en "Get Started"
   - Elige comenzar en modo de prueba

### 📱 Instalación en Dispositivo

1. **Habilitar instalación desde fuentes desconocidas**
   - Settings → Security → Unknown Sources (activar)

2. **Transferir APK al dispositivo**
   - USB, email, Google Drive, etc.

3. **Instalar APK**
   - Abrir archivo APK en el dispositivo
   - Seguir instrucciones de instalación

## 🎯 Flujo Actualizado

### Cliente Web → Repartidor Móvil

```
1. Cliente selecciona imagen
2. Se comprime (800x800, JPEG 70%)
3. Se sube a Firebase Storage
4. Se obtiene URL pública
5. Se guarda URL + metadata en Database
6. Repartidor recibe notificación
7. Repartidor abre chat
8. Coil carga imagen desde URL
```

### Repartidor Móvil → Cliente Web

```
1. Repartidor selecciona imagen
2. Se comprime (si es >500KB)
3. Se convierte a Base64
4. Se envía al ViewModel
5. Repository sube a Firebase Storage
6. Se obtiene URL pública
7. Se guarda URL + metadata en Database
8. Cliente web recibe actualización
9. Imagen se muestra automáticamente
```

## 🐛 Solución de Problemas

### Error: "FirebaseStorage no encontrado"
- Ejecutar: `gradlew --refresh-dependencies`
- Reiniciar Android Studio

### Error: "Permission denied" en Storage
- Verificar reglas de Firebase Storage
- Asegurar que Storage esté habilitado en Firebase Console

### Las imágenes no se muestran
- Verificar que Coil esté correctamente importado
- Chequear logs de LogCat para errores de carga

### APK no se instala
- Verificar "Unknown Sources" habilitado
- Intentar con APK de debug en lugar de release

## 📊 Beneficios

✅ **Imágenes ilimitadas** en tamaño  
✅ **Carga más rápida** desde CDN  
✅ **Base de datos ligera** (solo URLs)  
✅ **Sin errores** de tamaño máximo  
✅ **Funciona en ambos lados** (web y móvil)  

## 🚀 Pruebas

1. **Desde la app del repartidor:**
   - Abrir chat con cliente
   - Enviar imagen
   - Verificar que aparezca en la web del cliente

2. **Desde la web del cliente:**
   - Abrir chat con repartidor
   - Enviar imagen
   - Verificar que aparezca en la app del repartidor

## 📝 Notas

- Las imágenes se comprimen automáticamente para ahorrar espacio
- Firebase Storage tiene 5GB gratis en el plan Spark
- Las URLs son públicas y accesibles desde cualquier dispositivo
- No hay límite de almacenamiento total (depende del plan Firebase)
