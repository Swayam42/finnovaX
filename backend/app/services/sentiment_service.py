import torch
from transformers import pipeline

import threading

_analyzer = None
_analyzer_lock = threading.Lock()

def get_analyzer():
    global _analyzer
    if _analyzer is None:
        with _analyzer_lock:
            if _analyzer is None:
                try:
                    device = 0 if torch.cuda.is_available() else -1
                    # Upgraded to Industry-Standard Financial Model
                    _analyzer = pipeline("sentiment-analysis", model="ProsusAI/finbert", device=device)
                except Exception as e:
                    print(f"Failed to load transformer model: {e}")
    return _analyzer

def classify_intent(text: str) -> str:
    text_lower = text.lower()
    if any(k in text_lower for k in ["scam", "fraud", "hacked", "stolen", "unauthorized", "theft"]):
        return "FRAUD_REPORT"
    if any(k in text_lower for k in ["update", "change", "modify", "correct"]):
        return "UPDATE_REQUEST"
    if any(k in text_lower for k in ["why", "how", "when", "what", "where", "status"]):
        return "INQUIRY"
    if any(k in text_lower for k in ["cancel", "stop", "close"]):
        return "CANCELLATION"
    return "COMPLAINT"

def get_sentiment(text: str):
    fraud_keywords = ["scam", "fraud", "hacked", "stolen", "unauthorized", "theft"]
    fraud_alert = any(keyword in text.lower() for keyword in fraud_keywords)
    severe_keywords = ["lawyer", "sue", "legal", "unacceptable", "fbi", "police", "court", "urgent", "ombudsman", "disgusting", "terrible"]
    
    analyzer = get_analyzer()
    if analyzer:
        try:
            result = analyzer(text[:512])[0] # Truncate to avoid length errors
            label = result['label'].upper()
            confidence = result['score']
            
            # Use exact scores instead of manipulating them
            return label, confidence, fraud_alert
        except Exception:
            pass
            
    # Fallback if model fails to load
    negative_count = sum(1 for keyword in severe_keywords if keyword in text.lower())
    if fraud_alert:
        negative_count += 2
        
    if negative_count > 0:
        return "NEGATIVE", min(1.0, 0.7 + (negative_count * 0.1)), fraud_alert
    # Change from POSITIVE 0.9 to NEUTRAL 0.5 so we know the model crashed
    return "NEUTRAL", 0.5, fraud_alert

def analyze_complaint_text(text: str):
    sentiment, score, fraud_alert = get_sentiment(text)
    intent = classify_intent(text)
    
    severe_keywords = ["lawyer", "sue", "legal", "unacceptable", "fbi", "police", "court", "urgent", "ombudsman", "disgusting", "terrible"]
    is_severe = any(k in text.lower() for k in severe_keywords)
    
    # Escalation Logic based on Sentiment & Intent
    priority = "NORMAL"
    
    if fraud_alert or intent == "FRAUD_REPORT":
        priority = "CRITICAL"
    elif is_severe or (sentiment == "NEGATIVE" and score > 0.95):
        priority = "HIGH"
    elif sentiment == "NEGATIVE":
        priority = "HIGH"
    
    return sentiment, round(score, 4), priority, fraud_alert, intent
