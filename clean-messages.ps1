# Script para eliminar todos los mensajes de Firebase
$firebaseUrl = "https://myappdelivery-4a576-default-rtdb.firebaseio.com"

Write-Host "======================================"
Write-Host "  ELIMINAR MENSAJES DE FIREBASE"
Write-Host "======================================"
Write-Host ""

$messagesUrl = "$firebaseUrl/messages.json"

try {
    Write-Host "Verificando mensajes existentes..."
    $response = Invoke-RestMethod -Uri $messagesUrl -Method Get
    
    if ($response -eq $null) {
        Write-Host "No hay mensajes en la base de datos"
    } else {
        $messageCount = ($response | Get-Member -MemberType NoteProperty).Count
        Write-Host "Se encontraron $messageCount mensajes"
        Write-Host ""
        Write-Host "Eliminando todos los mensajes..."
        
        # Eliminar nodo messages completo
        $deleteResponse = Invoke-RestMethod -Uri $messagesUrl -Method Put -Body "null" -ContentType "application/json"
        
        Write-Host "MENSAJES ELIMINADOS EXITOSAMENTE!"
        Write-Host ""
        
        # Verificar que se eliminaron
        Write-Host "Verificando eliminacion..."
        Start-Sleep -Seconds 2
        
        $verifyResponse = Invoke-RestMethod -Uri $messagesUrl -Method Get
        
        if ($verifyResponse -eq $null) {
            Write-Host "Confirmado: No quedan mensajes en la base de datos"
        } else {
            $remainingCount = ($verifyResponse | Get-Member -MemberType NoteProperty).Count
            Write-Host "Aun quedan $remainingCount mensajes"
        }
    }
} catch {
    Write-Host ""
    Write-Host "Error al conectar con Firebase:"
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Verifica conexion a internet y reglas de Firebase"
}

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
