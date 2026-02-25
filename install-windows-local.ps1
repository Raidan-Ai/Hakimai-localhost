# ==============================================================================
# Hakim AI Local Deployment Script for Windows
# Author: RaidanPro DevOps
# Version: 1.0.0
# ==============================================================================

# --- Script Configuration ---
$ErrorActionPreference = 'Stop'
$InstallDir = "C:\Hakim-AI"

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
Write-Blue "========================================================"
Write-Blue "==  Starting Hakim AI Local Deployment on Windows   =="
Write-Blue "========================================================"

# --- 1. Install Prerequisites with Winget ---
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

# Ollama for Windows (Preview)
if (-not (Get-Command 'ollama' -ErrorAction SilentlyContinue)) {
    Write-Blue "Installing Ollama for Windows..."
    # As of now, Ollama provides an installer. This command invokes it.
    # This might require manual interaction.
    Invoke-WebRequest -Uri "https://ollama.com/download/windows" -OutFile "$env:TEMP\OllamaSetup.exe"
    Start-Process -FilePath "$env:TEMP\OllamaSetup.exe" -ArgumentList '/S' -Wait
    Write-Green "Ollama installation complete."
} else {
    Write-Green "Ollama is already installed."
}

# --- 2. Pull Ollama Model ---
Write-Green "\nPulling the 'llava-med' model. This may take some time..."
try {
    ollama pull llava-med
} catch {
    Write-Host "Could not pull Ollama model. Please ensure Ollama is running." -ForegroundColor Yellow
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
    (Get-Content .\.env) | ForEach-Object { $_ -replace 'DATABASE_URL=.*', 'DATABASE_URL="file:./medical.db"' } | Set-Content .\.env
    Write-Green "IMPORTANT: Please edit the .env file with your secrets."
} else {
    Write-Green ".env file already exists."
}

# --- 5. Install Dependencies and Start ---
Write-Green "\nInstalling Node.js dependencies..."
npm install

Write-Blue "Setting up the SQLite database..."
npx prisma migrate dev --name init
npx prisma db seed

Write-Blue "Starting the Hakim AI application..."
# This will start the app in the current PowerShell window.
# For production, consider using a process manager like PM2.
npm run dev

Write-Blue "======================================================"
Write-Green "==  Hakim AI Local Deployment Complete!           =="
Write-Blue "======================================================"
Write-Host "You can now access the application at http://localhost:11455"
