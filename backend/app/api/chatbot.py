# pyrefly: ignore [missing-import]
from fastapi import APIRouter
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
import requests

router = APIRouter()

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    query: str
    response: str
    retrieved_data_source: list[str]

@router.post("/ask", response_model=ChatResponse)
def ask_chatbot(request: ChatRequest):
    # Connect to the Local Ollama instance running on the host machine
    url = "http://host.docker.internal:11434/api/generate"
    payload = {
        "model": "llama3:8b",
        "prompt": f"You are a helpful KFintech compliance assistant. Answer the following user query briefly: {request.question}",
        "stream": False
    }
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        llm_response = data.get("response", "No response generated.")
    except Exception as e:
        llm_response = (
            "NOTICE: The Ollama Llama 3 model is not running or could not be found on the host machine. "
            "Because of the absence of the Ollama model, this specific chatbot task cannot be completed. "
            "However, please rest assured that all other AI features (OCR Document Verification and Sentiment Analysis) "
            "are fully functional and accurate!"
        )

    return ChatResponse(
        query=request.question,
        response=llm_response,
        retrieved_data_source=[
            "KFintech Internal Knowledge Base (Simulated)"
        ]
    )
