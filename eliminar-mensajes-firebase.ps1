# Script para eliminar todos los mensajes de Firebase
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
        
        # Mostrar resumen de mensajes
        Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
        foreach ($msg in $response.PSObject.Properties) {
            $msgData = $response.$($msg.Name)
            $sender = if ($msgData.senderName) { $msgData.senderName } else { "Desconocido" }
            $messageText = if ($msgData.message) { 
                if ($msgData.message.Length -gt 50) { 
                    $msgData.message.Substring(0, 50) + "..." 
                } else { 
                    $msgData.message 
                }
            } else { "Sin texto" }
            Write-Host "   De: $sender" -ForegroundColor Gray
            Write-Host "   Mensaje: $messageText" -ForegroundColor Gray
            Write-Host "-----------------------------------" -ForegroundColor Gray
        }
        Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
        Write-Host ""
        
        # Confirmar eliminación
        Write-Host "⚠️  ADVERTENCIA: Esta acción eliminará TODOS los $messageCount mensajes" -ForegroundColor Red
        Write-Host ""
        $confirmacion = Read-Host "¿Estas SEGURO de que deseas eliminar todos los mensajes? (escribe SI para confirmar)"
        
        if ($confirmacion -eq "SI") {
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
        } else {
            Write-Host ""
            Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Red
        }
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error al conectar con Firebase:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifica:" -ForegroundColor Yellow
    Write-Host "   1. Que tengas conexión a internet" -ForegroundColor Yellow
    Write-Host "   2. Que las reglas de Firebase permitan la escritura" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
