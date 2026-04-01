# Script para copiar el archivo de sonido de mensaje
$sourcePath = "c:\1234\Nueva carpeta (22)\apl\Prueba New\app-repartidor\src\main\res\raw\new_order_notification.mp3"
$destPath = "c:\1234\Nueva carpeta (22)\apl\Prueba New\app-repartidor\src\main\res\raw\message_notification.mp3"

Copy-Item -Path $sourcePath -Destination $destPath -Force

Write-Host "✅ Archivo copiado exitosamente!"
Write-Host "📁 Ruta: $destPath"
