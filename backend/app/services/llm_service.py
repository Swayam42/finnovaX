import os
import httpx
from google import genai

GENI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client = None
if GENI_API_KEY:
    client = genai.Client(api_key=GENI_API_KEY)

def query_gemini(prompt: str) -> str:
    if not client:
        return "Gemini API key is missing, and Ollama is unreachable. Cannot process request."
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "Both Ollama and Gemini AI models failed to respond."

async def query_llm(full_prompt: str) -> str:
    llm_response = ""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post("http://localhost:11434/api/generate", json={
                "model": "llama3.2:1b",
                "prompt": full_prompt,
                "stream": False
            })
            response.raise_for_status()
            data = response.json()
            llm_response = data.get("response", "").strip()
    except Exception as e:
        print(f"Ollama local failed ({e}). Falling back to Gemini...")
        llm_response = query_gemini(full_prompt)
        
    return llm_response
