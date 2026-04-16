# FITNESS CENTER GYM Web - Configuración de Firebase y Vercel

## 📋 PASOS PARA CONFIGURAR FIREBASE

### 1. Crear proyecto en Firebase
1. Ve a https://console.firebase.google.com/
2. Haz clic en "Agregar proyecto"
3. Ponle un nombre (ej: "rutinas-gym-web")
4. Deshabilita Google Analytics (no es necesario)
5. Haz clic en "Crear proyecto"

### 2. Configurar Realtime Database
1. En el panel izquierdo, haz clic en **Realtime Database**
2. Haz clic en **Crear base de datos**
3. Selecciona la ubicación (elige la más cercana a ti)
4. **IMPORTANTE**: Selecciona **Modo de prueba** (para desarrollo)
5. Haz clic en **Habilitar**

### 3. Obtener credenciales de Firebase
1. Ve a **Configuración del proyecto** (engranaje ⚙️ en el panel izquierdo)
2. Baja hasta **Tus apps**
3. Haz clic en el ícono de **Web** `</>`
4. Registra la app con un nombre (ej: "Rutinas GYM Web")
5. **NO marques** Firebase Hosting (usaremos Vercel)
6. Haz clic en **Registrar app**
7. Copia las credenciales que aparecen

### 4. Configurar variables de entorno
1. Crea un archivo `.env.local` en la carpeta `rutinasGYM-web`:

```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://tu_proyecto.firebaseio.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

2. Reemplaza los valores con los que copiaste de Firebase

### 5. Configurar reglas de seguridad de Firebase
1. Ve a **Realtime Database** en Firebase Console
2. Haz clic en la pestaña **Reglas**
3. Reemplaza las reglas con:

```json
{
  "rules": {
    "clients": {
      ".read": true,
      ".write": true
    }
  }
}
```

**Nota**: Estas reglas son para desarrollo. Para producción, deberías agregar autenticación.

---

## 🚀 PASOS PARA DESPLEGAR EN VERCEL

### Opción 1: Usando Vercel CLI (Recomendado)

1. **Instalar Vercel CLI** (si no lo tienes):
```bash
npm install -g vercel
```

2. **Iniciar sesión en Vercel**:
```bash
vercel login
```

3. **Desplegar por primera vez**:
```bash
cd "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\rutinasGYM-web"
vercel
```

4. **Configurar variables de entorno en Vercel**:
```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_DATABASE_URL
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

5. **Desplegar a producción**:
```bash
vercel --prod
```

### Opción 2: Usando GitHub + Vercel

1. **Subir el proyecto a GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/rutinas-gym-web.git
git push -u origin main
```

2. **Conectar GitHub a Vercel**:
   - Ve a https://vercel.com/
   - Haz clic en **Add New Project**
   - Importa tu repositorio de GitHub
   - Configura las variables de entorno
   - Haz clic en **Deploy**

### 3. Configurar dominio personalizado

1. En el dashboard de Vercel, ve a tu proyecto
2. Haz clic en **Settings** > **Domains**
3. Agrega tu dominio personalizado (ej: `rutinas-gym.vercel.app`)
4. Sigue las instrucciones para configurar el DNS

---

## ✅ VERIFICAR DESPLIEGUE

1. Abre tu navegador y ve a la URL que te dio Vercel
2. Deberías ver la pantalla de login
3. Inicia sesión con:
   - ID: `gym2026`
   - Contraseña: `rutinas123`
4. Registra un cliente de prueba
5. Ve a Firebase Console > Realtime Database y verifica que los datos se guardaron

---

## 🔧 COMANDOS ÚTILES

### Desarrollo local:
```bash
npm run dev
```

### Construir para producción:
```bash
npm run build
```

### Vista previa de la compilación:
```bash
npm run preview
```

### Desplegar en Vercel:
```bash
vercel --prod
```

---

## 📝 NOTAS IMPORTANTES

- ✅ La base de datos ahora está en Firebase (tiempo real)
- ✅ Todos los dispositivos verán los mismos datos
- ✅ Los datos se sincronizan automáticamente
- ✅ Puedes acceder desde cualquier dispositivo con la URL de Vercel
- ⚠️ Recuerda configurar las reglas de seguridad para producción

---

## 🆘 SOLUCIÓN DE PROBLEMAS

**Error: "Firebase not configured"**
- Asegúrate de que el archivo `.env.local` existe y tiene todas las variables

**Error: "Permission denied" en Firebase**
- Verifica las reglas de seguridad en Firebase Console

**La app no se actualiza después de desplegar**
- Ejecuta `vercel --prod` nuevamente
- Espera 1-2 minutos y recarga la página (Ctrl+F5)

**Los datos no se sincronizan**
- Verifica la conexión a internet
- Comprueba la URL de Firebase en `.env.local`
- Abre la consola del navegador (F12) y busca errores
