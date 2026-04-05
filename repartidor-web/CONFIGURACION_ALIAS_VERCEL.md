# Configuración de Alias en Vercel

## Problema
Vercel por defecto crea URLs temporales como:
- `repartidor-7k5zne5jp-jorge1204gs-projects.vercel.app`
- `repartidor-p3ksgmvth-jorge1204gs-projects.vercel.app`

Pero necesitamos que la URL sea siempre:
- **`https://repartidor-web.vercel.app`**

## Solución

### Después de cada despliegue, ejecutar:

```bash
# 1. Hacer el deploy normal (sin --force)
npx vercel --prod

# 2. Obtener la URL temporal del output (ejemplo: repartidor-7k5zne5jp-jorge1204gs-projects.vercel.app)

# 3. Establecer el alias correcto
npx vercel alias set <URL-TEMPORAL> repartidor-web.vercel.app
```

### Ejemplo completo:

```bash
npx vercel --prod
# Output: Production: https://repartidor-xxxxx-jorge1204gs-projects.vercel.app

npx vercel alias set repartidor-xxxxx-jorge1204gs-projects.vercel.app repartidor-web.vercel.app
# Output: Success! https://repartidor-web.vercel.app now points to...
```

## Script automatizado

Para no olvidar este paso, usa el script `deploy-vercel.bat` que incluye recordatorios, o crea uno nuevo:

### deploy-con-alias.bat

```batch
@echo off
echo ========================================
echo   DESPLEGUE CON ALIAS VERCEL
echo ========================================
echo.

echo [1/3] Construyendo aplicacion...
call npm run build

echo.
echo [2/3] Desplegando a Vercel...
for /f "tokens=*" %%i in ('npx vercel --prod') do (
    echo %%i
    echo %%i | findstr "Production:" > temp_url.txt
)

echo.
echo [3/3] Configurando alias...
set /p TEMP_URL=<temp_url.txt
for /f "tokens=2 delims=:" %%a in ("%TEMP_URL%") do (
    set DEPLOY_URL=%%a
)
set DEPLOY_URL=%DEPLOY_URL:~1%
del temp_url.txt

if not "%DEPLOY_URL%"=="" (
    echo Estableciendo alias para: %DEPLOY_URL%
    call npx vercel alias set %DEPLOY_URL% repartidor-web.vercel.app
) else (
    echo ERROR: No se pudo obtener la URL del deployment
    echo Por favor, establece el alias manualmente:
    echo npx vercel alias set ^<URL-TEMPORAL^> repartidor-web.vercel.app
)

echo.
echo ========================================
echo   DESPLEGUE COMPLETADO
echo ========================================
echo.
echo URL: https://repartidor-web.vercel.app
echo.
echo IMPORTANTE: Limpia el cache del navegador:
echo   - Windows: Ctrl + Shift + R
echo.
pause
```

## Configuración alternativa en Vercel Dashboard

Puedes configurar el dominio principal directamente en Vercel:

1. Ve a https://vercel.com/dashboard
2. Selecciona el proyecto "repartidor-web"
3. Ve a "Settings" → "Domains"
4. Agrega `repartidor-web.vercel.app` como dominio principal
5. Configúralo para que apunte automáticamente al último deployment de producción

De esta forma, no necesitarás ejecutar el comando de alias manualmente.

## Verificar alias configurados

```bash
# Ver todos los aliases
npx vercel alias ls

# Ver deployments recientes
npx vercel ls
```

## Resumen del proceso correcto

✅ **CORRECTO:**
```bash
npm run build
npx vercel --prod
npx vercel alias set <URL-TEMPORAL> repartidor-web.vercel.app
```

❌ **INCORRECTO:**
```bash
npx vercel --prod --force
# Esto crea nuevos deployments sin actualizar el alias principal
```

## Notas importantes

- El alias debe establecerse **después** de cada deployment
- La URL temporal cambia en cada deployment
- Sin el alias, los cambios quedan en URLs temporales inaccesibles
- Siempre verifica que `https://repartidor-web.vercel.app` muestre los cambios
