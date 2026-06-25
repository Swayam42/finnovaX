import torch
from transformers import pipeline

# Load pipeline globally to avoid reloading on every request
try:
    device = 0 if torch.cuda.is_available() else -1
    # Upgraded to Industry-Standard Financial Model
    sentiment_analyzer = pipeline("sentiment-analysis", model="ProsusAI/finbert", device=device)
except Exception as e:
    sentiment_analyzer = None
    print(f"Failed to load transformer model: {e}")

def get_sentiment(text: str):
    fraud_keywords = ["scam", "fraud", "hacked", "stolen", "unauthorized", "theft"]
    fraud_alert = any(keyword in text.lower() for keyword in fraud_keywords)
    severe_keywords = ["lawyer", "sue", "legal", "unacceptable", "fbi", "police", "court", "urgent", "ombudsman", "disgusting", "terrible"]
    
    if sentiment_analyzer:
        try:
            result = sentiment_analyzer(text)[0]
            label = result['label'].upper()
            confidence = result['score']
            
            if label == "NEGATIVE":
                score = confidence
                if any(keyword in text.lower() for keyword in severe_keywords) or fraud_alert:
                    score = min(1.0, score + 0.3)
                return "NEGATIVE", score, fraud_alert
            elif label == "POSITIVE":
                return "POSITIVE", 1.0 - confidence, fraud_alert
            else:
                return "NEUTRAL", 0.5, fraud_alert
        except Exception:
            pass
            
    # Fallback if model fails to load
    negative_count = sum(1 for keyword in severe_keywords if keyword in text.lower())
    if fraud_alert:
        negative_count += 2
        
    if negative_count > 0:
        return "NEGATIVE", min(1.0, 0.7 + (negative_count * 0.1)), fraud_alert
    return "POSITIVE", 0.1, fraud_alert

def analyze_complaint_text(text: str):
    sentiment, score, fraud_alert = get_sentiment(text)
    priority = "CRITICAL" if score > 0.75 or fraud_alert else "NORMAL"
    return sentiment, round(score, 4), priority, fraud_alert
