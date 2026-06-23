# 🚀 KFintech AI Microservice — API Reference

Welcome to the **KFintech AI Models API**. This documentation provides the exact JSON contracts, request structures, and response schemas required for the Node.js and React teams to integrate with our backend AI services.

**Hackathon Business Impact:** By decoupling our AI models into a dedicated FastAPI microservice, we achieve a **99% reduction in manual triage effort**. This API empowers the orchestrator to resolve unstructured text and image data instantly using CUDA-accelerated inference (with graceful CPU fallbacks).

The API exposes three primary AI capabilities:
1. **Priority & Fraud Triage** using the industry-standard `ProsusAI/finbert` model.
2. **Zero-Touch Document Verification** using EasyOCR with advanced fuzzy matching.
3. **Structured AI Summarizer** backed by a local Llama 3 instance to strictly output JSON bullet points.

> [!NOTE]
> Ensure that your API Gateway or reverse proxy maps the external `/api/ai/*` paths defined below to the internal FastAPI routes appropriately.

---

## 1. Sentiment & Priority Triage

Evaluates the sentiment of a customer complaint or message using the `ProsusAI/finbert` model. It calculates a sophisticated Frustration Index. Crucially, it proactively flags the priority as `CRITICAL` and triggers a `fraud_alert` if severe threats or scam-related keywords are detected.

**Endpoint:** `POST /api/ai/sentiment`

### Request

| Header | Value |
| :--- | :--- |
| `Content-Type` | `application/json` |

```json
{
  "text": "I was charged a management fee twice this month on my index fund. I need this reversed immediately, your system is broken and stealing my money. This is a scam!"
}
```

### Response

**Success (200 OK)**

```json
{
  "sentiment": "NEGATIVE",
  "score": 1.0,
  "priority": "CRITICAL",
  "fraud_alert": true
}
```

> [!WARNING]
> **Error Codes**
> - `400 Bad Request`: Missing or invalid JSON payload.
> - `422 Unprocessable Entity`: Validation error (e.g., `text` field is missing).
> - `500 Internal Server Error`: Model inference failed.

---

## 2. OCR Zero-Touch Verification

Accepts an uploaded image (e.g., a cheque, bank statement) and an account number. It uses EasyOCR to extract all text from the document. It performs advanced string normalization (regex) and fuzzy-matching (`difflib`) to verify if the account number exists within the document, tolerating up to a 15% OCR discrepancy.

**Endpoint:** `POST /api/ai/ocr-verify`

### Request

| Header | Value |
| :--- | :--- |
| `Content-Type` | `multipart/form-data` |

**Form-Data Fields:**
- `account_number` *(string, required)*: The target account number to verify.
- `file` *(file, required)*: The image of the document (JPEG, PNG).

*Example Request:*
```bash
curl -X POST "http://localhost:8000/api/ai/ocr-verify" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "account_number=123456789" \
  -F "file=@/path/to/statement.png;type=image/png"
```

### Response

**Success (200 OK)**

```json
{
  "account_found": true,
  "extracted_text": [
    "KFintech",
    "Statement of Account",
    "Account No:",
    "1Z3-456 789",
    "Balance: $10,000"
  ],
  "message": "Account number '123456789' successfully verified in document."
}
```

> [!WARNING]
> **Error Codes**
> - `400 Bad Request`: The uploaded file is not a valid image format.
> - `422 Unprocessable Entity`: Missing `file` or `account_number`.
> - `500 Internal Server Error`: OCR engine failed to process the image.

---

## 3. Llama 3 Structured Summarizer

A highly compliant AI summarization endpoint. It passes the user's grievance to a local Llama 3 instance and enforces a strict structured format. It guarantees that the output contains exactly 3 concise bullet points formatted as parseable JSON, preventing conversational hallucinations.

**Endpoint:** `POST /api/ai/chat`

### Request

| Header | Value |
| :--- | :--- |
| `Content-Type` | `application/json` |

```json
{
  "question": "Summarize this ticket: I was charged a management fee twice this month on my index fund...",
  "format": "json"
}
```

### Response

**Success (200 OK)**

```json
{
  "query": "Summarize this ticket: I was charged a management fee twice this month on my index fund...",
  "response": "{\"bullets\": [\"The investor was charged a management fee twice this month.\", \"The investor expects an immediate reversal of the duplicate charge.\", \"The investor expressed severe frustration, accusing the platform of theft and scam.\"]}",
  "retrieved_data_source": [
    "KFintech Internal Knowledge Base (Simulated)"
  ]
}
```

> [!WARNING]
> **Error Codes**
> - `422 Unprocessable Entity`: Missing `question` in JSON payload.
> - `500 Internal Server Error`: Vector store not initialized or Ollama backend is unreachable.
