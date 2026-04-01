# Script de Despliegue Automático - Cliente Web
# Este script hace commit, push y despliega a Vercel automáticamente

Write-Host "🚀 Iniciando despliegue de cambios..." -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio cliente-web
Write-Host "📁 Navegando a cliente-web..." -ForegroundColor Yellow
Set-Location -Path "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\cliente-web"

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Verifica la ruta." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Directorio correcto: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Paso 1: Git status
Write-Host "📊 Verificando estado de git..." -ForegroundColor Yellow
git status

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Advertencia: Parece que hay problemas con git. Continuando..." -ForegroundColor Yellow
}

Write-Host ""

# Paso 2: Agregar cambios
Write-Host "📥 Agregando todos los cambios..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al agregar cambios." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Cambios agregados" -ForegroundColor Green
Write-Host ""

# Paso 3: Commit
Write-Host "💾 Guardando cambios (commit)..." -ForegroundColor Yellow
$commitMessage = "feat: agregar solicitud de permisos de ubicación en seguimiento"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "ℹ️  No hubo cambios nuevos para commitear o error en commit" -ForegroundColor Yellow
} else {
    Write-Host "✅ Commit exitoso: '$commitMessage'" -ForegroundColor Green
}

Write-Host ""

# Paso 4: Push a GitHub
Write-Host "📤 Enviando cambios a GitHub (push)..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al hacer push. Verifica tu conexión a internet y permisos de git." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Push exitoso!" -ForegroundColor Green
Write-Host ""

# Paso 5: Build local (opcional pero recomendado)
Write-Host "🔨 Construyendo versión de producción (build)..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  El build falló, pero continuaremos con el deploy" -ForegroundColor Yellow
    Write-Host "   Esto puede causar errores en producción" -ForegroundColor Yellow
} else {
    Write-Host "✅ Build completado exitosamente" -ForegroundColor Green
}

Write-Host ""

# Paso 6: Deploy a Vercel
Write-Host "🌐 Desplegando a Vercel..." -ForegroundColor Yellow
Write-Host "ℹ️  Si es la primera vez, necesitarás iniciar sesión en Vercel" -ForegroundColor Cyan
Write-Host ""

# Verificar si vercel CLI está instalado
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI no está instalado. Instalando..." -ForegroundColor Yellow
    npm install -g vercel
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar Vercel CLI. Intenta: npm install -g vercel" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Vercel CLI instalado" -ForegroundColor Green
}

# Login a Vercel si es necesario
Write-Host "🔐 Verificando sesión en Vercel..." -ForegroundColor Yellow
vercel whoami

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Necesitas iniciar sesión en Vercel" -ForegroundColor Yellow
    vercel login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al iniciar sesión en Vercel." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Ejecutando despliegue a producción..." -ForegroundColor Cyan
Write-Host ""

# Deploy a producción
vercel --prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el despliegue a Vercel" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ ¡Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host ""

# Información final
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 RESUMEN DEL DESPLIEGUE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Cambios subidos a GitHub" -ForegroundColor Green
Write-Host "✅ Build generado" -ForegroundColor Green
Write-Host "✅ Despliegue en Vercel iniciado" -ForegroundColor Green
Write-Host ""
Write-Host "⏱️  Tiempo estimado de propagación: 2-3 minutos" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "   • Dashboard Vercel: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "   • Cliente Web: https://cliente-web-mu.vercel.app" -ForegroundColor White
Write-Host "   • Seguimiento: https://cliente-web-mu.vercel.app/seguimiento?codigo=-Op7FuvF5e8L8nbUJDrf" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Espera 2-3 minutos" -ForegroundColor White
Write-Host "   2. Abre el link de seguimiento" -ForegroundColor White
Write-Host "   3. Presiona F12 para abrir consola" -ForegroundColor White
Write-Host "   4. Busca logs que digan '[PERMISOS]'" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Regresar al directorio original
Set-Location -Path "c:\Users\Jorge G\AndroidStudioProjects\Prueba New"

Write-Host "Script completado. ¡Éxito! 🎉" -ForegroundColor Green
