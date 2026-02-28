#!/bin/bash
set -e

# --- Hakim AI Enterprise Deployment Script ---
# Target: Ubuntu 24.04 LTS
# Developed by: RaidanPro DevOps Team

echo "🚀 Starting Hakim AI Enterprise Deployment..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Core Dependencies
echo "📦 Installing core dependencies (Node.js, Git, Docker, Nginx)..."
sudo apt-get install -y curl git build-essential nginx certbot python3-certbot-nginx ufw

# Install Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# 3. Secure Directories
echo "📁 Creating secure directories for PHI and Knowledge Base..."
sudo mkdir -p /opt/hakim-ai/uploads/voice_prints
sudo mkdir -p /opt/hakim-ai/knowledge_base
sudo chown -R $USER:$USER /opt/hakim-ai

# 4. Install Ollama Natively
if ! command -v ollama &> /dev/null; then
    echo "🧠 Installing Ollama AI Engine..."
    curl -fsSL https://ollama.com/install.sh | sh
fi

# Pull required models
echo "🧠 Pulling AI models (llava-med, openbiollm)..."
ollama pull llava-med
ollama pull openbiollm

# 5. Setup PostgreSQL (Dockerized)
echo "🐘 Setting up PostgreSQL via Docker..."
cat <<EOF > docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    container_name: hakim-db
    restart: always
    environment:
      POSTGRES_USER: hakim_user
      POSTGRES_PASSWORD: hakim_password
      POSTGRES_DB: hakim_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

sudo docker compose up -d

# 6. Application Build & Setup
echo "🏗️ Cloning and building Hakim AI application..."
# git clone https://github.com/Raidan-Ai/Hakimai-localhost.git /opt/hakim-ai/app
# cd /opt/hakim-ai/app

# For this demo, we'll assume we are already in the app directory
npm install
npm run build

# 7. Database Migration & Seeding
echo "🐘 Running database migrations and seeding..."
npx prisma migrate deploy
npx prisma db seed

# 8. PM2 Setup
echo "🚀 Starting application with PM2..."
sudo npm install -g pm2
pm2 start server.ts --name "hakim-ai" --interpreter tsx -- --port 11455
pm2 save
pm2 startup

# 9. Firewall Configuration
echo "🛡️ Configuring UFW firewall..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable

echo "✅ Hakim AI Deployment Complete!"
echo "👉 Next step: Run nginx-setup.sh to configure domains and SSL."
