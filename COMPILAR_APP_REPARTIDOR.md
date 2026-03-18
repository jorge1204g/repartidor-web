# 🚀 GUÍA RÁPIDA - COMPILAR APP REPARTIDOR

## ⚠️ PROBLEMA DETECTADO

**Error:** `JAVA_HOME is not set and no 'java' command could be found`

**Causa:** No tenés Java instalado o no está en el PATH del sistema.

---

## ✅ SOLUCIONES DISPONIBLES

### **Opción 1: Usar Android Studio (RECOMENDADA)**

Si tenés Android Studio instalado, es la forma más fácil:

#### **Pasos:**
1. **Abrir Android Studio**
2. **File > Open** → Seleccionar la carpeta `Prueba New`
3. **Esperar que sincronice Gradle**
4. **Seleccionar módulo `app-repartidor`**
5. **Presionar `Shift + F10`** o click en el botón ▶️ Run
6. **¡Listo!** La app compilará automáticamente

#### **Ventajas:**
- ✅ No necesitas configurar JAVA_HOME manualmente
- ✅ Android Studio usa su propio JDK
- ✅ Podés ver errores directamente en el editor
- ✅ Debugging integrado

---

### **Opción 2: Instalar Java Manualmente**

Si querés compilar desde terminal sin Android Studio:

#### **Paso 1: Descargar Java**
- Ir a: https://www.oracle.com/java/technologies/downloads/
- Descargar **JDK 17** (recomendado para Android)
- O usar OpenJDK: https://adoptium.net/

#### **Paso 2: Instalar Java**
- Ejecutar el instalador
- Seguir los pasos (Next, Next, Install)
- Anotar la ruta de instalación (ej: `C:\Program Files\Java\jdk-17`)

#### **Paso 3: Configurar JAVA_HOME**

**Windows 10/11:**
```
1. Click derecho en "Este equipo" → Propiedades
2. "Configuración avanzada del sistema"
3. Pestaña "Opciones avanzadas" → Variables de entorno
4. En "Variables del sistema" → Nueva
5. Nombre: JAVA_HOME
6. Valor: C:\Program Files\Java\jdk-17 (tu ruta)
7. Aceptar todo
```

**PowerShell (temporal):**
```powershell
$env:JAVA_HOME="C:\Program Files\Java\jdk-17"
```

#### **Paso 4: Verificar instalación**
```powershell
java -version
```

Debería mostrar:
```
java version "17.x.x"
```

#### **Paso 5: Compilar**
```powershell
cd "c:\1234\Nueva carpeta (22)\apl\Prueba New"
.\gradlew.bat assembleDebug
```

---

### **Opción 3: Usar JDK Incluido con Android Studio**

Si tenés Android Studio pero querés compilar desde terminal:

#### **Encontrar el JDK de Android Studio:**

**Ruta típica:**
```
C:\Program Files\Android\Android Studio\jbr
```

#### **Configurar en PowerShell:**
```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
cd "c:\1234\Nueva carpeta (22)\apl\Prueba New"
.\gradlew.bat assembleDebug
```

---

## 🔍 VERIFICAR SI ANDROID STUDIO ESTÁ INSTALADO

### **Buscar en PowerShell:**
```powershell
Test-Path "C:\Program Files\Android\Android Studio"
```

Si devuelve `True`, ¡tenés Android Studio instalado!

### **Buscar el ejecutable:**
```powershell
Get-ChildItem "C:\Program Files\Android\Android Studio" -Filter "studio64.exe" -Recurse
```

---

## 📱 PROBAR EN EMULADOR O DISPOSITIVO

### **Una vez compilado exitosamente:**

#### **Opción A: Emulador**
1. Android Studio → Device Manager
2. Crear dispositivo virtual
3. Presionar Play ▶️
4. La app se instalará automáticamente

#### **Opción B: Dispositivo Real**
1. Activar **Depuración USB** en tu celular
2. Conectar por USB a la PC
3. Android Studio detectará el dispositivo
4. Presionar Run ▶️

---

## 🎯 COMANDOS ÚTILES

### **Compilar Debug:**
```powershell
.\gradlew.bat assembleDebug
```

### **Compilar Release:**
```powershell
.\gradlew.bat assembleRelease
```

### **Limpiar proyecto:**
```powershell
.\gradlew.bat clean
```

### **Instalar en dispositivo:**
```powershell
.\gradlew.bat installDebug
```

### **Ver ayuda:**
```powershell
.\gradlew.bat tasks
```

---

## 🐛 SOLUCIÓN DE ERRORES COMUNES

### **Error: "SDK not found"**
```
Solución: Abrir desde Android Studio y dejar que configure el SDK
```

### **Error: "Gradle sync failed"**
```
Solución: File > Invalidate Caches / Restart
```

### **Error: "No connected devices"**
```
Solución: 
1. Conectar celular por USB
2. Activar depuración USB
3. Revisar drivers USB instalados
```

### **Error: "Build failed with exception"**
```
Solución:
1. Leer el mensaje de error completo
2. Buscar en Google el error específico
3. Limpiar proyecto: .\gradlew.bat clean
```

---

## 📊 UBICACIÓN DEL APK

Una vez compilado, el APK estará en:

```
app-repartidor/build/outputs/apk/debug/app-repartidor-debug.apk
```

Para instalar manualmente:
```powershell
adb install app-repartidor/build/outputs/apk/debug/app-repartidor-debug.apk
```

---

## 💡 CONSEJOS PROFESIONALES

### **1. Siempre usar Android Studio**
- Es más fácil que configurar todo manualmente
- Incluye todo lo necesario (JDK, SDK, emuladores)
- Actualizaciones automáticas

### **2. Mantener actualizado**
- Android Studio actualizado
- SDK Tools actualizados
- Gradle actualizado

### **3. Backup del proyecto**
- Copiar toda la carpeta antes de cambios grandes
- Usar Git para control de versiones
- Sincronizar con GitHub/GitLab

### **4. Testing**
- Probar en múltiples dispositivos
- Usar emuladores para diferentes versiones de Android
- Testear en modo avión (sin internet)

---

## 🎉 CHECKLIST FINAL

Antes de compilar, verificar:

- [ ] Android Studio instalado (recomendado)
- [ ] O Java JDK instalado y configurado
- [ ] JAVA_HOME configurado (si usás terminal)
- [ ] SDK de Android disponible
- [ ] Gradle funcionando
- [ ] Dispositivo/emulador listo (opcional)

Después de compilar:

- [ ] APK generado exitosamente
- [ ] Sin errores de compilación
- [ ] App abre correctamente
- [ ] UI se ve como esperado
- [ ] Todas las funciones trabajan
- [ ] Colores consistentes

---

## 📞 SOPORTE RÁPIDO

### **¿Tenés Android Studio?**
👉 **Usalo para compilar** - Es la forma más fácil y segura

### **¿No tenés Android Studio?**
👉 **Instalalo primero** - https://developer.android.com/studio

### **¿Querés compilar rápido?**
👉 **Seguí la Opción 3** - Usar JDK de Android Studio

---

**¿Necesitás ayuda con algún paso específico?** ¡Decime y te ayudo! 🚀
