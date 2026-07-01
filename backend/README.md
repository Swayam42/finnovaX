# FinnovaX AI Engine

> FastAPI + FinBERT + EasyOCR + ChromaDB + Gemini — 4 Independent AI Services

[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5Flash-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-FinBERT-FFD21E?style=flat&logo=huggingface)](https://huggingface.co/)

---

## What This Is

This is the AI microservice that powers FinnovaX's intelligent capabilities. It exposes 4 independent REST services:

| Service | Endpoint | Model | Purpose |
|---------|----------|-------|---------|
| Sentiment Analysis | `POST /sentiment/analyze` | `ProsusAI/finbert` | Detect sentiment, fraud signals, and assign priority |
| OCR Verification | `POST /ocr/verify-account` | EasyOCR | Extract and match account numbers in documents |
| KYC OCR | `POST /ocr/verify-kyc` | EasyOCR | Match name + DOB from uploaded KYC documents |
| AI Summarizer | `POST /summarize/ticket` | Ollama → Gemini | Generate 3-bullet actionable ticket summaries |
| RAG Chatbot | `POST /chatbot/ask` | ChromaDB + Gemini | FAQ-grounded responses |
| Health | `GET /health` | — | Service health check |

---

## Hybrid LLM Architecture

This engine supports **two LLM backends simultaneously**:

```
Request → query_llm(prompt)
  → Try Ollama (local, private, zero cost)
      → llama3.2:1b @ http://localhost:11434
      → If fails or not running ↓
  → Fall back to Gemini 2.5 Flash (cloud, fast, reliable)
      → google-genai SDK
      → Requires GEMINI_API_KEY
```

**Why Hybrid?**
- **On-premise deployment** (banks, regulated environments): Use Ollama only — no data leaves the server
- **Cloud deployment** (Vercel/Render): No Ollama running — Gemini handles everything automatically

---

## Real-World Examples

### Sentiment Analysis on a Complaint

**Input:** `"Someone hacked into my account and stole my funds"`

**FinBERT Result:**
```json
{
  "sentiment": "NEGATIVE",
  "score": 0.9421,
  "priority": "CRITICAL",
  "fraud_alert": true,
  "intent": "FRAUD_REPORT"
}
```

This result automatically sets `isPotentialFraud: true` on the ticket and overrides priority to `CRITICAL`.

---

### OCR Account Verification

**Input:** Cancelled cheque image + account number `123456789`

**EasyOCR extracts:** `"123456789"` from the MICR line

**Fuzzy match:** `difflib.SequenceMatcher` — tolerates up to ~15% character variance for OCR errors

**Output:**
```json
{
  "account_found": true,
  "extracted_text": ["123456789"],
  "message": "Account number matched successfully"
}
```

---

### RAG Chatbot Query

**Input:** `"What is the SLA for a KYC update?"`

1. ChromaDB queries `kfintech_faqs` collection using vector similarity
2. Top 2 results with L2 distance < 1.1 are returned as context
3. Context is injected into Gemini prompt: `"Answer only using this context: ..."`
4. Gemini responds strictly within the FAQ scope
5. If no relevant FAQ found (distance > 1.1), Gemini still answers but without context

---

## Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure
cp .env.example .env
# Add GEMINI_API_KEY=your_key_here

# Start server
uvicorn app.main:app --reload --port 8000
```

**Swagger Docs:** `http://localhost:8000/docs`

---

## Key Files

| File | Purpose | Test By |
|------|---------|---------|
| `app/main.py` | FastAPI factory, route registration, ChromaDB auto-seeding on startup | `GET /health` after starting |
| `app/services/sentiment_service.py` | FinBERT pipeline + fraud keyword detection + priority logic | `POST /sentiment/analyze` with `{"text": "my account was hacked"}` |
| `app/services/ocr_service.py` | EasyOCR + fuzzy account/KYC matching | `POST /ocr/verify-account` with a cheque image |
| `app/services/llm_service.py` | Ollama + Gemini hybrid LLM | Stop Ollama → send a summarize request → Gemini responds |
| `app/services/rag_service.py` | ChromaDB vector query with relevance threshold | `POST /chatbot/ask` with `{"question": "how do I update my bank account?"}` |
| `app/services/knowledge_base.py` | Seeds ChromaDB with FinnovaX FAQ documents at startup | Check startup logs for `ChromaDB FAQ knowledge base ready` |

---

## Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key_here
OLLAMA_URL=http://localhost:11434/api/generate   # Optional for local LLM
CHAT_MODEL=llama3.2:1b                            # Ollama model name
```

---

## Hardware Acceleration

The engine auto-detects GPU availability:

```python
device = 0 if torch.cuda.is_available() else -1
sentiment_analyzer = pipeline("sentiment-analysis", model="ProsusAI/finbert", device=device)
```

- **With NVIDIA GPU (CUDA):** FinBERT inference runs in milliseconds
- **CPU only:** Falls back to CPU inference — slightly slower but fully functional
- **Docker GPU:** Use `docker-compose.yml` (requires NVIDIA Container Toolkit)
- **Docker CPU:** Use `docker-compose.cpu.yml` — lighter image, no CUDA drivers

---

## ChromaDB Knowledge Base

On every startup, `knowledge_base.py` checks if `kfintech_faqs` collection exists in ChromaDB. If empty, it seeds it with FinnovaX-specific FAQ documents covering:
- KYC update processes
- Bank account update procedures
- Nominee registration
- Complaint escalation paths
- SLA commitments per service type

The vector store is persisted to `./chroma_db/` directory between restarts.
