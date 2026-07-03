import os
import httpx
from google import genai

GENI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("CHAT_MODEL", "llama3.2:1b")
client = None
if GENI_API_KEY:
    client = genai.Client(api_key=GENI_API_KEY)

import asyncio

async def query_gemini(prompt: str) -> str:
    if not client:
        return "Gemini API key is missing, and Ollama is unreachable. Cannot process request."
    
    max_retries = 2
    base_delay = 2 # Shorter retry wait so fallbacks engage rapidly without UI freeze

    for attempt in range(max_retries):
        try:
            if hasattr(client, 'aio'):
                response = await client.aio.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=prompt
                )
            else:
                response = client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=prompt
                )
            return response.text
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    print(f"Gemini Rate Limit Hit (429). Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)
                    continue
            print(f"Gemini API Error: {e}")
            return f"Both Ollama and Gemini AI models failed to respond. Gemini Error: {e}"

async def query_llm(full_prompt: str) -> str:
    llm_response = ""
    try:
        # Fail fast in 1.5 seconds if Ollama is not running locally (e.g. in Hugging Face production)
        async with httpx.AsyncClient(timeout=1.5) as http_client:
            response = await http_client.post(OLLAMA_URL, json={
                "model": OLLAMA_MODEL,
                "prompt": full_prompt,
                "stream": False
            })
            response.raise_for_status()
            data = response.json()
            llm_response = data.get("response", "").strip()
    except Exception as e:
        print(f"Ollama local failed ({e}). Falling back to Gemini...")
        llm_response = await query_gemini(full_prompt)
        
    return llm_response

def generate_extractive_summary(ticket_data) -> list[str]:
    import ast
    title = ""
    desc = ""
    service_type = ""
    data = None
    if isinstance(ticket_data, dict):
        data = ticket_data
    elif isinstance(ticket_data, str):
        try:
            data = ast.literal_eval(ticket_data)
        except Exception:
            pass
            
    if isinstance(data, dict):
        title = str(data.get("title", "")).strip()
        desc = str(data.get("description", "")).strip()
        service_type = str(data.get("serviceType", "")).strip()
        
    str_val = str(ticket_data)
    if not desc and str_val:
        desc = str_val[:200]
        
    bullet1 = f"Service Request: {title}" if title else (f"Type: {service_type}" if service_type else "General Investor Service Request")
    
    desc_clean = desc.replace('\n', ' ').strip()
    if len(desc_clean) > 110:
        desc_clean = desc_clean[:110] + "..."
    bullet2 = f"Detail: {desc_clean}" if desc_clean else "Review attached document and investor notes for specifics."
    
    bullet3 = "Action Required: L1/L2 desk review needed for SLA compliance and KYC verification."
    
    return [bullet1, bullet2, bullet3]

async def summarize_ticket(ticket_data_str: str) -> list[str]:
    system_prompt = (
        "You are an AI assistant for FinnovaX Nexus Portal. Your task is to summarize the following "
        "ticket data into 3 concise bullet points. Return ONLY a JSON array of strings, with no other text."
    )
    full_prompt = f"{system_prompt}\n\nTICKET DATA:\n{ticket_data_str}"
    
    response_text = await query_llm(full_prompt)
    
    import json
    import re
    try:
        # Extract JSON array from response (in case of markdown blocks)
        match = re.search(r'\[.*\]', response_text.replace('\n', ''))
        if match:
            bullets = json.loads(match.group(0))
            if isinstance(bullets, list) and len(bullets) > 0 and not any("failed to respond" in str(b) for b in bullets):
                return bullets
    except Exception as e:
        print(f"Summarizer failed to parse JSON array: {e}")
        
    # Smart extractive fallback if LLM hits rate limits (429) or offline
    print("Engaging rule-based extractive summarizer fallback due to LLM quota/offline.")
    return generate_extractive_summary(ticket_data_str)
