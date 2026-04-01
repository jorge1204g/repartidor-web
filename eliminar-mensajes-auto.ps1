# Script para eliminar todos los mensajes de Firebase - Version automatica
$firebaseUrl = "https://myappdelivery-4a576-default-rtdb.firebaseio.com"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  ELIMINAR MENSAJES DE FIREBASE" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar mensajes existentes
Write-Host "📊 Verificando mensajes existentes..." -ForegroundColor Yellow
$messagesUrl = "$firebaseUrl/messages.json"

try {
    $response = Invoke-RestMethod -Uri $messagesUrl -Method Get
    
    if ($response -eq $null) {
        Write-Host "✅ No hay mensajes en la base de datos" -ForegroundColor Green
    } else {
        $messageCount = ($response | Get-Member -MemberType NoteProperty).Count
        Write-Host "📦 Se encontraron $messageCount mensajes" -ForegroundColor Cyan
        Write-Host ""
        
        # Confirmar eliminación
        Write-Host "⚠️  ADVERTENCIA: Esta accion eliminara TODOS los $messageCount mensajes" -ForegroundColor Red
        Write-Host ""
        
        Write-Host "🗑️  Eliminando todos los mensajes..." -ForegroundColor Yellow
        
        # Eliminar nodo messages completo
        $deleteResponse = Invoke-RestMethod -Uri $messagesUrl -Method Put -Body "null" -ContentType "application/json"
        
        Write-Host ""
        Write-Host "✅ ¡MENSAJES ELIMINADOS EXITOSAMENTE!" -ForegroundColor Green
        Write-Host ""
        
        # Verificar que se eliminaron
        Write-Host "🔍 Verificando que se eliminaron los mensajes..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        
        $verifyResponse = Invoke-RestMethod -Uri $messagesUrl -Method Get
        
        if ($verifyResponse -eq $null) {
            Write-Host "✅ Confirmado: No quedan mensajes en la base de datos" -ForegroundColor Green
        } else {
            $remainingCount = ($verifyResponse | Get-Member -MemberType NoteProperty).Count
            Write-Host "⚠️  Aún quedan $remainingCount mensajes" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error al conectar con Firebase:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifica:" -ForegroundColor Yellow
    Write-Host "   1. Que tengas conexion a internet" -ForegroundColor Yellow
    Write-Host "   2. Que las reglas de Firebase permitan la escritura" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
