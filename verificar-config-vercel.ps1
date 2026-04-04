# Verificador Automatico - Configuracion Vercel y Firebase
# Este script verifica que todo este correctamente configurado

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICADOR DE CONFIGURACION VERCEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\cliente-web"
Set-Location $projectRoot

# Verificar archivos requeridos
Write-Host "1️⃣  Verificando archivos requeridos..." -ForegroundColor Yellow

$requiredFiles = @(
    ".env.local",
    ".env.example",
    "vercel.json",
    "package.json",
    "src/services/Firebase.ts"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file - FALTA!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2️⃣  Verificando variables de entorno en .env.local..." -ForegroundColor Yellow

$requiredVars = @(
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_DATABASE_URL",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
    "VITE_GOOGLE_MAPS_API_KEY"
)

$envContent = Get-Content ".env.local"
$missingVars = @()

foreach ($var in $requiredVars) {
    $found = $envContent -match "^$var="
    if ($found) {
        $value = ($envContent -match "^$var=").Split('=')[1]
        if ($value -eq "tu_api_key_aqui" -or $value -eq "TU_API_KEY") {
            Write-Host "   ⚠️  $var - Tiene valor por defecto!" -ForegroundColor Yellow
        } else {
            Write-Host "   ✅ $var - Configurada" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ $var - FALTA!" -ForegroundColor Red
        $missingVars += $var
    }
}

Write-Host ""
Write-Host "3️⃣  Verificando configuración de Firebase..." -ForegroundColor Yellow

# Extraer valores del .env.local
$firebaseConfig = @{}
foreach ($line in $envContent) {
    if ($line -match "^(VITE_FIREBASE_.+)=(.+)$") {
        $firebaseConfig[$matches[1]] = $matches[2]
    }
}

if ($firebaseConfig["VITE_FIREBASE_PROJECT_ID"]) {
    $projectId = $firebaseConfig["VITE_FIREBASE_PROJECT_ID"]
    Write-Host "   📦 Project ID: $projectId" -ForegroundColor Cyan
    
    # Verificar URL de Firebase
    $expectedDbUrl = "https://$projectId-default-rtdb.firebaseio.com"
    if ($firebaseConfig["VITE_FIREBASE_DATABASE_URL"] -eq $expectedDbUrl) {
        Write-Host "   ✅ Database URL correcta" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Database URL podría ser incorrecta" -ForegroundColor Yellow
        Write-Host "      Esperado: $expectedDbUrl" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ No se pudo verificar Project ID" -ForegroundColor Red
}

Write-Host ""
Write-Host "4️⃣  Verificando dependencias de npm..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules existe" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  node_modules no existe - Ejecuta: npm install" -ForegroundColor Yellow
}

$packageJson = Get-Content "package.json" | ConvertFrom-Json
$requiredDeps = @("firebase", "@googlemaps/js-api-loader", "react-router-dom")

foreach ($dep in $requiredDeps) {
    if ($packageJson.dependencies.$dep) {
        Write-Host "   ✅ $dep $($packageJson.dependencies.$dep)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $dep - No está en dependencies!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "5️⃣  Verificando código de geolocalización..." -ForegroundColor Yellow

# Verificar que TrackOrderPage.tsx tenga la implementación correcta
$trackOrderContent = Get-Content "src/pages/TrackOrderPage.tsx" -Raw

if ($trackOrderContent -match "navigator\.geolocation\.getCurrentPosition") {
    Write-Host "   ✅ TrackOrderPage usa geolocalización" -ForegroundColor Green
} else {
    Write-Host "   ❌ TrackOrderPage NO usa geolocalización!" -ForegroundColor Red
}

if ($trackOrderContent -match "customerLocation\.latitude") {
    Write-Host "   ✅ Guarda customerLocation en Firebase" -ForegroundColor Green
} else {
    Write-Host "   ❌ NO guarda customerLocation en Firebase!" -ForegroundColor Red
}

if ($trackOrderContent -match "navigator\.permissions\.query") {
    Write-Host "   ⚠️  Verifica permisos previos (podría causar problemas)" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ NO verifica permisos previos (correcto)" -ForegroundColor Green
}

Write-Host ""
Write-Host "6️⃣  Verificando estado de Git..." -ForegroundColor Yellow

try {
    $gitStatus = git status --porcelain 2>$null
    if ($LASTEXITCODE -eq 0) {
        if ($gitStatus) {
            Write-Host "   ⚠️  Hay cambios sin commitear:" -ForegroundColor Yellow
            git status --short | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
        } else {
            Write-Host "   ✅ Working directory limpio" -ForegroundColor Green
        }
        
        $branch = git branch --show-current
        Write-Host "   📌 Rama: $branch" -ForegroundColor Cyan
        
    } else {
        Write-Host "   ⚠️  Git no está disponible o no es un repositorio" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Error al verificar Git: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "7️⃣  Verificando reglas de Firebase..." -ForegroundColor Yellow

if (Test-Path "..\firebase-rules.json") {
    $rulesContent = Get-Content "..\firebase-rules.json" -Raw
    if ($rulesContent -match '".read":\s*true' -and $rulesContent -match '".write":\s*true') {
        Write-Host "   ⚠️  Reglas de Firebase son MUY PERMISIVAS (solo desarrollo)" -ForegroundColor Yellow
        Write-Host "      Considera usar reglas más seguras para producción" -ForegroundColor Gray
    } else {
        Write-Host "   ✅ Reglas de Firebase parecen seguras" -ForegroundColor Green
    }
} else {
    Write-Host "   ℹ️  No se encontró firebase-rules.json" -ForegroundColor Gray
}

Write-Host ""
Write-Host "8️⃣  Resumen de Acciones Requeridas" -ForegroundColor Yellow
Write-Host "   ──────────────────────────────────────" -ForegroundColor DarkGray

$actionRequired = $false

if ($missingVars.Count -gt 0) {
    Write-Host "   ❌ Faltan variables de entorno: $($missingVars -join ', ')" -ForegroundColor Red
    Write-Host "      Solución: Agregar al archivo .env.local" -ForegroundColor Gray
    $actionRequired = $true
}

if (-not (Test-Path "node_modules")) {
    Write-Host "   ❌ Dependencias no instaladas" -ForegroundColor Red
    Write-Host "      Solución: Ejecutar 'npm install'" -ForegroundColor Gray
    $actionRequired = $true
}

if ($trackOrderContent -match "navigator\.permissions\.query") {
    Write-Host "   ⚠️  Código verifica permisos previos" -ForegroundColor Yellow
    Write-Host "      Esto puede evitar que aparezca el prompt" -ForegroundColor Gray
    $actionRequired = $true
}

if (-not $actionRequired) {
    Write-Host "   ✅ ¡Todo parece estar correcto!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Siguientes pasos:" -ForegroundColor Cyan
    Write-Host "   1. Configurar variables de entorno en Vercel Dashboard" -ForegroundColor White
    Write-Host "   2. Hacer push para desplegar: git push" -ForegroundColor White
    Write-Host "   3. Probar la app en https://tu-proyecto.vercel.app" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verificación completada" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Instrucciones finales
Write-Host "📋 PRÓXIMOS PASOS RECOMENDADOS:" -ForegroundColor Magenta
Write-Host ""
Write-Host "1. Configurar variables en Vercel:" -ForegroundColor White
Write-Host "   - Ve a: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "   - Selecciona tu proyecto" -ForegroundColor Gray
Write-Host "   - Settings → Environment Variables" -ForegroundColor Gray
Write-Host "   - Agrega todas las variables del .env.local" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Forzar nuevo deploy:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m 'actualizar configuración'" -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Verificar en Vercel:" -ForegroundColor White
Write-Host "   - El deploy debe estar en ~2-5 minutos" -ForegroundColor Gray
Write-Host "   - La URL debe usar HTTPS (automático en Vercel)" -ForegroundColor Gray
Write-Host "   - Prueba la geolocalización en el navegador" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Si hay problemas, revisar consola del navegador (F12):" -ForegroundColor White
Write-Host "   - Errores de Firebase = variables mal configuradas" -ForegroundColor Gray
Write-Host "   - Error de permisos = usuario denegó ubicación" -ForegroundColor Gray
Write-Host "   - Mapa no carga = Google Maps API Key inválida" -ForegroundColor Gray
Write-Host ""
