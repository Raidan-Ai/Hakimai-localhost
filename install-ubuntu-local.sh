#!/bin/bash
# ==============================================================================
# Hakim AI Local Deployment Script for Ubuntu 24.04
# Author: RaidanPro DevOps
# Version: 1.0.0
# ==============================================================================

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Helper Functions ---
echo_green() {
    echo -e "\033[0;32m$1\033[0m"
}

echo_blue() {
    echo -e "\033[0;34m$1\033[0m"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# --- Installation Variables ---
INSTALL_DIR="/opt/hakim-ai"
NODE_VERSION="20"

echo_blue "======================================================"
echo_blue "==  Starting Hakim AI Local Deployment on Ubuntu  =="
echo_blue "======================================================"

# --- 1. System Update ---
echo_green "\nUpdating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# --- 2. Install Prerequisites (Node.js, Git, Nginx, PM2) ---
echo_green "\nInstalling prerequisites..."

# Node.js (v20+)
if ! command_exists node || ! node -v | grep -q "v${NODE_VERSION}"; then
    echo_blue "Installing Node.js v${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo_green "Node.js is already installed."
fi

# Git
if ! command_exists git; then
    echo_blue "Installing Git..."
    sudo apt-get install -y git
else
    echo_green "Git is already installed."
fi

# Nginx
if ! command_exists nginx; then
    echo_blue "Installing Nginx..."
    sudo apt-get install -y nginx
else
    echo_green "Nginx is already installed."
fi

# PM2 Process Manager
if ! command_exists pm2; then
    echo_blue "Installing PM2 globally..."
    sudo npm install pm2 -g
else
    echo_green "PM2 is already installed."
fi

# --- 3. Install Docker & Docker Compose ---
echo_green "\nInstalling Docker and Docker Compose..."
if ! command_exists docker; then
    echo_blue "Installing Docker Engine..."
    sudo apt-get install -y ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
    echo_green "Docker installed. You may need to log out and log back in for group changes to take effect."
else
    echo_green "Docker is already installed."
fi

# --- 4. Install Ollama and Pull Medical Model ---
echo_green "\nInstalling Ollama AI Engine..."
if ! command_exists ollama; then
    echo_blue "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo_green "Ollama is already installed."
fi

echo_blue "Pulling the 'llava-med' model. This may take some time..."
ollama pull llava-med

# --- 5. Setup Hakim AI Application ---
echo_green "\nSetting up the Hakim AI application directory at ${INSTALL_DIR}..."
sudo mkdir -p ${INSTALL_DIR}/uploads
sudo chown -R $USER:$USER ${INSTALL_DIR}
cd ${INSTALL_DIR}

echo_blue "Cloning the Hakim AI repository..."
git clone https://github.com/RaidanPro/hakim-ai.git .

# --- 6. Configure Environment ---
echo_green "\nConfiguring environment..."
if [ ! -f ".env" ]; then
    echo_blue "Creating .env file from .env.example..."
    cp .env.example .env
    echo_green "IMPORTANT: Please edit the .env file with your secrets and database URL."
    sed -i 's|DATABASE_URL=.*|DATABASE_URL="file:./medical.db"|' .env
else
    echo_green ".env file already exists."
fi

# --- 7. Install Dependencies and Build ---
echo_green "\nInstalling Node.js dependencies..."
npm install

echo_blue "Setting up the database..."
npx prisma migrate dev --name init
npx prisma db seed

echo_blue "Building the Next.js application for production..."
npm run build

# --- 8. Configure MCP (Model Context Protocol) ---
echo_green "\nConfiguring MCP for local file access..."
mkdir -p mcp-server
cat <<EOF > mcp-server/index.js
console.log('MCP Server Started - Local file access enabled for AI.');
// Actual server logic would go here.
EOF

# --- 9. Start Application with PM2 ---
echo_green "\nStarting Hakim AI with PM2..."
pm2 start npm --name "hakim-ai" -- start
pm2 startup
pm2 save

echo_blue "======================================================"
echo_green "==  Hakim AI Local Deployment Complete!           =="
echo_blue "======================================================"
echo "You can now access the application at http://localhost:11455"
echo "To monitor the application, use 'pm2 list' or 'pm2 monit'."
