# Script para eliminar pedido huérfano de Firebase
# Elimina tanto de orders como de client_orders

$orderId = "1775115666109"
$firebaseUrl = "https://proyecto-new-37f18-default-rtdb.firebaseio.com"

Write-Host "`n🔍 Verificando estado del pedido $orderId...`n" -ForegroundColor Cyan

# Verificar si existe en orders
Write-Host "📊 Verificando en orders..." -ForegroundColor Yellow
try {
    $ordersResponse = Invoke-RestMethod -Uri "$firebaseUrl/orders/$orderId.json" -Method Get -ErrorAction Stop
    if ($ordersResponse) {
        Write-Host "✅ El pedido EXISTE en orders" -ForegroundColor Green
        $existsInOrders = $true
    } else {
        Write-Host "❌ El pedido NO existe en orders" -ForegroundColor Red
        $existsInOrders = $false
    }
} catch {
    Write-Host "❌ El pedido NO existe en orders (error o no encontrado)" -ForegroundColor Red
    $existsInOrders = $false
}

# Verificar si existe en client_orders
Write-Host "`n📊 Verificando en client_orders..." -ForegroundColor Yellow
try {
    $clientOrdersResponse = Invoke-RestMethod -Uri "$firebaseUrl/client_orders/$orderId.json" -Method Get -ErrorAction Stop
    if ($clientOrdersResponse) {
        Write-Host "✅ El pedido EXISTE en client_orders" -ForegroundColor Green
        $existsInClientOrders = $true
    } else {
        Write-Host "❌ El pedido NO existe en client_orders" -ForegroundColor Red
        $existsInClientOrders = $false
    }
} catch {
    Write-Host "❌ El pedido NO existe en client_orders (error o no encontrado)" -ForegroundColor Red
    $existsInClientOrders = $false
}

Write-Host "`n📋 Resumen:" -ForegroundColor Cyan
Write-Host "  - orders: $(if($existsInOrders){'✅'}else{'❌'})" -ForegroundColor White
Write-Host "  - client_orders: $(if($existsInClientOrders){'✅'}else{'❌'})" -ForegroundColor White

# Determinar acción
if (-not $existsInOrders -and -not $existsInClientOrders) {
    Write-Host "`nℹ️  El pedido ya no existe en ninguna colección. No se requiere acción." -ForegroundColor Yellow
    exit 0
}

# Confirmar eliminación (descomentar para modo interactivo)
# Write-Host "`n⚠️  ¿Deseas eliminar el pedido de AMBAS colecciones?" -ForegroundColor Yellow
# $confirm = Read-Host "   Escribe 'SI' para confirmar"
# if ($confirm -ne "SI") {
#     Write-Host "`n❌ Operación cancelada por el usuario" -ForegroundColor Red
#     exit 0
# }
$confirm = "SI"

# Eliminar de orders
if ($existsInOrders) {
    Write-Host "`n🗑️  Eliminando de orders/$orderId..." -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "$firebaseUrl/orders/$orderId.json" -Method Delete -ErrorAction Stop
        Write-Host "✅ Pedido eliminado de orders" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al eliminar de orders: $_" -ForegroundColor Red
    }
}

# Eliminar de client_orders
if ($existsInClientOrders) {
    Write-Host "`n🗑️  Eliminando de client_orders/$orderId..." -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "$firebaseUrl/client_orders/$orderId.json" -Method Delete -ErrorAction Stop
        Write-Host "✅ Pedido eliminado de client_orders" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al eliminar de client_orders: $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ ¡Limpieza completada!" -ForegroundColor Green
Write-Host "`n📱 Verifica en Firebase Console:" -ForegroundColor Cyan
Write-Host "   https://proyecto-new-37f18-default-rtdb.firebaseio.com/" -ForegroundColor White
