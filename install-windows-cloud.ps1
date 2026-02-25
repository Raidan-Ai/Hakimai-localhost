#
# Hakim AI - Cloud Windows Server Deployment Script
# For Cloud VPS Providers (AWS, GCP, Azure, etc.)
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
Print-Info "Starting Hakim AI Cloud Setup for Windows Server..."

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

# --- Dockerized PostgreSQL ---
if (Test-Path ".\docker-compose.yml") {
    Print-Info "docker-compose.yml found. Starting PostgreSQL container..."
    docker-compose up -d db # Assumes your db service is named 'db'
} else {
    Print-Error "docker-compose.yml not found in the repository. Cannot start PostgreSQL."
}

# --- Environment Configuration ---
if (-not (Test-Path ".\.env")) {
    Print-Info "No .env file found. Creating from .env.example..."
    Copy-Item .\.env.example .\.env
    Print-Info "Please edit the .env file now with your domain, database credentials, and API keys."
    Read-Host -Prompt "Press [Enter] key to continue after editing .env..."
}

# --- Application Dependencies & Build ---
Print-Info "Installing Node.js dependencies..."
npm install

Print-Info "Applying Prisma migrations to the PostgreSQL database..."
npx prisma migrate deploy

Print-Info "Seeding the database with the Super Admin account..."
npx prisma db seed

Print-Info "Building the Next.js application..."
npm run build

# --- PM2 Process Management ---
Print-Info "Installing PM2 for process management..."
npm install pm2 -g

Print-Info "Starting the Hakim AI application with PM2..."
$appName = "hakim-ai-app"
if (pm2 list | Select-String -Pattern $appName) {
    Print-Info "$appName is already running. Restarting..."
    pm2 restart $appName
} else {
    Print-Info "Starting $appName..."
    pm2 start npm --name $appName -- start
}

# --- Windows Firewall Configuration ---
Print-Info "Configuring Windows Firewall..."
$port = 11455
$ruleName = "Hakim AI Port $port"
if (-not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $port
    Print-Success "Firewall rule '$ruleName' created for port $port."
} else {
    Print-Success "Firewall rule '$ruleName' already exists."
}

Print-Success "Hakim AI Cloud Deployment is complete!"
Print-Info "Configure your DNS and any cloud provider security groups to allow traffic to port $port."
Print-Info "You can monitor the application with 'pm2 logs $appName'."
