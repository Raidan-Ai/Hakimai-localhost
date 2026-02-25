#!/bin/bash
#
# Hakim AI - Local Ubuntu 24.04 LTS Deployment Script
# For Bare-Metal Clinic Servers & Laptops
# RaidanPro | 2024
#

set -e # Exit immediately if a command exits with a non-zero status.

# --- Color Codes ---
C_GREEN='\033[0;32m'
C_YELLOW='\033[1;33m'
C_RED='\033[0;31m'
C_NC='\033[0m' # No Color

# --- Helper Functions ---
print_info() {
    echo -e "${C_YELLOW}[INFO] $1${C_NC}"
}

print_success() {
    echo -e "${C_GREEN}[SUCCESS] $1${C_NC}"
}

print_error() {
    echo -e "${C_RED}[ERROR] $1${C_NC}"
    exit 1
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# --- Pre-flight Checks ---
print_info "Starting Hakim AI Local Setup for Ubuntu 24.04..."

if [ "$(id -u)" -ne 0 ]; then
    print_error "This script must be run as root. Please use sudo."
fi

# --- System Dependencies ---
print_info "Updating package lists and installing system dependencies..."
apt-get update
apt-get install -y apt-transport-https ca-certificates curl software-properties-common git nginx pm2

# --- Node.js v20+ ---
if ! command_exists node || ! node -v | grep -q "v20"; then
    print_info "Node.js v20 not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt-get install -y nodejs
else
    print_success "Node.js v20 is already installed."
fi

# --- Docker & Docker Compose ---
if ! command_exists docker; then
    print_info "Docker not found. Installing..."
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
    print_success "Docker is already installed."
fi

# --- Ollama Local AI Engine ---
if ! command_exists ollama; then
    print_info "Ollama not found. Installing..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    print_success "Ollama is already installed."
fi

print_info "Pulling the 'llava-med' model. This may take some time..."
ollama pull llava-med

# --- Project Setup ---
INSTALL_DIR="/opt/hakim-ai"
print_info "Cloning Hakim AI repository into $INSTALL_DIR..."

if [ -d "$INSTALL_DIR" ]; then
    print_info "Existing installation found. Pulling latest changes."
    cd "$INSTALL_DIR"
    git pull
else
    git clone https://github.com/RaidanPro/hakim-ai.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# --- Environment Configuration ---
if [ ! -f ".env" ]; then
    print_info "No .env file found. Creating from .env.example..."
    cp .env.example .env
    # Set local-specific variables
    sed -i 's,DATABASE_URL=.*,DATABASE_URL="file:./medical.db",' .env
    sed -i 's/PORT=.*/PORT=11455/' .env
    sed -i 's/BACKEND_PORT=.*/BACKEND_PORT=11454/' .env
    print_info "Please edit the .env file now with your specific configurations."
    # Pause for user to edit .env
    read -p "Press [Enter] key to continue after editing .env..."
fi

# --- Application Dependencies & Build ---
print_info "Installing Node.js dependencies..."
npm install

print_info "Setting up Prisma with SQLite..."
npx prisma migrate dev --name init

print_info "Seeding the database with the Super Admin account..."
npx prisma db seed

print_info "Building the Next.js application..."
npm run build

# --- PM2 Process Management ---
print_info "Starting the Hakim AI application with PM2..."

# The server.ts will be started by the Next.js custom server configuration
# The main app is started via `npm start` which should be `next start -p 11455`

if pm2 list | grep -q "hakim-ai-app"; then
    print_info "hakim-ai-app is already running. Restarting..."
    pm2 restart hakim-ai-app
else
    print_info "Starting hakim-ai-app..."
    pm2 start npm --name "hakim-ai-app" -- start
fi

pm2 startup
pm2 save

print_success "Hakim AI Local Deployment is complete!"
print_info "You can access the application at http://localhost:11455"
print_info "To monitor the application, use 'pm2 logs hakim-ai-app'."
