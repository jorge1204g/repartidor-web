@echo off
REM Script para compilar la APK del repartidor

echo ========================================
echo   COMPILADOR APP REPARTIDOR
echo ========================================
echo.

cd /d "%~dp0app-repartidor"

echo [1/3] Limpiando proyecto...
call gradlew clean
if %errorlevel% neq 0 (
    echo ERROR: Fallo al limpiar el proyecto
    pause
    exit /b 1
)

echo.
echo [2/3] Compilando APK Debug...
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Fallo al compilar la APK
    pause
    exit /b 1
)

echo.
echo [3/3] Buscando APK generada...
echo.

REM Buscar la APK más reciente
for /f "delims=" %%i in ('dir /b /o-d build\outputs\apk\debug\*.apk 2^>nul') do (
    set "APK_FILE=build\outputs\apk\debug\%%i"
    goto :found
)

echo ERROR: No se encontro la APK compilada
pause
exit /b 1

:found
echo ========================================
echo   APK COMPILADA EXITOSAMENTE
echo ========================================
echo.
echo Archivo: %APK_FILE%
echo.
echo Tamano:
for %%A in ("%APK_FILE%") do echo   - %%~zA bytes
echo.
echo Fecha:
for %%A in ("%APK_FILE%") do echo   - %%~tA
echo.
echo ========================================
echo   PARA INSTALAR:
echo ========================================
echo.
echo 1. Conecta tu dispositivo Android por USB
echo 2. Ejecuta: adb install %APK_FILE%
echo.
echo O copia el archivo a tu dispositivo e instalalo manualmente
echo.
pause
