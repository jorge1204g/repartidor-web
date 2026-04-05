# Solución: Cambios no se reflejan en Vercel

## Problema
Los cambios realizados localmente funcionan correctamente, pero no se ven en la versión desplegada en Vercel (https://repartidor-web.vercel.app/#/dashboard).

## Causa
El problema es el **cacheo agresivo** del navegador y de Vercel. Los archivos JavaScript y CSS se cachean y el navegador no detecta que hay nuevas versiones.

## Soluciones Implementadas

### 1. **Configuración de Vite mejorada** (`vite.config.ts`)
- Cambiado `base: './'` a `base: '/'` para rutas absolutas correctas
- Agregado hash único a todos los archivos de assets:
  - `entryFileNames: 'assets/[name].[hash].js'`
  - `chunkFileNames: 'assets/[name].[hash].js'`
  - `assetFileNames: 'assets/[name].[hash].[ext]'`

Esto asegura que cada build genere nombres de archivo únicos, forzando al navegador a descargar la nueva versión.

### 2. **Headers de Cache-Control** (`vercel.json`)
- HTML: `no-cache, no-store, must-revalidate` (siempre verifica si hay nueva versión)
- Assets con hash: `public, max-age=31536000, immutable` (cache por 1 año ya que tienen hash único)

### 3. **Meta tags anti-cache** (`index.html`)
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

## Cómo desplegar correctamente

### Opción 1: Usar el script automático (Recomendado)
```bash
deploy-vercel.bat
```

### Opción 2: Manualmente
```bash
npm install
npm run build
npx vercel --prod
```

## Después de desplegar

### Limpiar caché del navegador (IMPORTANTE)

**Windows:**
- `Ctrl + Shift + R` (recarga forzada)
- O `Ctrl + F5`

**Mac:**
- `Cmd + Shift + R`

**Método alternativo (más efectivo):**
1. Abre DevTools con `F12`
2. Click derecho en el botón de recargar
3. Selecciona "Vaciar caché y recargar forzadamente"

**Para verificar que funcionó:**
1. Abre DevTools (`F12`)
2. Ve a la pestaña "Network"
3. Marca la opción "Disable cache"
4. Recarga la página
5. Deberías ver los cambios inmediatamente

## Verificar versión desplegada

Para confirmar que se desplegó la versión correcta:

1. Abre https://repartidor-web.vercel.app
2. Abre DevTools (`F12`)
3. Ve a la pestaña "Network"
4. Recarga la página
5. Busca archivos `.js` en la lista
6. Deberían tener nombres como `assets/index.a8f3d2e1.js` (con hash aleatorio)

Si los archivos NO tienen hash en el nombre, significa que el build no se generó correctamente.

## Solución de problemas

### Los cambios aún no se ven

1. **Verifica que el build fue exitoso:**
   ```bash
   npm run build
   ```
   Revisa la carpeta `dist/` para ver si los archivos tienen hash en los nombres.

2. **Limpia el caché de Vercel:**
   ```bash
   npx vercel --prod --force
   ```

3. **Prueba en modo incógnito:**
   - Abre una ventana de incógnito
   - Accede a https://repartidor-web.vercel.app
   - Si funciona aquí, el problema es definitivamente el caché del navegador

4. **Verifica el dashboard de Vercel:**
   - Ve a https://vercel.com/dashboard
   - Selecciona el proyecto "repartidor-web"
   - Verifica que el último deployment tenga estado "Ready"
   - Revisa los logs del deployment para errores

### Errores comunes

**Error: "Cannot GET /dashboard"**
- Verifica que `vercel.json` tenga la configuración de rewrites correcta
- Asegúrate de usar HashRouter (ya configurado en `main.tsx`)

**Error: Archivos 404**
- El `base` en `vite.config.ts` debe ser `'/'` (no `'./'`)
- Los assets deben estar en la carpeta `dist/assets/`

## Resumen de cambios realizados

✅ `vite.config.ts` - Agregado hash a assets y cambiado base a '/'  
✅ `vercel.json` - Agregados headers de Cache-Control  
✅ `index.html` - Agregados meta tags anti-cache  
✅ `deploy-vercel.bat` - Script de despliegue automatizado  

## Próximos despliegues

Cada vez que hagas cambios:

1. Ejecuta `deploy-vercel.bat`
2. Espera a que termine el despliegue
3. Limpia el caché del navegador (`Ctrl + Shift + R`)
4. Verifica los cambios

Con esta configuración, los hashes únicos en los nombres de archivo asegurarán que los navegadores siempre descarguen la versión más reciente después de cada despliegue.
