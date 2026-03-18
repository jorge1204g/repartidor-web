# 🚀 VERCEL CLI - APP DEL REPARTIDOR WEB

## 📋 PASOS PARA DESPLEGAR CON VERCEL CLI

---

## 🔧 INSTALACIÓN DE VERCEL CLI

### Paso 1: Instalar globalmente

Abre tu terminal y ejecuta:

```bash
npm install -g vercel
```

**En Windows (PowerShell como Administrador):**
```bash
npm install -g vercel
```

**Verifica la instalación:**
```bash
vercel --version
```

Debería mostrar algo como: `Vercel CLI 3.x.x`

---

## 🎯 DESPLIEGUE PASO A PASO

### Paso 2: Inicia sesión en Vercel

```bash
vercel login
```

Te dará opciones:
1. **GitHub** (Recomendado) ← Elige esta
2. GitLab
3. Bitbucket
4. Email

Selecciona **GitHub** y sigue las instrucciones en el navegador.

---

### Paso 3: Ve al directorio del proyecto

```bash
cd "c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web"
```

---

### Paso 4: Primer despliegue (Desarrollo)

```bash
vercel
```

**Te hará varias preguntas:**

1. **Set up and deploy?** → `Y` (Yes)
2. **Which scope?** → Elige tu cuenta (presiona Enter)
3. **Link to existing project?** → `N` (No, es la primera vez)
4. **What's your project's name?** → `repartidor-web-app` (o el nombre que quieras)
5. **In which directory is your code located?** → `./` (Enter)
6. **Want to override the settings?** → `N` (No)

**Espera a que termine...**

Verás algo como:
```
🔍  Inspect­ing https://repartidor-web-app.vercel.app [3s]
✅  Production: https://repartidor-web-app.vercel.app
```

---

### Paso 5: Despliegue a Producción

Una vez hecho el primer despliegue:

```bash
vercel --prod
```

Esto desplegará a producción inmediatamente.

---

## ⚡ COMANDOS ÚTILES

### Ver deployments recientes:
```bash
vercel ls
```

### Ver logs de un deployment:
```bash
vercel logs [deployment-url]
```

### Eliminar un deployment:
```bash
vercel rm [deployment-url]
```

### Abrir dashboard del proyecto:
```bash
vercel open
```

---

## 🔍 SOLUCIÓN DE PROBLEMAS

### Error: "Command not found: vercel"

**Solución:**
```bash
# Reinstala globalmente
npm install -g vercel

# O usa npx
npx vercel
```

---

### Error: "Authorization required"

**Solución:**
```bash
# Cierra sesión y vuelve a iniciar
vercel logout
vercel login
```

---

### Error: "Build failed"

**Causas comunes:**
1. Dependencias no instaladas
2. Errores de TypeScript
3. Variables de entorno faltantes

**Solución:**
```bash
# Instala dependencias
npm install

# Intenta build local
npm run build

# Si funciona, intenta de nuevo
vercel --prod
```

---

### Error: "404 Not Found" después del deploy

**Causa:** Problema con rewrites en vercel.json

**Solución:**
Verifica que `vercel.json` tenga esto:

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

---

## 📦 ESTRUCTURA DEL PROYECTO

Tu proyecto debe tener:

```
repartidor-web/
├── src/
│   ├── pages/
│   ├── services/
│   ├── components/
│   └── ...
├── public/
├── package.json
├── vercel.json ✅
├── tsconfig.json
└── vite.config.ts
```

---

## 🎯 FLUJO DE TRABAJO RECOMENDADO

### Desarrollo continuo:

1. **Haz cambios en tu código**
2. **Prueba localmente:**
   ```bash
   npm run dev
   ```
3. **Commit a Git:**
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push
   ```
4. **Despliega a Vercel:**
   ```bash
   vercel
   ```

### Para producción:

1. **Asegúrate que todo funcione**
2. **Build local:**
   ```bash
   npm run build
   ```
3. **Despliega a producción:**
   ```bash
   vercel --prod
   ```

---

## 🔗 INTEGRACIÓN CON GITHUB (Opcional pero recomendado)

### Configura auto-deploy:

1. **Sube tu código a GitHub:**
   ```bash
   git init
   git remote add origin https://github.com/tu-usuario/repartidor-web.git
   git push -u origin main
   ```

2. **Ve a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Click en "New Project"
   - Importa desde GitHub
   - Selecciona tu repositorio `repartidor-web`

3. **Configura el proyecto:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **¡Listo!** Ahora cada push a GitHub desplegará automáticamente.

---

## 📊 VARIABLES DE ENTORNO EN VERCEL

Si usas `.env.local`, necesitas configurar las variables en Vercel:

### En Vercel Dashboard:

1. Ve a tu proyecto
2. Settings → Environment Variables
3. Agrega cada variable:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - etc.

### O usa Vercel CLI:

```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
# ... etc
```

Luego vincula:
```bash
vercel env pull
```

---

## 🎉 POST-DESPLEGUE

### Verifica que funciona:

1. Abre la URL que te dio Vercel
2. Prueba iniciar sesión
3. Crea un pedido de prueba
4. Verifica que aparece en el dashboard

### Comparte tu app:

```
🌐 URL de producción: https://repartidor-web-app.vercel.app
🌐 URL de desarrollo: https://repartidor-web-app-git-main-tu-username.vercel.app
```

---

## 🔄 ACTUALIZAR DESPUÉS DEL PRIMER DESPLIEGUE

### Cambios pequeños:
```bash
# Solo haz commit y push si tienes GitHub conectado
git add .
git commit -m "Actualización"
git push

# Luego despliega
vercel --prod
```

### Cambios grandes:
```bash
# Prueba primero local
npm run build

# Si todo está bien
vercel --prod
```

---

## 💡 TIPS IMPORTANTES

### Tip 1: Usa GitHub
Conectar con GitHub hace todo más fácil. Los deployments son automáticos.

### Tip 2: Usa aliases
```bash
# Alias para producción
vercel alias set production

# Alias personalizado
vercel alias mi-repartidor-app.vercel.app
```

### Tip 3: Preview deployments
Cada rama de Git puede tener su propio deployment preview:
```bash
git checkout -b nueva-funcionalidad
vercel
```

### Tip 4: Rollback rápido
Si algo sale mal:
```bash
vercel rollback [deployment-id]
```

---

## 📞 COMANDOS MÁS USADOS

| Comando | Descripción |
|---------|-------------|
| `vercel` | Despliega a development |
| `vercel --prod` | Despliega a production |
| `vercel ls` | Lista deployments |
| `vercel login` | Inicia sesión |
| `vercel logout` | Cierra sesión |
| `vercel open` | Abre dashboard web |
| `vercel env pull` | Descarga variables de entorno |
| `vercel --help` | Muestra ayuda |

---

## 🚀 ¡LISTO PARA DESPLEGAR!

### Resumen rápido:

```bash
# 1. Instala Vercel CLI
npm install -g vercel

# 2. Inicia sesión
vercel login

# 3. Ve al proyecto
cd repartidor-web

# 4. Despliega
vercel

# 5. Producción
vercel --prod
```

**¡Eso es todo!** Tu app estará disponible en `https://repartidor-web-app.vercel.app`

---

**Fecha:** Marzo 6, 2026  
**Estado:** ✅ Listo para desplegar  
**Tiempo estimado:** 5-10 minutos
