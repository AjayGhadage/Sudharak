# 🌿 Sudharak (सुधारक) — AI-Powered Civic & Environmental Action Engine

> **See a problem. AI triages it. Citizens & Municipalities resolve it together.**

[![Live Production](https://img.shields.io/badge/Production-Live%20HTTPS-success?style=for-the-badge&logo=nginx)](https://sudharak.duckdns.org)
[![AWS Cloud](https://img.shields.io/badge/AWS-EC2%20%7C%20S3-orange?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com/)
[![AI Powered](https://img.shields.io/badge/AI-YOLOv8%20%7C%20Groq%20Llama--3-blue?style=for-the-badge&logo=meta)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 📌 Table of Contents
1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Key Capabilities & Solution Highlights](#-key-capabilities--solution-highlights)
3. [High-Level Design (HLD)](#-high-level-design-hld)
   - [System Architecture Diagram](#system-architecture-diagram)
   - [Core Components & Data Flow](#core-components--data-flow)
   - [Cloud & Infrastructure Architecture (AWS)](#cloud--infrastructure-architecture-aws)
4. [Low-Level Design (LLD)](#-low-level-design-lld)
   - [Data Models & ER Diagram](#data-models--er-diagram)
   - [API Specifications & Endpoints](#api-specifications--endpoints)
   - [AI & Computer Vision Microservice Pipeline](#ai--computer-vision-microservice-pipeline)
   - [Escrow Funding & Repair Lifecycle Sequence](#escrow-funding--repair-lifecycle-sequence)
   - [State Machine for Civic Issue Lifecycle](#state-machine-for-civic-issue-lifecycle)
5. [Technology Stack](#-technology-stack)
6. [Local Development Setup](#-local-development-setup)
7. [Production Deployment Guide (AWS EC2 & Nginx)](#-production-deployment-guide-aws-ec2--nginx)
8. [Security & Verification Safeguards](#-security--verification-safeguards)
9. [Contributors](#-contributors)

---

## 🎯 Executive Summary & Problem Statement

Every day, millions of citizens across Indian cities face hazardous environmental and civic neglect:
- **Uncontrolled Solid Waste & Garbage Dumps:** Clogged drainage, plastic burning, and public health risks.
- **Critical Road Potholes & Cave-ins:** Severe traffic bottlenecks, vehicle damage, and fatal accidents.
- **Fresh Water Pipeline Bursts & Sewage Overflow:** Massive water wastage alongside contaminated neighborhood streets.

### The Problem with Traditional Grievance Redressal
1. **Bureaucratic Friction:** Manual reporting forms require tedious categorization and paperwork.
2. **Zero Objective Severity Triage:** Municipal ward engineers lack automated quantification (e.g., surface area, depth, proximity to critical transit).
3. **Missing Accountability & Deadlock:** If municipal authorities miss their response Service Level Agreements (SLAs), citizens are left with no recourse or transparent method to sponsor immediate neighborhood repairs.

### The Sudharak Solution
**Sudharak** bridges the gap between citizens, municipal corporations (Nagar Nigam / Ward Engineers), and verified private contractors:
1. **Single-Snap Reporting:** Citizens take a photo; our Computer Vision engine (YOLOv8) automatically classifies the hazard.
2. **AI Reasoning & Cost Estimation:** Groq (Llama-3) generates an official municipal engineering report and realistic Indian Rupee (₹ INR) repair estimates.
3. **Automated SLA Escalation:** 48-hour municipal response timers track official remediation.
4. **Community Escrow (PayPal):** If municipal SLAs are breached, community members can crowdfund repairs held safely in escrow, disbursed only upon photographic contractor verification.

---

## ✨ Key Capabilities & Solution Highlights

- 📸 **AI Computer Vision Triage:** Fine-tuned YOLOv8 detects potholes, garbage dumps, and water leaks from device photos with instant confidence metrics.
- 🧠 **LLM Engineering Analysis:** Generates structured descriptions, risk severity indices (0–100), and municipal department assignments.
- 📍 **GPS Geo-tagging & City Heatmap:** Interactive MapLibre / Leaflet heatmap showing real-time environmental hotspots across wards.
- 🔁 **Smart Duplicate & Recurrence Detection:** Prevents report spam and automatically detects recurring hazards at identical geographic coordinates.
- 🏛️ **Municipal Ward Officer Portal:** Dedicated dashboard for Nagar Nigam engineers with SLA countdowns, priority queues, and direct status toggles.
- 💳 **PayPal Escrow Crowdfunding:** Milestone-based citizen backing with transparent donation tracking and audit logs.
- 🛡️ **Proof-of-Repair Verification:** Requires before/after photo evidence uploaded to AWS S3 before escrow release or issue closure.

---

## 🏛️ High-Level Design (HLD)

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer (Progressive Web App)"
        UI[React 18 PWA]
        GEO[HTML5 Geolocation]
        CAM[Native Camera Capture]
    end

    subgraph "Edge & Gateway (AWS EC2 / Nginx)"
        NGINX[Nginx 1.24 Reverse Proxy]
        SSL[Let's Encrypt TLS / SSL]
        STATIC[Static Client Build Assets]
    end

    subgraph "Application Core (Node.js & Express)"
        API[Express REST API Gateway]
        AUTH[JWT & Google OAuth 2.0]
        CRON[Automated SLA Escalation Cron]
        CONTROLLERS[Issue, Payment, Chat Controllers]
    end

    subgraph "AI Microservices (Python & FastAPI)"
        FASTAPI[FastAPI ML Service :8000]
        YOLO[YOLOv8 Object Detection Models]
        GROQ[Groq Cloud API - Llama-3 Reasoning]
    end

    subgraph "Cloud & Storage Layer (AWS & Neon)"
        S3[AWS S3 Bucket - ap-south-1]
        NEON[(Neon Serverless PostgreSQL)]
        PP[PayPal Sandbox & Live REST API]
    end

    UI -->|HTTPS:443| NGINX
    NGINX -->|Serve Static| STATIC
    NGINX -->|Proxy /api/| API
    API --> AUTH
    API --> CONTROLLERS
    API --> CRON
    CONTROLLERS -->|Upload Media| S3
    CONTROLLERS -->|Internal HTTP| FASTAPI
    FASTAPI --> YOLO
    FASTAPI --> GROQ
    CONTROLLERS -->|Prisma ORM| NEON
    CONTROLLERS -->|Escrow Orders| PP
```

### Core Components & Data Flow

1. **Client Tier (React 18 + Vite):** A responsive, accessible single-page application and PWA utilizing Vanilla CSS tokens, dynamic dark/light aesthetics, and HTML5 camera intents.
2. **Reverse Proxy (Nginx on Amazon Linux 2023):** Terminates HTTPS (Let's Encrypt), applies rate limiting, enforces 50MB payload limits for media, and routes `/api/` traffic to Node.js.
3. **Core Backend (Node.js + Express):** Implements business logic, role-based access control (`CITIZEN`, `MUNICIPAL_OFFICER`, `ADMIN`), Prisma ORM queries, and transaction management.
4. **AI Microservice (FastAPI + YOLOv8):** Runs an isolated Python service evaluating uploaded images through bounding box inference and LLM prompt templates.
5. **Data & Storage Tier:** 
   - **Neon PostgreSQL:** ACID-compliant cloud PostgreSQL storing users, issues, escrow donations, and audit trails.
   - **AWS S3 (`ap-south-1`):** High-durability object storage for incident imagery and repair proof records.

### Cloud & Infrastructure Architecture (AWS)

| Resource | Service | Specification | Purpose |
|---|---|---|---|
| **Virtual Server** | Amazon EC2 | `t2.micro` (Amazon Linux 2023) | Hosts Nginx, Node.js API, and FastAPI services |
| **Object Storage** | Amazon S3 | `sudharak-images-prod` (`ap-south-1`) | Stores high-res issue images and repair proof photos |
| **Domain & DNS** | DuckDNS | `sudharak.duckdns.org` | Dynamic DNS mapping to EC2 Elastic/Public IP |
| **SSL / TLS** | Let's Encrypt Certbot | TLS 1.3 automated 90-day renewal | Full end-to-end encryption for Google OAuth & camera |
| **Process Manager** | PM2 | Cluster / Fork mode with auto-restart | Zero-downtime execution of API and background workers |
| **Database** | Neon Cloud | Serverless PostgreSQL 16 (AWS US-East-2) | Scalable relational storage with connection pooling |

---

## 🔬 Low-Level Design (LLD)

### Data Models & ER Diagram

```mermaid
erDiagram
    USERS ||--o{ ISSUES : "reports"
    USERS ||--o{ DONATIONS : "contributes"
    USERS ||--o{ UPVOTES : "upvotes"
    USERS ||--o{ COMMENTS : "posts"
    ISSUES ||--o{ DONATIONS : "receives"
    ISSUES ||--o{ UPVOTES : "accumulates"
    ISSUES ||--o{ COMMENTS : "contains"
    ISSUES ||--o{ TIMELINE_EVENTS : "tracks"

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        string role "CITIZEN | MUNICIPAL_OFFICER | ADMIN"
        string location
        int karma_score
        timestamp created_at
    }

    ISSUES {
        int id PK
        int user_id FK
        string title
        text description
        text ai_description
        string category "POTHOLE | GARBAGE | WATER | ROAD"
        string severity "LOW | MEDIUM | HIGH | CRITICAL"
        decimal confidence
        string image_url
        string repair_proof_image
        string location
        decimal latitude
        decimal longitude
        string status "REPORTED | IN_PROGRESS | RESOLVED | ESCALATED"
        string verification_level "AI_VERIFIED | COMMUNITY_VERIFIED | OFFICIALLY_VERIFIED"
        decimal funding_goal
        decimal funding_raised
        int upvotes
        int priority_score
        boolean recurring
        timestamp created_at
        timestamp updated_at
    }

    DONATIONS {
        int id PK
        int issue_id FK
        int donor_id FK
        decimal amount
        string currency
        string paypal_order_id UK
        string paypal_capture_id
        string status "PENDING | COMPLETED | REFUNDED"
        timestamp created_at
    }

    UPVOTES {
        int id PK
        int issue_id FK
        int user_id FK
    }

    COMMENTS {
        int id PK
        int issue_id FK
        int user_id FK
        text content
        timestamp created_at
    }
```

### API Specifications & Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new citizen or officer account with password strength validation.
- `POST /api/auth/login` — Email/password authentication returning signed JWT token.
- `POST /api/auth/google` — Exchange Google OAuth 2.0 credential payload for platform JWT.
- `POST /api/auth/forgot-password` & `verify-otp` & `reset-password` — OTP password reset pipeline.
- `GET /api/auth/me` — Retrieve authenticated user profile, permissions, and karma score.

#### Civic Issues (`/api/issues`)
- `POST /api/issues/analyze` *(Multipart Form)* — Upload photo for YOLOv8 detection + Groq LLM reasoning + duplicate checking.
- `POST /api/issues` — Create a new verified civic issue record.
- `GET /api/issues` — List all issues with filtering (`category`, `status`, `severity`, `ward`).
- `GET /api/issues/:id` — Retrieve detailed issue data, timeline logs, and comments.
- `POST /api/issues/:id/upvote` — Toggle citizen upvote to elevate priority score.
- `POST /api/issues/:id/accept` *(Officer Only)* — Municipal engineer claims issue into repair queue (`IN_PROGRESS`).
- `POST /api/issues/:id/resolve` *(Officer/Admin)* — Upload repair proof image, enter engineering notes, and mark `RESOLVED`.
- `POST /api/issues/:id/reopen` — Citizen flags recurring hazard, increasing priority score.

#### Payments & Escrow (`/api/payments`)
- `POST /api/payments/create-order` — Create a PayPal checkout order against an issue funding goal.
- `POST /api/payments/capture-order` — Verify and capture payment, atomically updating issue funds raised.

#### System Health & Automation
- `GET /api/health` — Returns JSON status of backend services.
- `GET /api/escalate` — Manual or cron trigger for 48h SLA evaluation and automated officer escalation.

### AI & Computer Vision Microservice Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor C as Citizen
    participant Client as React Client
    participant API as Express API
    participant ML as FastAPI Microservice
    participant S3 as AWS S3
    participant Groq as Groq (Llama-3)

    C->>Client: Capture / Select Photo
    Client->>API: POST /api/issues/analyze (multipart/form-data)
    API->>ML: POST /predict (raw image bytes)
    ML->>ML: YOLOv8 Inference (pothole_model.pt / garbage_best.pt)
    alt Anomaly Detected
        ML-->>API: { category, confidence, bounding_boxes, defect_area }
    else Non-Civic Object
        ML-->>API: { isNonCivic: true }
        API-->>Client: 422 Unprocessable Anomaly
    end
    API->>Groq: Generate Technical Reasoning & Severity Prompt
    Groq-->>API: { severity, priorityScore, estCostUsd, engineeringNote }
    API->>S3: Upload Image to S3 (ap-south-1)
    S3-->>API: Permanent Secure S3 URL
    API->>API: Check Ward Database for Duplicate Reports
    API-->>Client: Return Structured Preview (Cost Range in INR, Confidence, Severity)
```

### Escrow Funding & Repair Lifecycle Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Backer Citizen
    participant Client as Web Frontend
    participant Server as Node.js Backend
    participant PayPal as PayPal API
    actor Officer as Municipal Engineer / Contractor
    participant S3 as AWS S3 Storage

    Citizen->>Client: Click "Fund This Fix" (Enter Amount ₹)
    Client->>Server: POST /api/payments/create-order
    Server->>PayPal: Create Sandbox/Live Order
    PayPal-->>Server: Return Order ID
    Server-->>Client: Order ID
    Client->>PayPal: Complete Checkout Modal
    PayPal-->>Client: Approval Authorization
    Client->>Server: POST /api/payments/capture-order
    Server->>PayPal: Capture Payment
    PayPal-->>Server: Capture Verified
    Server->>Server: Increment `funding_raised` in Database
    Server-->>Client: Update Funding Progress Bar

    Note over Server, Officer: Municipal SLA Expires or Contractor Selected
    Officer->>Client: Perform Physical Repair Work
    Officer->>Client: Upload Before/After Repair Photo
    Client->>Server: POST /api/issues/:id/resolve (Proof Photo + Notes)
    Server->>S3: Store Verification Proof
    Server->>Server: Mark Issue RESOLVED & Log Audit Trail
    Server-->>Officer: Escrow Disbursement Authorization
```

### State Machine for Civic Issue Lifecycle

```mermaid
stateDiagram-v2
    [*] --> REPORTED: Citizen snaps photo & submits
    REPORTED --> IN_PROGRESS: Municipal Officer accepts ticket
    REPORTED --> ESCALATED: SLA breached (48h no officer response)
    ESCALATED --> CROWDFUNDED: Citizens pool PayPal escrow funds
    CROWDFUNDED --> IN_PROGRESS: Verified contractor hired
    IN_PROGRESS --> RESOLVED: Proof of repair uploaded & validated
    RESOLVED --> REPORTED: Citizen reports recurrence / defect fails
    RESOLVED --> [*]: Community verifies & archives
```

---

## 💻 Technology Stack

### Frontend Application
- **Framework:** React 18 with Vite bundling
- **Navigation & Routing:** React Router v6
- **Styling:** Custom Vanilla CSS Design System with dark-mode, glassmorphism, responsive CSS grid
- **Icons:** Lucide React
- **PWA Support:** Vite Plugin PWA with offline caching and service worker registration

### Core Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **Database ORM:** Prisma 5
- **Authentication:** JWT (JSON Web Tokens), bcryptjs, Google Identity Services OAuth 2.0
- **Cloud Storage:** `@aws-sdk/client-s3` (AWS SDK v3)
- **Payment Processing:** `@paypal/checkout-server-sdk`
- **Task Scheduling:** `node-cron` (Hourly SLA escalation sweeps)

### Machine Learning & AI
- **API Framework:** Python 3.11 with FastAPI and Uvicorn
- **Computer Vision:** Ultralytics YOLOv8, OpenCV, Pillow
- **LLM Reasoning:** Groq Cloud SDK (`llama-3.3-70b-versatile` / `llama3-8b-8192`)

### Infrastructure & Operations
- **Cloud Provider:** Amazon Web Services (AWS)
- **Compute:** Amazon EC2 (`t2.micro` - Amazon Linux 2023)
- **Object Store:** Amazon S3 (`ap-south-1` Mumbai)
- **Reverse Proxy:** Nginx 1.24 with HTTP/2 and gzip compression
- **Certificates:** Let's Encrypt SSL via Certbot (Automated renewal)
- **DNS:** DuckDNS Dynamic DNS
- **Process Supervision:** PM2 Runtime

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js >= 20.x
- Python >= 3.10
- Git
- Neon PostgreSQL connection string or local PostgreSQL database

### 1. Clone the Repository
```bash
git clone https://github.com/AjayGhadage/Sudharak.git
cd Sudharak
```

### 2. Backend Setup
```bash
cd server
npm install

# Configure environment variables
cp .env.example .env # or edit server/.env
```
Fill in the required `.env` values:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:pass@host/neondb?sslmode=require"
JWT_SECRET="your_jwt_secret_key"
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GROQ_API_KEY="your_groq_api_key"
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your_aws_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret"
AWS_S3_BUCKET_NAME="sudharak-images-prod"
CLIENT_URL="http://localhost:5173"
```
Generate Prisma client and run migrations:
```bash
npx prisma generate
npm run dev
```

### 3. ML Microservice Setup
```bash
cd ../ml-services
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
*FastAPI microservice will be available at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.*

### 4. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🚀 Production Deployment Guide (AWS EC2 & Nginx)

Sudharak is pre-configured for deployment on AWS EC2 Free Tier (`t2.micro`).

### Quick Automated Deployment:
1. Launch an EC2 instance with **Amazon Linux 2023**.
2. Attach Security Group rules:
   - `Port 22` (SSH)
   - `Port 80` (HTTP)
   - `Port 443` (HTTPS)
3. SSH into the server:
   ```bash
   ssh -i "sudharak-key.pem" ec2-user@<YOUR_EC2_IP>
   ```
4. Run our automated setup script:
   ```bash
   bash ec2-setup.sh
   ```
5. Configure SSL & DuckDNS Domain:
   ```bash
   bash setup-https.sh
   ```

### Process Management with PM2:
```bash
# Check running services
pm2 status

# View live application logs
pm2 logs sudharak-api

# Restart after code changes
pm2 restart all
```

---

## 🛡️ Security & Verification Safeguards

1. **Role-Based Authorization:** Only certified municipal personnel or verified administrators can change ticket states to `IN_PROGRESS` or upload official repair certificates.
2. **Double-Blind Escrow Release:** Donations are held in escrow and cannot be withdrawn by private contractors until photographic proof of resolution is uploaded.
3. **Strict Input Sanitization:** Image file size limits (50MB maximum), MIME-type verification, and secure parameter sanitization prevent buffer and injection attacks.
4. **End-to-End TLS Encryption:** All citizen coordinates, personal credentials, and transaction tokens are transmitted over TLS 1.3 encrypted HTTPS.

---

## 👥 Contributors

- **Ajay Ghadage** — *Lead Developer, Full-Stack & Cloud Architect* ([GitHub](https://github.com/AjayGhadage))

---

<p align="center">
  <b>Built for Bharat 🇮🇳 · Powered by AI & Open Civic Tech</b>
</p>
