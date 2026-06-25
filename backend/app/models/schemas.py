from pydantic import BaseModel

class ComplaintRequest(BaseModel):
    text: str

class ComplaintResponse(BaseModel):
    sentiment: str
    score: float
    priority: str
    fraud_alert: bool = False

class OCRVerificationResponse(BaseModel):
    account_found: bool
    extracted_text: list[str]
    message: str

class ChatRequest(BaseModel):
    question: str
    ticket_context: str = ""
    history: list[dict] = []
    format: str = None

class ChatResponse(BaseModel):
    query: str
    response: str
    retrieved_data_source: list[str]
    sentiment: str
    fraud_alert: bool = False
