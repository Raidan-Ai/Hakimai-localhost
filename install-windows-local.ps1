#
# Hakim AI - Local Windows Deployment Script
# For Bare-Metal Clinic Servers & Laptops
# RaidanPro | 2024
#

# --- Script Configuration ---
$ErrorActionPreference = 'Stop'

# --- Helper Functions ---
function Print-Info {
    param ([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Yellow
}

function Print-Success {
    param ([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Print-Error {
    param ([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    exit 1
}

function Command-Exists {
    param ([string]$Command)
    return (Get-Command $Command -ErrorAction SilentlyContinue) -ne $null
}

# --- Pre-flight Checks ---
Print-Info "Starting Hakim AI Local Setup for Windows..."

# Check for Administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Print-Error "This script must be run as an Administrator."
}

# --- Chocolatey Package Manager ---
if (-not (Command-Exists choco)) {
    Print-Info "Chocolatey not found. Installing..."
    Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
} else {
    Print-Success "Chocolatey is already installed."
}

# --- Dependencies via Chocolatey ---
$packages = @("nodejs.install --version=20", "git", "docker-desktop")

foreach ($pkg in $packages) {
    $pkgName = $pkg.Split(' ')[0]
    Print-Info "Checking for $pkgName..."
    try {
        choco install $pkg -y --accept-licenses
        Print-Success "$pkgName installed/updated."
    } catch {
        Print-Error "Failed to install $pkgName via Chocolatey."
    }
}

# --- Ollama for Windows ---
$ollamaPath = "$env:ProgramFiles\Ollama\ollama.exe"
if (-not (Test-Path $ollamaPath)) {
    Print-Info "Ollama for Windows not found. Please download and install it from https://ollama.com/download/windows"
    Start-Process "https://ollama.com/download/windows"
    Read-Host -Prompt "Press [Enter] key to continue after installing Ollama..."
} else {
    Print-Success "Ollama for Windows is already installed."
}

Print-Info "Pulling the 'llava-med' model. This may take some time..."
& $ollamaPath pull llava-med

# --- Project Setup ---
$installDir = "$env:SystemDrive\Hakim-AI"
Print-Info "Cloning Hakim AI repository into $installDir..."

if (Test-Path $installDir) {
    Print-Info "Existing installation found. Pulling latest changes."
    Set-Location $installDir
    git pull
} else {
    git clone https://github.com/RaidanPro/hakim-ai.git $installDir
    Set-Location $installDir
}

# --- Environment Configuration ---
if (-not (Test-Path ".\.env")) {
    Print-Info "No .env file found. Creating from .env.example..."
    Copy-Item .\.env.example .\.env
    # Set local-specific variables
    (Get-Content .\.env) | ForEach-Object { $_ -replace 'DATABASE_URL=.*', 'DATABASE_URL="file:./medical.db"' } | Set-Content .\.env
    (Get-Content .\.env) | ForEach-Object { $_ -replace 'PORT=.*', 'PORT=11455' } | Set-Content .\.env
    (Get-Content .\.env) | ForEach-Object { $_ -replace 'BACKEND_PORT=.*', 'BACKEND_PORT=11454' } | Set-Content .\.env
    Print-Info "Please edit the .env file now with your specific configurations."
    Read-Host -Prompt "Press [Enter] key to continue after editing .env..."
}

# --- Application Dependencies & Build ---
Print-Info "Installing Node.js dependencies..."
npm install

Print-Info "Setting up Prisma with SQLite..."
npx prisma migrate dev --name init

Print-Info "Seeding the database with the Super Admin account..."
npx prisma db seed

Print-Info "Building the Next.js application..."
npm run build

# --- Start Application ---
Print-Info "Starting the Hakim AI application..."
# This will open a new terminal window for the app.
# For a production setup, consider using a process manager like PM2.
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"

Print-Success "Hakim AI Local Deployment is complete!"
Print-Info "The application is running in a new PowerShell window."
Print-Info "You can access it at http://localhost:11455"
