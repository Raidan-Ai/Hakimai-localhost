# ==============================================================================
# Hakim AI Cloud-Connected Deployment Script for Windows
# Author: RaidanPro DevOps
# Version: 1.0.0
# ==============================================================================

# --- Script Configuration ---
$ErrorActionPreference = 'Stop'
$InstallDir = "C:\Hakim-AI-Cloud"

# --- Helper Functions ---
function Write-Green {
    param([string]$Text)
    Write-Host $Text -ForegroundColor Green
}

function Write-Blue {
    param([string]$Text)
    Write-Host $Text -ForegroundColor Cyan
}

function Command-Exists {
    param([string]$Command)
    return (Get-Command $Command -ErrorAction SilentlyContinue) -ne $null
}

# --- Start of Script ---
Write-Blue "============================================================"
Write-Blue "==  Starting Hakim AI Cloud Deployment on Windows Server  =="
Write-Blue "============================================================"

# --- 1. Install Prerequisites ---
Write-Green "\nChecking and installing prerequisites..."

# Git
if (-not (Command-Exists git)) {
    Write-Blue "Installing Git..."
    winget install --id Git.Git -e --source winget
} else {
    Write-Green "Git is already installed."
}

# Node.js LTS
if (-not (Command-Exists node)) {
    Write-Blue "Installing Node.js (LTS)..."
    winget install --id OpenJS.NodeJS.LTS -e --source winget
} else {
    Write-Green "Node.js is already installed."
}

# Docker Desktop
if (-not (Get-Command 'C:\Program Files\Docker\Docker\Docker Desktop.exe' -ErrorAction SilentlyContinue)) {
    Write-Blue "Installing Docker Desktop..."
    winget install --id Docker.DockerDesktop -e --source winget
    Write-Green "Docker Desktop installation started. Please complete the setup and ensure it is running."
} else {
    Write-Green "Docker Desktop is already installed."
}

# --- 2. Setup PostgreSQL with Docker ---
Write-Green "\nSetting up PostgreSQL in a Docker container..."
if (-not (docker ps -q -f name=hakim-postgres)) {
    if (docker ps -aq -f status=exited -f name=hakim-postgres) {
        Write-Blue "Removing existing stopped container..."
        docker rm hakim-postgres
    }
    Write-Blue "Starting new PostgreSQL container..."
    # IMPORTANT: Change POSTGRES_PASSWORD in a secure way
    docker run -d `
      --name hakim-postgres `
      -e POSTGRES_PASSWORD=mysecretpassword `
      -e POSTGRES_USER=hakim `
      -e POSTGRES_DB=hakimdb `
      -v hakim-pgdata:/var/lib/postgresql/data `
      -p 5432:5432 `
      --restart unless-stopped `
      postgres:16
} else {
    Write-Green "PostgreSQL container is already running."
}

# --- 3. Setup Hakim AI Application ---
Write-Green "\nSetting up the Hakim AI application directory at $InstallDir..."
if (-not (Test-Path $InstallDir)) {
    New-Item -Path $InstallDir -ItemType Directory | Out-Null
}
Set-Location -Path $InstallDir

Write-Blue "Cloning the Hakim AI repository..."
if (-not (Test-Path ".git")) {
    git clone https://github.com/RaidanPro/hakim-ai.git .
} else {
    Write-Green "Repository already cloned."
}

# --- 4. Configure Environment ---
Write-Green "\nConfiguring environment..."
if (-not (Test-Path ".env")) {
    Write-Blue "Creating .env file from .env.example..."
    Copy-Item -Path ".env.example" -Destination ".env"
    (Get-Content .\.env) | ForEach-Object { $_ -replace 'DATABASE_URL=.*', 'DATABASE_URL="postgresql://hakim:mysecretpassword@localhost:5432/hakimdb?schema=public"' } | Set-Content .\.env
    Write-Green "IMPORTANT: Please edit the .env file with your secrets and production domain."
} else {
    Write-Green ".env file already exists."
}

# --- 5. Install Dependencies and Start ---
Write-Green "\nInstalling Node.js dependencies..."
npm install

Write-Blue "Setting up the PostgreSQL database..."
npx prisma migrate deploy
npx prisma db seed

Write-Blue "Building and starting the Hakim AI application for production..."
# For a real production server, you would use PM2 or another process manager.
npm run build
npm start

Write-Blue "======================================================"
Write-Green "==   Hakim AI Cloud Deployment Complete!          =="
Write-Blue "======================================================"
Write-Host "The application is running. Configure your firewall and reverse proxy (like Nginx or IIS) to expose it to the internet."
