# Script para CORREGIR la base de datos de Firebase
# Elimina el campo "status" global incorrecto de /orders

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CORRECCION DE BASE DE DATOS FIREBASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$DB_URL = "https://myappdelivery-4a576-default-rtdb.firebaseio.com"

Write-Host "Paso 1: Verificando estructura actual de /orders..."
$orders = Invoke-RestMethod -Uri "$DB_URL/orders.json" -Method Get

if ($orders.status -and -not $orders.orderCode) {
    Write-Host "❌ ERROR CONFIRMADO: Hay un campo 'status' global incorrecto en /orders" -ForegroundColor Red
    Write-Host "   Status actual: $($orders.status)" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Paso 2: Eliminando campo 'status' incorrecto..." -ForegroundColor Yellow
    
    # Crear nuevo objeto sin el campo status
    $newOrders = @{}
    foreach ($prop in $orders.PSObject.Properties) {
        if ($prop.Name -ne 'status') {
            $newOrders[$prop.Name] = $orders.($prop.Name)
        }
    }
    
    # Si no hay otros campos, dejar el objeto vacío
    if ($newOrders.Count -eq 0) {
        $newOrders = @{}
    }
    
    Write-Host "Paso 3: Guardando nueva estructura..." -ForegroundColor Yellow
    
    # Convertir a JSON
    $jsonBody = $newOrders | ConvertTo-Json -Depth 10 -Compress
    
    # Hacer PUT para reemplazar toda la estructura
    try {
        $response = Invoke-RestMethod -Uri "$DB_URL/orders.json" -Method Put -Body $jsonBody -ContentType "application/json"
        Write-Host "✅ CORRECCION EXITOSA" -ForegroundColor Green
        Write-Host "   El campo 'status' global ha sido eliminado" -ForegroundColor Green
        Write-Host ""
        
        # Verificar resultado
        $verifyOrders = Invoke-RestMethod -Uri "$DB_URL/orders.json" -Method Get
        if (-not $verifyOrders.status) {
            Write-Host "✅ VERIFICACION EXITOSA: /orders ya no tiene el campo status global" -ForegroundColor Green
        } else {
            Write-Host "⚠️ ADVERTENCIA: El campo status todavía existe, puede que necesites hacerlo manualmente" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ ERROR al corregir: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "SOLUCION MANUAL:" -ForegroundColor Yellow
        Write-Host "1. Ve a https://console.firebase.google.com/" -ForegroundColor Yellow
        Write-Host "2. Selecciona tu proyecto" -ForegroundColor Yellow
        Write-Host "3. Ve a Realtime Database" -ForegroundColor Yellow
        Write-Host "4. Busca la ruta /orders" -ForegroundColor Yellow
        Write-Host "5. Elimina manualmente el campo 'status'" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "✅ /orders parece estar correcto (no tiene campo status global)" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Script finalizado" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
