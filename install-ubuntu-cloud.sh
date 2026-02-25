#!/bin/bash
#
# Hakim AI - Cloud Ubuntu 24.04 LTS Deployment Script
# For Cloud VPS Providers (AWS, GCP, Azure, etc.)
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
print_info "Starting Hakim AI Cloud Setup for Ubuntu 24.04..."

if [ "$(id -u)" -ne 0 ]; then
    print_error "This script must be run as root. Please use sudo."
fi

# --- System Dependencies ---
print_info "Updating package lists and installing system dependencies..."
apt-get update
apt-get install -y apt-transport-https ca-certificates curl software-properties-common git nginx ufw

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

# --- Dockerized PostgreSQL ---
if [ -f "docker-compose.yml" ]; then
    print_info "docker-compose.yml found. Starting PostgreSQL container..."
    docker compose up -d db # Assumes your db service is named 'db'
else
    print_error "docker-compose.yml not found in the repository. Cannot start PostgreSQL."
fi

# --- Environment Configuration ---
if [ ! -f ".env" ]; then
    print_info "No .env file found. Creating from .env.example..."
    cp .env.example .env
    print_info "Please edit the .env file now with your domain, database credentials, and API keys."
    read -p "Press [Enter] key to continue after editing .env..."
fi

# --- Application Dependencies & Build ---
print_info "Installing Node.js dependencies..."
npm install

print_info "Applying Prisma migrations to the PostgreSQL database..."
npx prisma migrate deploy

print_info "Seeding the database with the Super Admin account..."
npx prisma db seed

print_info "Building the Next.js application..."
npm run build

# --- PM2 Process Management ---
print_info "Installing PM2 for process management..."
npm install pm2 -g

print_info "Starting the Hakim AI application with PM2..."
if pm2 list | grep -q "hakim-ai-app"; then
    print_info "hakim-ai-app is already running. Restarting..."
    pm2 restart hakim-ai-app
else
    print_info "Starting hakim-ai-app..."
    # App runs on port 11455, backend on 11454
    pm2 start npm --name "hakim-ai-app" -- start
fi

pm2 startup
pm2 save

# --- Nginx Reverse Proxy & Firewall ---
print_info "Configuring Nginx reverse proxy..."

# Ask for domain name
read -p "Enter your domain name (e.g., hakim.yourclinic.com): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    print_error "Domain name cannot be empty."
fi

NGINX_CONF="/etc/nginx/sites-available/hakim-ai"

cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    location / {
        proxy_pass http://127.0.0.1:11455;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Secure backend API endpoint
    location /api/ {
        proxy_pass http://127.0.0.1:11454;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

if [ -L "/etc/nginx/sites-enabled/hakim-ai" ]; then
    rm /etc/nginx/sites-enabled/hakim-ai
fi

ln -s $NGINX_CONF /etc/nginx/sites-enabled/

nginx -t # Test Nginx configuration

print_info "Restarting Nginx..."
systemctl restart nginx

print_info "Configuring UFW firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

print_success "Hakim AI Cloud Deployment is complete!"
print_info "Configure your domain's DNS to point to this server's IP address."
print_info "Then, run 'sudo certbot --nginx -d $DOMAIN_NAME' to enable HTTPS (install certbot first)."
