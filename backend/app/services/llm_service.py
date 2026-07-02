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
    
    max_retries = 3
    base_delay = 15 # Gemini quota errors usually request ~12-15s wait

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
            if isinstance(bullets, list):
                return bullets
    except Exception as e:
        print(f"Summarizer failed to parse JSON array: {e}")
        
    # Fallback if it fails to generate strict JSON
    return ["AI Summary generation failed", "Check ticket details manually", response_text[:100]]
