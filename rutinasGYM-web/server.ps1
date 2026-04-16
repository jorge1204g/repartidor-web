$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://0.0.0.0:8000/')
$listener.Start()
Write-Host "Servidor iniciado en http://192.168.100.3:8000"
Write-Host "Presiona Ctrl+C para detener"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $filePath = Join-Path "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\rutinasGYM-web" $request.Url.LocalPath.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
        }
        
        $response.Close()
    }
}
finally {
    $listener.Stop()
}
