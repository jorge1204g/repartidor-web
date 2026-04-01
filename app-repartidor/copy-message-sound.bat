@echo off
echo ========================================
echo  COPIANDO SONIDO DE MENSAJES
echo ========================================
echo.

copy /Y "src\main\res\raw\new_order_notification.mp3" "src\main\res\raw\message_notification.mp3"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Archivo copiado exitosamente!
    echo 📁 Ruta: src\main\res\raw\message_notification.mp3
    echo.
    echo Ahora puedes compilar la app con:
    echo   gradlew.bat app-repartidor:assembleDebug
) else (
    echo.
    echo ❌ Error al copiar el archivo
    echo Verifica que estés en la carpeta correcta
)

echo.
pause
