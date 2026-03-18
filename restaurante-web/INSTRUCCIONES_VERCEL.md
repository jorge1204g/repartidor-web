# 🚀 Instrucciones para Desplegar la App de Restaurante en Vercel

## ✅ Archivos Configurados

Ya tienes todos los archivos necesarios listos:

- ✅ `vercel.json` - Configuración de Vercel
- ✅ `.env.local` - Variables de entorno
- ✅ `.env.example` - Ejemplo de variables
- ✅ `vite.config.ts` - Configuración optimizada
- ✅ `index.html` - Meta tags para móviles
- ✅ `index.css` - Estilos responsivos
- ✅ `.gitignore` - Para ignorar node_modules
- ✅ `README.md` - Documentación completa

---

## 📋 PASOS PARA DESPLEGAR

### Opción 1: Usando Vercel CLI (Recomendado)

#### Paso 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

#### Paso 2: Iniciar sesión en Vercel
```bash
vercel login
```

#### Paso 3: Navegar a la carpeta del restaurante
```bash
cd "c:\1234\Nueva carpeta (22)\apl\Prueba New\restaurante-web"
```

#### Paso 4: Desplegar
```bash
vercel
```

**Durante el despliegue te preguntará:**

1. **Set up and deploy?** → Escribe: `Y`
2. **Which scope do you want to deploy?** → Presiona Enter (usa tu cuenta)
3. **Link to existing project?** → Escribe: `N`
4. **What's your project's name?** → Escribe: `restaurante-web` (o el nombre que quieras)
5. **In which directory is your code located?** → Presiona Enter (`./`)
6. **Want to override the settings?** → Escribe: `N`

#### Paso 5: Configurar variables de entorno

Después del primer despliegue, ejecuta:
```bash
vercel env add VITE_FIREBASE_DATABASE_URL production
```

Cuando te pida el valor, pega:
```
https://myappdelivery-4a576-default-rtdb.firebaseio.com
```

Luego vuelve a desplegar:
```bash
vercel --prod
```

#### Paso 6: ¡Listo!

Vercel te dará una URL como:
```
https://restaurante-web-tu-usuario.vercel.app
```

---

### Opción 2: Desde GitHub (Más fácil para actualizaciones)

#### Paso 1: Subir a GitHub

1. Crea un repositorio en GitHub
2. Sube los archivos del proyecto:

```bash
cd "c:\1234\Nueva carpeta (22)\apl\Prueba New\restaurante-web"
git init
git add .
git commit -m "Initial commit - App Restaurante"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/restaurante-web.git
git push -u origin main
```

#### Paso 2: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en **"Add New Project"**
4. Selecciona **"Import Git Repository"**
5. Busca tu repositorio `restaurante-web`
6. Haz clic en **"Import"**

#### Paso 3: Configurar en Vercel

En la configuración del proyecto en Vercel:

1. **Framework Preset**: Vite
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Install Command**: `npm install`

#### Paso 4: Agregar Variables de Entorno

En Vercel, ve a **Settings → Environment Variables**:

- **Key**: `VITE_FIREBASE_DATABASE_URL`
- **Value**: `https://myappdelivery-4a576-default-rtdb.firebaseio.com`
- **Environment**: Production ✅

Haz clic en **Save**

#### Paso 5: Desplegar

Haz clic en **"Deploy"** y espera a que termine.

¡Listo! Obtendrás una URL como:
```
https://restaurante-web.vercel.app
```

---

## 🔧 Comandos Útiles

### Probar localmente antes de desplegar
```bash
npm run dev
# Abre http://localhost:3001
```

### Construir para producción
```bash
npm run build
```

### Vista previa de producción
```bash
npm run preview
```

### Desplegar actualización
```bash
vercel --prod
```

---

## 📱 URLs Finales

Tendrás:

- **App Repartidor**: https://repartidor-web.vercel.app/
- **App Restaurante**: https://restaurante-web-tu-usuario.vercel.app

---

## ✨ Características de la App Desplegada

✅ **Totalmente responsiva** - Funciona en móviles, tablets y PC
✅ **Accesible desde cualquier navegador** - Chrome, Safari, Firefox, Edge
✅ **Sin instalación** - Solo abre el link
✅ **Sincronización en tiempo real** - Firebase Realtime Database
✅ **Optimizada para móviles** - Meta tags iOS y Android

---

## 🔐 Acceso a la App

Para ingresar a la app de restaurante:

1. Ve a tu URL de Vercel
2. Ingresa el ID de restaurante (ej: `restaurante1`)
3. El sistema creará automáticamente el restaurante si no existe
4. ¡Listo! Ya puedes gestionar pedidos

---

## ⚠️ Importante

- Las reglas de seguridad de Firebase expiran en **abril 2026**
- Para producción, configura reglas más estrictas en Firebase Console
- Considera implementar Firebase Auth para mayor seguridad

---

## 🆘 Problemas Comunes

### Error: "Command failed with exit code 1"
**Solución**: Asegúrate de estar en la carpeta correcta del restaurante

### La app no carga después de desplegar
**Solución**: Verifica las variables de entorno en Vercel

### Los datos no se sincronizan
**Solución**: Confirma que la URL de Firebase sea correcta

---

## 📞 Soporte

Si necesitas ayuda:
1. Revisa la consola del navegador (F12)
2. Verifica Firebase Console
3. Revisa los logs en Vercel Dashboard

---

**¡Tu app de restaurante está lista para usarse!** 🎉
