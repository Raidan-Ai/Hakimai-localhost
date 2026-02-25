# Hakim AI - Enterprise Deployment

**Developed by RaidanPro**

## 1. Project Overview

Hakim AI is an advanced, multimodal AI orchestrator designed for clinical environments. It provides healthcare professionals with a secure, HIPAA-compliant platform for interacting with patient data, medical records, and diagnostic images. The system is built on a hybrid AI architecture, leveraging both local, sovereign AI models (via Ollama) for sensitive data processing and powerful cloud-based models for general-purpose tasks.

This repository contains the complete deployment kit for setting up Hakim AI in various enterprise environments, from local bare-metal servers to cloud VPS instances.

## 2. System Architecture

The Hakim AI platform is built on a modern, robust, and scalable technology stack:

- **Frontend**: Next.js (App Router) with React and Tailwind CSS.
- **Backend**: A custom Express.js server integrated with Next.js, providing a robust API layer.
- **Database**: Prisma ORM, supporting both PostgreSQL (for production) and SQLite (for local development).
- **Authentication**: NextAuth.js, providing credential-based login as well as OAuth integration with Google and LinkedIn.
- **Local AI**: Ollama, for running local large language models like `llava-med` in a secure, offline environment.
- **AI Orchestration**: A custom-built orchestrator that intelligently routes queries to the appropriate AI model based on data sensitivity and task requirements.
- **Model Context Protocol (MCP)**: A specialized protocol for providing local file system context to the AI models, enabling them to read and analyze local documents and images.
- **Containerization**: Docker and Docker Compose for easy deployment and management of the database and other services.
- **Process Management**: PM2 for ensuring the application runs continuously in a production environment.

### Architectural Enhancements (System Audit)

To ensure enterprise-grade reliability and security, the following components have been added:

- **API Rate Limiting**: `express-rate-limit` is used to protect API endpoints from brute-force attacks and abuse.
- **Structured Logging**: `winston` provides a robust, level-based logging system for production monitoring and debugging.
- **Security Headers**: `helmet` is used to apply essential security headers to HTTP responses, protecting against common vulnerabilities like XSS and clickjacking.

## 3. Deployment Guides

Follow the appropriate guide for your target environment.

### 3.1. Ubuntu 24.04 LTS

#### Local / Bare-Metal Server

1.  **Download the script**:
    ```bash
    wget https://raw.githubusercontent.com/RaidanPro/hakim-ai/main/install-ubuntu-local.sh
    ```
2.  **Make it executable**:
    ```bash
    chmod +x install-ubuntu-local.sh
    ```
3.  **Run as root**:
    ```bash
    sudo ./install-ubuntu-local.sh
    ```
4.  **Follow the prompts**: The script will pause to allow you to edit the `.env` file. Fill in your specific configuration details.

#### Cloud VPS (AWS, GCP, Azure)

1.  **Download the script**:
    ```bash
    wget https://raw.githubusercontent.com/RaidanPro/hakim-ai/main/install-ubuntu-cloud.sh
    ```
2.  **Make it executable**:
    ```bash
    chmod +x install-ubuntu-cloud.sh
    ```
3.  **Run as root**:
    ```bash
    sudo ./install-ubuntu-cloud.sh
    ```
4.  **Follow the prompts**: The script will ask for your domain name and will pause for you to edit the `.env` file.

### 3.2. Windows

#### Local / Bare-Metal Server

1.  **Download the script**: `install-windows-local.ps1`
2.  **Open PowerShell as Administrator**.
3.  **Run the script**:
    ```powershell
    .\install-windows-local.ps1
    ```
4.  **Follow the prompts**: The script will guide you through the installation and `.env` configuration.

#### Cloud Server

1.  **Download the script**: `install-windows-cloud.ps1`
2.  **Open PowerShell as Administrator**.
3.  **Run the script**:
    ```powershell
    .\install-windows-cloud.ps1
    ```
4.  **Follow the prompts**.

## 4. Post-Installation Configuration

### 4.1. Custom Domain & HTTPS (Cloud)

After running the cloud installation script, you must:

1.  **Point your domain's DNS A record** to the IP address of your cloud server.
2.  **Install Certbot** and obtain an SSL certificate for your domain:
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

### 4.2. OAuth Configuration (Google & LinkedIn)

1.  **Log in to the Hakim AI admin panel**.
2.  Navigate to **Settings > Authentication**.
3.  **Enable the desired OAuth providers** and enter the Client ID and Client Secret obtained from the Google Cloud Console and LinkedIn Developer Portal.
4.  **In your provider's dashboard**, ensure you have added the correct callback URL:
    `https://your-domain.com/api/auth/callback/google`
    `https://your-domain.com/api/auth/callback/linkedin`

### 4.3. MCP File Access

The Model Context Protocol allows the local AI to access files on the server. Ensure that the `LOCAL_UPLOAD_DIR` in your `.env` file points to a valid directory on the server and that the user running the Hakim AI application has read/write permissions to it.
