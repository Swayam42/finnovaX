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
    if any(k in text_lower for k in ["disappointed", "late", "unresponsive", "refund", "stopped working", "broken", "bad", "poor", "fail", "failed", "error", "issue", "problem", "delay", "delayed", "useless", "worst", "complaint", "frustrated", "unhappy", "waste", "never", "stuck", "ignore", "ignored", "denied", "loss", "lost", "faulty"]):
        return "COMPLAINT"
    if any(k in text_lower for k in ["update", "change", "modify", "correct"]):
        return "UPDATE_REQUEST"
    if any(k in text_lower for k in ["cancel", "stop", "close"]):
        return "CANCELLATION"
    if any(k in text_lower for k in ["why", "how", "when", "what", "where", "status"]):
        return "INQUIRY"
    return "COMPLAINT"

def get_sentiment(text: str):
    text_lower = text.lower()
    fraud_keywords = ["scam", "fraud", "hacked", "stolen", "unauthorized", "theft"]
    fraud_alert = any(keyword in text_lower for keyword in fraud_keywords)
    
    severe_keywords = ["lawyer", "sue", "legal", "unacceptable", "fbi", "police", "court", "urgent", "ombudsman", "disgusting", "terrible"]
    complaint_keywords = [
        "disappointed", "late", "unresponsive", "refund", "stopped working", "broken", 
        "bad", "poor", "fail", "failed", "error", "issue", "problem", "delay", "delayed", 
        "useless", "worst", "complaint", "frustrated", "unhappy", "waste", "never", 
        "stuck", "ignore", "ignored", "denied", "loss", "lost", "faulty", "not working",
        "doesn't work", "did not work", "no response", "waiting", "angry", "horrible", "awful", "pathetic", "slow"
    ]
    
    is_severe = any(k in text_lower for k in severe_keywords)
    complaint_count = sum(1 for k in complaint_keywords if k in text_lower)
    
    analyzer = get_analyzer()
    if analyzer:
        try:
            result = analyzer(text[:512])[0] # Truncate to avoid length errors
            label = result['label'].upper()
            confidence = result['score']
            
            # FinBERT is trained on stock reports; if it says NEUTRAL on a clear customer service complaint/dissatisfaction, override it with domain logic
            if label != "NEGATIVE" and (complaint_count >= 2 or is_severe or any(k in text_lower for k in ["disappointed", "refund", "unresponsive", "stopped working", "broken", "failed"])):
                return "NEGATIVE", 0.94, fraud_alert
                
            return label, confidence, fraud_alert
        except Exception:
            pass
            
    # Domain-specific fallback when HuggingFace model fails to load or is unreachable in cloud container
    if fraud_alert:
        return "NEGATIVE", 0.98, True
    if is_severe or complaint_count >= 2 or any(k in text_lower for k in ["disappointed", "refund", "unresponsive", "stopped working", "broken", "failed", "terrible"]):
        negative_score = min(0.99, 0.88 + (complaint_count * 0.03))
        return "NEGATIVE", round(negative_score, 4), fraud_alert
    elif complaint_count == 1:
        return "NEGATIVE", 0.75, fraud_alert
        
    return "NEUTRAL", 0.50, fraud_alert

def analyze_complaint_text(text: str):
    sentiment, score, fraud_alert = get_sentiment(text)
    intent = classify_intent(text)
    text_lower = text.lower()
    
    severe_keywords = ["lawyer", "sue", "legal", "unacceptable", "fbi", "police", "court", "urgent", "ombudsman", "disgusting", "terrible"]
    is_severe = any(k in text_lower for k in severe_keywords)
    has_strong_complaint = any(k in text_lower for k in ["disappointed", "refund", "unresponsive", "stopped working", "broken", "failed", "error", "delay", "worst"])
    
    # Escalation Logic based on Sentiment & Intent
    priority = "NORMAL"
    
    if fraud_alert or intent == "FRAUD_REPORT":
        priority = "CRITICAL"
    elif is_severe or (sentiment == "NEGATIVE" and (score > 0.85 or has_strong_complaint)):
        priority = "HIGH"
    elif sentiment == "NEGATIVE":
        priority = "HIGH"
    
    return sentiment, round(score, 4), priority, fraud_alert, intent
