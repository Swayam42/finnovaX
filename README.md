# KFintech Nexus Portal

Welcome to the **KFintech Nexus Portal**, an AI-driven, multi-tier compliance and workflow system built for modern financial operations. This portal automates document verification, sentiment-based prioritization, and secure multi-level Maker-Checker workflows.

## 🚀 Architecture Overview
The Nexus Portal is designed as a robust microservices architecture:

1. **Frontend (React + Vite + Tailwind CSS v4):** 
   - A highly responsive, secure investor-facing portal and admin dashboard.
   - Dynamic UI rendering based on secure routing.
2. **Core API (Node.js + Express):**
   - Orchestrates the Maker/Checker workflow (`ADMIN_L1` -> `ADMIN_L2`).
   - Secure REST endpoints.
3. **Database Layer (MongoDB Replica Set inside Docker):**
   - Implements **Strict ACID Transactions** via `mongoose.startSession()`.
   - Highly normalized structure separating the current `tickets` state from an immutable `auditlogs` history.
4. **AI Backend (FastAPI + Python):**
   - Exposes blazing-fast microservices for **Sentiment Analysis**, **Document OCR**, and **LLM Chatbot** orchestration.

## 🌟 Key Features
- **Zero-Touch Document Processing:** Investors upload supporting documents, which are instantly routed to the AI engine for OCR extraction.
- **Sentiment Triage:** Complaints are algorithmically analyzed for distress levels, automatically flagging high-risk tickets as `CRITICAL`.
- **L1/L2 Workflow State Machine:** Tickets transition systematically through `OPEN` -> `L1_REVIEW`/`L2_APPROVAL` -> `RESOLVED`/`REJECTED`.
- **Immutable Audit Trail:** Every state change, AI intervention, and Checker approval is cryptographically linked and logged.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Docker & Docker Compose

### 1. Start the Infrastructure (Database & AI Engine)
```bash
docker-compose up -d
```
*Note: The MongoDB container `kfintech_mongo` will bind to port `27018` to avoid host conflicts, and initialize a replica set `rs0` automatically to enable MongoDB Transactions.*

### 2. Start the Core Node.js API
```bash
cd node_service
npm install
npm start
```
*The API will expose endpoints on `http://localhost:5000`.*

### 3. Start the React Web Portal
```bash
cd frontend
npm install
npm run dev
```
*The Portal is available at `http://localhost:5173`.*

## 🔒 Security Notice
This repository contains mocked AI endpoints designed to securely test the full-stack architecture without massive ML dependency overhead (`torch`, `transformers`) or local GPU requirements. The `ocr.py`, `sentiment.py`, and `chatbot.py` files are configured for seamless architectural demonstration.
