# Script para verificar los datos de un repartidor en Firebase
Write-Host "Verificador de datos de repartidor en Firebase" -ForegroundColor Green
Write-Host "" 

# Solicitar ID de repartidor
$idRepartidor = Read-Host "Ingresa el ID del repartidor a verificar"

if ($idRepartidor -eq "") {
    Write-Host "ID no proporcionado. Saliendo..." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Para verificar los datos reales en Firebase, necesitas:" -ForegroundColor Yellow
Write-Host "1. Ir a: https://console.firebase.google.com/" -ForegroundColor Yellow
Write-Host "2. Seleccionar tu proyecto: prueba-pedidos-597b5" -ForegroundColor Yellow
Write-Host "3. Ir a 'Realtime Database' en el menú izquierdo" -ForegroundColor Yellow
Write-Host "4. Navegar a la ruta: /delivery_persons/$idRepartidor" -ForegroundColor Yellow
Write-Host "5. Verificar si el campo 'isApproved' existe y su valor" -ForegroundColor Yellow
Write-Host ""

Write-Host "Campos que debes verificar:" -ForegroundColor Cyan
Write-Host "  - id: $idRepartidor" -ForegroundColor Cyan
Write-Host "  - isApproved: debe ser 'true' para usuarios creados por admin" -ForegroundColor Cyan
Write-Host "  - name: nombre del repartidor" -ForegroundColor Cyan
Write-Host "  - phone: teléfono del repartidor" -ForegroundColor Cyan
Write-Host ""

Write-Host "Pasos para crear un nuevo repartidor correctamente:" -ForegroundColor Green
Write-Host "1. En la app de admin, crea un nuevo repartidor" -ForegroundColor White
Write-Host "2. Copia exactamente el ID generado (botón de copiar)" -ForegroundColor White
Write-Host "3. En la app de repartidor, usa ese ID exacto" -ForegroundColor White
Write-Host ""

Write-Host "Si el problema persiste, posibles causas:" -ForegroundColor Red
Write-Host "  - El ID se está copiando incorrectamente" -ForegroundColor Red
Write-Host "  - Hay un problema de sincronización en tiempo real" -ForegroundColor Red
Write-Host "  - El campo isApproved no se está guardando correctamente" -ForegroundColor Red