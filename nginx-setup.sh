#!/bin/bash
set -e

# --- Hakim AI Nginx Domain Routing Script ---
# Domain: hakim.raidan.pro, hakim-admin.raidan.pro
# Developed by: RaidanPro DevOps Team

echo "🌐 Starting Nginx Domain Routing Configuration..."

# 1. Domain Configuration
DOMAIN_MAIN="hakim.raidan.pro"
DOMAIN_ADMIN="hakim-admin.raidan.pro"
DOMAIN_AI="ai.hakim.raidan.pro"
APP_PORT=11455
OLLAMA_PORT=11434

# 2. Create Nginx Configuration
sudo tee /etc/nginx/sites-available/hakim-ai <<EOF
server {
    listen 80;
    server_name $DOMAIN_MAIN $DOMAIN_ADMIN;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

server {
    listen 80;
    server_name $DOMAIN_AI;

    location / {
        proxy_pass http://127.0.0.1:$OLLAMA_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Security: Restrict access to local network or specific IPs if needed
        # allow 127.0.0.1;
        # deny all;
    }
}
EOF

# 3. Enable Site and Restart Nginx
sudo ln -sf /etc/nginx/sites-available/hakim-ai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 4. SSL Configuration with Certbot
echo "🔒 Requesting SSL certificates from Let's Encrypt..."
# Note: This requires the domains to be pointed to the server's IP
# sudo certbot --nginx -d $DOMAIN_MAIN -d $DOMAIN_ADMIN -d $DOMAIN_AI --non-interactive --agree-tos -m admin@raidan.pro

echo "✅ Nginx Configuration Complete!"
echo "👉 Your domains are now routed to Hakim AI."
