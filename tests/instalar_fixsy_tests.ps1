<#
.SYNOPSIS
    Instalador automático del entorno de testing para el proyecto Fixsy Parts.
.DESCRIPTION
    Este script de PowerShell instala todas las dependencias principales del proyecto
    y luego instala las dependencias de desarrollo necesarias para ejecutar tests
    con Karma, Jasmine, y React Testing Library.
.AUTHOR
    Sahnb
#>

# --- Funciones para mensajes en colores ---
function Write-Header {
    param([string]$Message)
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "⏳ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# --- Inicio del Script ---
Clear-Host
Write-Header "Instalador de Entorno de Testing para Fixsy Parts"

try {
    # 1. Instalar dependencias principales del proyecto
    Write-Info "Instalando dependencias principales del proyecto (npm install)..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Ocurrió un error durante 'npm install'. Revisa los mensajes de error."
    }
    Write-Success "Dependencias principales instaladas."
    Write-Host ""

    # 2. Instalar dependencias del entorno de testing
    Write-Info "Instalando dependencias de testing (Karma, Jasmine, RTL)..."
    $devDependencies = @(
        "karma", "karma-jasmine", "jasmine-core", "@types/jasmine",
        "karma-chrome-launcher", "karma-coverage", "karma-spec-reporter",
        "karma-esbuild", "esbuild", "esbuild-plugin-istanbul",
        "@testing-library/react", "@testing-library/dom",
        "@testing-library/jest-dom", "@testing-library/user-event", "jsdom"
    )
    npm install --save-dev $devDependencies
    if ($LASTEXITCODE -ne 0) {
        throw "Ocurrió un error instalando las dependencias de testing. Revisa los mensajes de error."
    }
    Write-Success "Dependencias de testing instaladas correctamente."
    Write-Host ""

    # 3. Mensaje final de éxito
    Write-Header "¡Instalación completada con éxito!"
    Write-Info "Ahora puedes ejecutar los tests con el comando: npm test"
}
catch {
    Write-Error "El script ha fallado: $_"
}