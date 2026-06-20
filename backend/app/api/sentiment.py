from fastapi import APIRouter
from pydantic import BaseModel
from transformers import pipeline

router = APIRouter()

# Load the DistilBERT model for sentiment analysis
sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

class ComplaintRequest(BaseModel):
    text: str

class ComplaintResponse(BaseModel):
    sentiment: str
    score: float
    priority: str

@router.post("/analyze", response_model=ComplaintResponse)
def analyze_complaint(request: ComplaintRequest):
    result = sentiment_pipeline(request.text)[0]
    sentiment = result['label']
    score = result['score']
    
    # If the sentiment is negative, flag as CRITICAL
    priority = "CRITICAL" if sentiment == "NEGATIVE" else "NORMAL"
    
    return ComplaintResponse(
        sentiment=sentiment,
        score=score,
        priority=priority
    )
