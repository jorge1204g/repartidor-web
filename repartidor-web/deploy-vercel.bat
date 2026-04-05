@echo off
echo ========================================
echo   DESPLEGUE REPARTIDOR-WEB A VERCEL
echo ========================================
echo.

echo [1/4] Limpiando cache de npm...
call npm cache clean --force

echo.
echo [2/4] Instalando dependencias...
call npm install

echo.
echo [3/4] Construyendo aplicacion...
call npm run build

echo.
echo [4/4] Desplegando a Vercel...
echo IMPORTANTE: Despues del despliegue, configura el alias manualmente:
echo   npx vercel alias set ^<URL-TEMPORAL^> repartidor-web.vercel.app
echo.
call npx vercel --prod

echo.
echo ========================================
echo   DESPLEGUE COMPLETADO
echo ========================================
echo.
echo PASO FINAL - Configurar alias (IMPORTANTE):
echo   1. Copia la URL temporal que aparece arriba
echo   2. Ejecuta: npx vercel alias set ^<URL-TEMPORAL^> repartidor-web.vercel.app
echo.
echo Para ver los cambios, limpia el cache del navegador:
echo   - Windows: Ctrl + Shift + R
echo   - Mac: Cmd + Shift + R
echo   - O abre DevTools (F12) y haz click derecho en Recargar -^> "Vaciar cache y recargar"
echo.
pause
