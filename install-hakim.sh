#!/bin/bash

# Hakim AI - Ubuntu 24.04 Automated Installer
# Developed by RaidanPro

set -e

echo "------------------------------------------------"
echo "   HAKIM AI - Enterprise Installer (Ubuntu)     "
echo "          Developed by RaidanPro                "
echo "------------------------------------------------"

# 1. Prerequisite Checks & Installation
install_if_missing() {
    if ! command -v $1 &> /dev/null; then
        echo "[INSTALLER] $1 not found. Installing..."
        sudo apt-get update
        sudo apt-get install -y $2
    else
        echo "[INSTALLER] $1 is already installed."
    fi
}

install_if_missing "curl" "curl"
install_if_missing "git" "git"

# Node.js v20+ Check
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]; then
    echo "[INSTALLER] Node.js v20+ not found. Installing via NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Docker Check
if ! command -v docker &> /dev/null; then
    echo "[INSTALLER] Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Ollama Check
if ! command -v ollama &> /dev/null; then
    echo "[INSTALLER] Ollama not found. Installing..."
    curl -fsSL https://ollama.com/install.sh | sh
fi

# 2. Directory Setup
INSTALL_DIR="/opt/hakim-ai"
echo "[INSTALLER] Setting up directory at $INSTALL_DIR..."
sudo mkdir -p $INSTALL_DIR
sudo chown $USER:$USER $INSTALL_DIR
cd $INSTALL_DIR

# 3. Clone / Copy Source (Assuming current directory for this demo)
# git clone https://github.com/RaidanPro/hakim-ai.git .

# 4. Environment Bootstrapper
echo "[INSTALLER] Generating .env configuration..."
cat <<EOF > .env
PORT=11455
BACKEND_PORT=11454
DATABASE_URL="file:./medical.db"
NODE_ENV="production"
ADMIN_DEFAULT_EMAIL="admin@hakim.local"
ADMIN_DEFAULT_PASSWORD="HakimSecurePass2026!"
OLLAMA_HOST="http://127.0.0.1:11434"
EOF

# 5. Database Setup (SQLite by default for bare-metal simplicity)
echo "[INSTALLER] Initializing database..."
npm install
npx prisma generate
npx prisma db push

# 6. Build & Start
echo "[INSTALLER] Building Hakim AI..."
npm run build

echo "------------------------------------------------"
echo "   HAKIM AI INSTALLATION COMPLETE               "
echo "   Frontend: http://localhost:11455             "
echo "   Backend:  http://localhost:11454             "
echo "------------------------------------------------"

# Start the application
# npm run start
