# Hakim AI - Enterprise Localhost Platform

Developed by: **RaidanPro**
Target: **Single-Server Web-First Cloud Deployment on Ubuntu 24.04**

## 🚀 Project Overview
Hakim AI is an enterprise-grade medical AI platform designed for local-first clinical reasoning, secure PHI handling, and hybrid AI orchestration. This repository contains the source code and deployment scripts for the self-hosted version of Hakim AI.

## 🏗️ Architecture Outline
The system is designed for a single-server cloud setup:
- **Frontend/Backend:** Next.js (App Router) / Express + Vite (Hybrid)
- **Database:** PostgreSQL (Dockerized)
- **AI Engine:** Ollama (Native)
- **Reverse Proxy:** Nginx with SSL (Certbot)

## 🌐 DNS Configuration
Before deployment, point the following **A Records** to your server's IP address:
- `hakim.raidan.pro` (Main Application)
- `hakim-admin.raidan.pro` (Admin Dashboard)
- `ai.hakim.raidan.pro` (Edge AI API - Optional)

## 📦 Step-by-Step Deployment Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Raidan-Ai/Hakimai-localhost.git
cd Hakimai-localhost
```

### 2. Configure Environment Variables
Copy the example configuration and update with your secrets:
```bash
cp .env.example .env
nano .env
```

### 3. Run the Unified Deployment Script
This script installs Node.js, Docker, Ollama, and configures the database:
```bash
chmod +x install-ubuntu-server.sh
./install-ubuntu-server.sh
```

### 4. Configure Domain Routing & SSL
This script sets up Nginx and requests SSL certificates from Let's Encrypt:
```bash
chmod +x nginx-setup.sh
./nginx-setup.sh
```

### 5. Verify Installation
- Access the main app at: `https://hakim.raidan.pro`
- Access the admin dashboard at: `https://hakim-admin.raidan.pro`
- Default Admin: `admin@hakim.raidan.pro` (Password set in `.env`)

## 🛡️ Security & Privacy
- **HIPAA Compliance:** All PHI data is processed locally on the Edge AI server.
- **Sovereign AI:** Local Ollama engine ensures clinical reasoning is available offline.
- **Audit Logging:** Every administrative action is logged for compliance.

---
© 2026 RaidanPro. All rights reserved.
