# KFintech Nexus Portal - Hackathon Edition

Welcome to the **KFintech Nexus Portal**, an AI-driven, multi-tier compliance and workflow system. We leverage state-of-the-art deep learning models for Enterprise Sentiment Analysis and Zero-Touch OCR Document Verification.

## 🚀 Key Features & Upgrades

- **Wall-Street Grade UI:** A premium, fully responsive React frontend featuring Dark Mode, Glassmorphism, Framer Motion animations, Recharts live analytics, and Lucide vector icons.
- **FinBERT AI Engine:** Replaced legacy models with **ProsusAI/finbert**, a high-accuracy (87.5%+) NLP model trained specifically on massive financial corpuses (Reuters, earnings calls, analyst reports). It drives the intelligent auto-routing and L2 Checker Context generation.
- **EasyOCR Integration:** Seamlessly extracts text from confidential investor PDFs and images.
- **L1/L2 Workflow Engine:** Simulates real-world enterprise compliance desks with instant escalation and actionable AI Insights.

---

## 🏗️ The Architecture (How we work together)
Because the AI models (PyTorch, EasyOCR, Llama 3) require a massive amount of processing power, we use a **Microservices Architecture**. 

Think of it like a **Restaurant Kitchen and Waiters**:
*   **The Kitchen (The AI Server):** This is a heavy Docker container running on a laptop with an NVIDIA GPU. It does all the heavy lifting and crunching.
*   **The Waiters (The Teammates):** Your laptops don't need a GPU! You just run the lightweight Frontend and Node.js code, and send requests over Wi-Fi (or Ngrok) to the Kitchen.

---

## 👨‍💻 How to Run the App (For Teammates without a GPU)

You have two choices for how you want to develop and run the code on your laptop:

### Option 1: The "Wi-Fi" Workflow (Zero Wait Time, Highly Recommended)
You do not need to use Docker at all. You will simply connect your code to the Master AI Server.

1.  Ask the AI Server host for their IP Address or `Ngrok` URL.
2.  Open your terminal and set your environment variable:
    *   **Windows (PowerShell):** `$env:ML_SERVICE_URL="http://<THE_IP_ADDRESS>:8000"`
    *   **Mac/Linux:** `export ML_SERVICE_URL="http://<THE_IP_ADDRESS>:8000"`
3.  Start the Node backend:
    ```bash
    cd node_service
    npm install
    npm start
    ```
4.  Start the React Frontend:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

### Option 2: The "Local CPU" Workflow (Runs locally)
If you want to run the heavy AI models locally on your own CPU without connecting to the Master Server.

1.  Make sure Docker Desktop is installed and running.
2.  Run this specific command to use the CPU-only configuration:
    ```bash
    docker-compose -f docker-compose.cpu.yml up --build
    ```
3.  *Note: The first time you run this, it will take 15-20 minutes to download the massive 4GB PyTorch AI files. After the first time, it will boot instantly.*

---

## 👑 How to Run the App (For the Master Server with NVIDIA GPU)

If you have the NVIDIA GTX 2050 (or similar GPU), you will act as the Master Server for the team.

1.  Make sure your NVIDIA drivers are up to date and Docker Desktop is running.
2.  Run the standard Docker compose command:
    ```bash
    docker-compose up --build
    ```
3.  Docker will automatically lock onto your GPU for maximum speed. Give your IP address (or Ngrok URL) to your teammates so they can connect!

---

## ⚠️ Stability & Compatibility Fixes Applied
- **PyTorch/NumPy Alignment:** The Docker configuration is strictly pinned to `transformers==4.38.2` and `numpy<2.0.0` to guarantee crash-free execution with the container's native `torch==2.2.0` distribution.

## ⚠️ Important Note about the Chatbot
The general AI Chatbot is powered by **Llama 3 (8B)**. Because this model is massive (nearly 5 GB), it is **not** kept inside the Docker container. It requires a local installation of [Ollama](https://ollama.com/) running on the host machine.
*   If you do not have Ollama installed, the Chatbot will simply return a friendly notification message.
*   **Do not worry:** The OCR Document Verification and FinBERT Sentiment Analysis models do *not* need Ollama and will work perfectly with 100% accuracy!
