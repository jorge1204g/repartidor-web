@echo off
echo ========================================
echo  DESPLEGAR EN VERCEL - FITNESS GYM WEB
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando instalacion de Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI no esta instalado. Instalando...
    npm install -g vercel
    echo.
)

echo Construyendo aplicacion...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: La compilacion fallo
    pause
    exit /b 1
)

echo.
echo Desplegando en Vercel...
vercel --prod

echo.
echo ========================================
echo  DESPLIEGUE COMPLETADO
echo ========================================
echo.
pause
