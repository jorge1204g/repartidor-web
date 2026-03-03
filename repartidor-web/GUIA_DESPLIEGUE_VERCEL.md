# 📤 Guía para Subir a Vercel

## Método Recomendado: Usando Vercel CLI

### Paso 1: Instalar Vercel CLI

Abre PowerShell como administrador y ejecuta:

```bash
npm install -g vercel
```

### Paso 2: Navega al directorio de la app web

```bash
cd "c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web"
```

### Paso 3: Inicia sesión en Vercel

```bash
vercel login
```

Se abrirá tu navegador para que inicies sesión con:
- GitHub (recomendado)
- GitLab
- Email

### Paso 4: Desplegar la aplicación

Ejecuta:

```bash
vercel
```

### Paso 5: Responde las preguntas

1. **Set up and deploy?** → `Y`
2. **Which scope do you want to deploy to?** → Elige tu cuenta (presiona Enter)
3. **Link to existing project?** → `N`
4. **What's your project's name?** → `app-repartidor-web` (o el nombre que quieras)
5. **In which directory is your code?** → `.` (punto, directorio actual)
6. **Want to override the settings?** → `N`

### Paso 6: Configurar variables de entorno

Vercel detectará que usas `.env.local`. Te preguntará si quieres añadir las variables de entorno.

**Responde `Y`** y añade:

- **Key**: `VITE_FIREBASE_DATABASE_URL`
- **Value**: `https://myappdelivery-4a576-default-rtdb.firebaseio.com`

### Paso 7: ¡Espera a que se despliegue!

Vercel construirá tu app y te dará una URL como:

```
https://app-repartidor-web-[codigo].vercel.app
```

### Paso 8: Producción

Para desplegar en producción (URL sin código):

```bash
vercel --prod
```

---

## Método Alternativo: GitHub + Vercel

### Paso 1: Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Crea un repositorio nuevo (puede ser público o privado)
3. Nombre: `app-repartidor-web`
4. No lo inicialices con README

### Paso 2: Subir tu código

```bash
cd "c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web"
git init
git add .
git commit -m "Initial commit - App Repartidor Web"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/app-repartidor-web.git
git push -u origin main
```

### Paso 3: Conectar con Vercel

1. Ve a https://vercel.com/dashboard
2. Haz clic en **"Add New..."** → **"Project"**
3. Haz clic en **"Import Git Repository"**
4. Busca tu repositorio `app-repartidor-web`
5. Haz clic en **"Import"**

### Paso 4: Configurar en Vercel

1. **Framework Preset**: Detectará automáticamente `Vite`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Install Command**: `npm install`

### Paso 5: Variables de entorno

Haz clic en **"Environment Variables"** y añade:

- **Name**: `VITE_FIREBASE_DATABASE_URL`
- **Value**: `https://myappdelivery-4a576-default-rtdb.firebaseio.com`

Haz clic en **"Add"** para cada variable.

### Paso 6: Deploy

Haz clic en **"Deploy"** y espera a que Vercel construya tu app.

---

## 🔧 Configuración Adicional Importante

### Actualizar vercel.json (si es necesario)

El archivo `vercel.json` ya está configurado correctamente para Vite/React:

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Esto permite que React Router funcione correctamente en producción.

---

## ✅ Verificación Post-Deploy

Una vez desplegado, verifica:

1. **La app carga correctamente** en la URL proporcionada
2. **El login funciona** con un ID de repartidor válido
3. **Los datos se sincronizan** con Firebase
4. **La navegación entre páginas** funciona (Dashboard, Pedidos, etc.)

---

## 🔗 URLs que obtendrás

- **Development**: `https://app-repartidor-web-git-main-TU_USUARIO.vercel.app`
- **Production**: `https://app-repartidor-web.vercel.app` (después de hacer deploy --prod)

---

## 🎯 Comandos útiles de Vercel

```bash
# Ver deployments anteriores
vercel ls

# Ver logs del deployment
vercel logs

# Eliminar un deployment
vercel rm [deployment-name]

# Abrir el dashboard del proyecto
vercel open
```

---

## ⚠️ Consideraciones Importantes

### Seguridad

- ✅ Las reglas de seguridad de Firebase ya están configuradas
- ⚠️ Para producción, considera implementar Firebase Authentication
- ⚠️ No subas el archivo `.env.local` a GitHub (está en `.gitignore`)

### Dominio Personalizado

Si quieres usar tu propio dominio:

1. Ve al dashboard de Vercel
2. Selecciona tu proyecto
3. Ve a **"Settings"** → **"Domains"**
4. Añade tu dominio (ej: `repartidor.tudominio.com`)
5. Sigue las instrucciones para configurar los DNS

### Actualizaciones

Cada vez que hagas cambios:

```bash
# Si usas CLI
vercel --prod

# Si usas GitHub
git add .
git commit -m "Descripción de cambios"
git push
# Vercel desplegará automáticamente
```

---

## 🆘 Solución de Problemas

### Error: "Build failed"

Verifica que puedes hacer build localmente:

```bash
npm run build
```

Si falla localmente, fallará en Vercel también.

### Error: "Firebase no conecta"

1. Verifica que las variables de entorno estén configuradas en Vercel
2. Revisa que la URL de Firebase sea correcta
3. Verifica las reglas de seguridad en Firebase Console

### Error: "Página en blanco"

1. Abre la consola del navegador (F12)
2. Busca errores
3. Verifica que el routing esté configurado correctamente

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs: `vercel logs`
2. Prueba localmente primero: `npm run dev`
3. Verifica Firebase Console para ver si hay datos

---

**¡Listo! Tu app estará disponible mundialmente en minutos.** 🚀
