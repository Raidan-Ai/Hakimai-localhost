#!/bin/bash
# ==============================================================================
# Hakim AI Cloud Deployment Script for Ubuntu 24.04
# Author: RaidanPro DevOps
# Version: 1.0.0
# ==============================================================================

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
DOMAIN_NAME="hakim.your-clinic.com" # CHANGE THIS to your actual domain

echo_blue "====================================================="
echo_blue "==  Starting Hakim AI Cloud Deployment on Ubuntu =="
echo_blue "====================================================="

# --- 1. System Update & Prerequisites ---
echo_green "\nUpdating and installing base packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw

# --- 2. Install Node.js, PM2 ---
echo_green "\nInstalling Node.js and PM2..."
if ! command_exists node || ! node -v | grep -q "v${NODE_VERSION}"; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo_green "Node.js is already installed."
fi

if ! command_exists pm2; then
    sudo npm install pm2 -g
else
    echo_green "PM2 is already installed."
fi

# --- 3. Install Docker & Docker Compose ---
echo_green "\nInstalling Docker and Docker Compose..."
if ! command_exists docker; then
    sudo apt-get install -y ca-certificates
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
else
    echo_green "Docker is already installed."
fi

# --- 4. Setup PostgreSQL with Docker ---
echo_green "\nSetting up PostgreSQL in a Docker container..."
sudo mkdir -p /var/lib/postgresql/data

if [ ! "$(sudo docker ps -q -f name=hakim-postgres)" ]; then
    if [ "$(sudo docker ps -aq -f status=exited -f name=hakim-postgres)" ]; then
        echo_blue "Removing existing stopped container..."
        sudo docker rm hakim-postgres
    fi
    echo_blue "Starting new PostgreSQL container..."
    # IMPORTANT: Change POSTGRES_PASSWORD in a secure way
    sudo docker run -d \
      --name hakim-postgres \
      -e POSTGRES_PASSWORD=mysecretpassword \
      -e POSTGRES_USER=hakim \
      -e POSTGRES_DB=hakimdb \
      -v /var/lib/postgresql/data:/var/lib/postgresql/data \
      -p 5432:5432 \
      --restart unless-stopped \
      postgres:16
else
    echo_green "PostgreSQL container is already running."
fi

# --- 5. Setup Hakim AI Application ---
echo_green "\nSetting up the Hakim AI application directory..."
sudo mkdir -p ${INSTALL_DIR}/uploads
sudo chown -R $USER:$USER ${INSTALL_DIR}
cd ${INSTALL_DIR}

echo_blue "Cloning the Hakim AI repository..."
git clone https://github.com/RaidanPro/hakim-ai.git .

# --- 6. Configure Environment ---
echo_green "\nConfiguring environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo_green "IMPORTANT: Edit .env with your secrets, domain, and database URL."
    # Set database to PostgreSQL for cloud installs
    sed -i 's|DATABASE_URL=.*|DATABASE_URL="postgresql://hakim:mysecretpassword@localhost:5432/hakimdb?schema=public"|' .env
    sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://${DOMAIN_NAME}|" .env
else
    echo_green ".env file already exists."
fi

# --- 7. Install Dependencies and Build ---
echo_green "\nInstalling dependencies and building application..."
npm install
npx prisma migrate deploy
npx prisma db seed
npm run build

# --- 8. Configure Nginx Reverse Proxy ---
echo_green "\nConfiguring Nginx reverse proxy..."
cat <<EOF | sudo tee /etc/nginx/sites-available/hakim-ai
server {
    listen 80;
    server_name ${DOMAIN_NAME};

    location / {
        proxy_pass http://127.0.0.1:11455;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
server {
    listen 11454;
    server_name ${DOMAIN_NAME};

    location / {
        proxy_pass http://127.0.0.1:11454;
        # Add security headers and rate limiting here in a real scenario
    }
}
EOF

sudo ln -sfn /etc/nginx/sites-available/hakim-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# --- 9. Configure Firewall with UFW ---
echo_green "\nConfiguring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow 22/tcp # SSH
sudo ufw --force enable

# --- 10. Start Application with PM2 ---
echo_green "\nStarting Hakim AI with PM2..."
pm2 start npm --name "hakim-ai" -- start
pm2 startup
pm2 save

echo_blue "====================================================="
echo_green "==   Hakim AI Cloud Deployment Complete!         =="
echo_blue "====================================================="
echo "The application is starting. Point your domain ${DOMAIN_NAME} to this server's IP."
echo "You may need to install an SSL certificate (e.g., with Certbot) for HTTPS."
