# Hakim AI - Windows Automated Installer
# Developed by RaidanPro

Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host "   HAKIM AI - Enterprise Installer (Windows)    " -ForegroundColor Cyan
Write-Host "          Developed by RaidanPro                " -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor Cyan

# 1. Prerequisite Checks (using winget)
function Install-IfMissing($Command, $PackageId) {
    if (!(Get-Command $Command -ErrorAction SilentlyContinue)) {
        Write-Host "[INSTALLER] $Command not found. Installing $PackageId via winget..."
        winget install --id $PackageId --silent --accept-package-agreements --accept-source-agreements
    } else {
        Write-Host "[INSTALLER] $Command is already installed."
    }
}

# Ensure winget is available
if (!(Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Error "[INSTALLER] winget not found. Please install App Installer from the Microsoft Store."
    exit
}

Install-IfMissing "node" "OpenJS.NodeJS.LTS"
Install-IfMissing "ollama" "Ollama.Ollama"

# 2. Directory Setup
$InstallDir = "C:\HakimAI"
if (!(Test-Path $InstallDir)) {
    Write-Host "[INSTALLER] Creating directory at $InstallDir..."
    New-Item -Path $InstallDir -ItemType Directory
}
Set-Location $InstallDir

# 3. Environment Bootstrapper
Write-Host "[INSTALLER] Generating .env configuration..."
$EnvContent = @"
PORT=11455
BACKEND_PORT=11454
DATABASE_URL="file:./medical.db"
NODE_ENV="production"
ADMIN_DEFAULT_EMAIL="admin@hakim.local"
ADMIN_DEFAULT_PASSWORD="HakimSecurePass2026!"
OLLAMA_HOST="http://127.0.0.1:11434"
"@
$EnvContent | Out-File -FilePath .env -Encoding utf8

# 4. Installation & Build
Write-Host "[INSTALLER] Installing dependencies..."
npm install

Write-Host "[INSTALLER] Initializing database..."
npx prisma generate
npx prisma db push

Write-Host "[INSTALLER] Building Hakim AI..."
npm run build

Write-Host "------------------------------------------------" -ForegroundColor Green
Write-Host "   HAKIM AI INSTALLATION COMPLETE               " -ForegroundColor Green
Write-Host "   Frontend: http://localhost:11455             " -ForegroundColor Green
Write-Host "   Backend:  http://localhost:11454             " -ForegroundColor Green
Write-Host "------------------------------------------------" -ForegroundColor Green

Write-Host "To start the app, run: npm run start"
