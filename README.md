# Hakim AI - Clinical Decision Support System

**Developed by RaidanPro | Enterprise System Architecture**

---

## 1. Project Overview

Hakim AI is an advanced, multimodal Clinical Decision Support System (CDSS) designed for modern healthcare environments. It leverages a sophisticated **Mixture of Experts (MoE)** model to provide clinicians with state-of-the-art tools for diagnosis, research, and administration, while ensuring strict HIPAA compliance through a hybrid AI architecture.

The system is built to be deployed in various environments, from standalone laptops in remote clinics to scalable cloud servers, providing a consistent and powerful experience across the board.

## 2. System Architecture

Hakim AI is built on a modern, robust technology stack chosen for performance, scalability, and security.

-   **Frontend & Backend:** [Next.js 14 (App Router)](https://nextjs.org/) - A full-stack React framework providing a seamless developer experience and high-performance server-side rendering.
-   **Database ORM:** [Prisma](https://www.prisma.io/) - A next-generation ORM for Node.js and TypeScript that simplifies database access and ensures type safety.
-   **Local AI Engine:** [Ollama](https://ollama.com/) - Powers the local, sovereign AI capabilities, allowing for on-premise processing of sensitive Patient Health Information (PHI).
-   **Containerization:** [Docker](https://www.docker.com/) - Used for creating reproducible environments, especially for deploying the PostgreSQL database in cloud setups.
-   **Model Context Protocol (MCP):** A custom-developed protocol that allows the AI models to securely access and reason about local files (e.g., PDF reports, DICOM images) without exposing the file system directly.

## 3. Prerequisites

### Hardware Recommendations

-   **Local/Bare-Metal (with On-Premise AI):**
    -   **CPU:** Modern Intel i7/i9 or AMD Ryzen 7/9 (8+ cores recommended).
    -   **RAM:** 32 GB RAM minimum (64 GB recommended for larger models).
    -   **GPU:** NVIDIA GeForce RTX 3060 (12 GB VRAM) or better. An enterprise-grade NVIDIA A-series GPU is highly recommended for clinical settings.
    -   **Storage:** 1 TB NVMe SSD for fast model and data access.
-   **Cloud VPS (for Backend/DB Hosting):**
    -   2 vCPU, 4 GB RAM, 50 GB SSD (for the application and database server).

### Software

-   **Operating System:**
    -   Ubuntu 24.04 LTS (Recommended for servers)
    -   Windows 10/11 with WSL2 or Windows Server 2022
-   An active internet connection for the initial setup and to pull dependencies.

## 4. Deployment Guides

Choose the guide that matches your target environment. The scripts are idempotent, meaning they can be run multiple times without causing issues.

### 4.1. Ubuntu 24.04 LTS

#### **Local Clinic / Bare-Metal Installation**

This setup installs everything needed to run Hakim AI, including the local Ollama AI engine, on a single machine.

1.  **Download the Script:**
    ```bash
    wget https://raw.githubusercontent.com/RaidanPro/hakim-ai/main/scripts/install-ubuntu-local.sh
    ```

2.  **Make it Executable:**
    ```bash
    chmod +x install-ubuntu-local.sh
    ```

3.  **Run the Installer:**
    ```bash
    ./install-ubuntu-local.sh
    ```

4.  **Configure:** After the script finishes, you **must** edit the environment file with your secret keys.
    ```bash
    nano /opt/hakim-ai/.env
    ```
    Fill in your `GEMINI_API_KEY`, `NEXTAUTH_SECRET`, and any other required variables.

5.  **Restart the Application:** For the new `.env` variables to take effect, restart the app using PM2.
    ```bash
    pm2 restart hakim-ai
    ```

#### **Cloud VPS Installation**

This setup configures Hakim AI with a robust PostgreSQL database running in Docker, ready for production traffic.

1.  **Download and Run:**
    ```bash
    wget https://raw.githubusercontent.com/RaidanPro/hakim-ai/main/scripts/install-ubuntu-cloud.sh
    chmod +x install-ubuntu-cloud.sh
    ./install-ubuntu-cloud.sh
    ```

2.  **Configure DNS:** Point your domain (e.g., `hakim.your-clinic.com`) to the IP address of your VPS.

3.  **Configure Environment:** Edit the `.env` file, making sure to set the correct `DATABASE_URL` (the script sets a default, but you should use a strong, unique password) and your production `NEXTAUTH_URL`.
    ```bash
    nano /opt/hakim-ai/.env
    ```

4.  **Secure with SSL (Recommended):** Use Certbot to get a free SSL certificate for your domain.
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    sudo certbot --nginx -d hakim.your-clinic.com
    ```

5.  **Restart:**
    ```bash
    pm2 restart hakim-ai
    ```

### 4.2. Windows

#### **Local Clinic Installation**

1.  **Open PowerShell as Administrator.**
2.  **Download and Run the Script:**
    ```powershell
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/RaidanPro/hakim-ai/main/scripts/install-windows-local.ps1" -OutFile ".\install-windows-local.ps1"
    Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process
    .\install-windows-local.ps1
    ```
3.  **Follow Prompts:** The script will use `winget` to install dependencies. You may need to approve prompts from the installers.
4.  **Configure:** After the script clones the repository, it will pause before starting the app. Edit the `.env` file in `C:\Hakim-AI` with your secrets.
5.  The script will then start the application in the console.

#### **Cloud-Connected Installation**

This is for running the Node.js server on Windows while connecting to a cloud PostgreSQL database.

1.  **Open PowerShell as Administrator.**
2.  **Download and Run:**
    ```powershell
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/RaidanPro/hakim-ai/main/scripts/install-windows-cloud.ps1" -OutFile ".\install-windows-cloud.ps1"
    Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process
    .\install-windows-cloud.ps1
    ```
3.  **Configure:** Edit the `.env` file in `C:\Hakim-AI-Cloud` and set the `DATABASE_URL` to point to your managed PostgreSQL instance.

## 5. Post-Installation: Custom Domains

Hakim AI's admin dashboard allows you to change system URLs and configurations at runtime.

1.  Log in to the Hakim AI application with your Super Admin account.
2.  Navigate to **Admin -> Network Config**.
3.  Update the `Base URL` to your custom domain (e.g., `https://hakim.your-clinic.com`).
4.  Save the changes. This will ensure that all generated links and API callbacks use the correct domain.
