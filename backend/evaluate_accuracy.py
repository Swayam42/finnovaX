import pandas as pd
import requests
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import time

# Configuration
API_URL = "http://127.0.0.1:8000/sentiment/analyze"

# Sample Financial Complaint Dataset (Ground Truth)
# Testing complex financial language that generic models fail at
sample_data = [
    {"text": "My SIP auto-debit failed and my portfolio NAV is showing a 20% drop.", "true_sentiment": "NEGATIVE"},
    {"text": "I just want to update my residential address on the portal.", "true_sentiment": "NEUTRAL"},
    {"text": "The company's quarterly earnings exceeded expectations with a 15% dividend yield.", "true_sentiment": "POSITIVE"},
    {"text": "My account is locked and I cannot access my funds. This is a terrible issue!", "true_sentiment": "NEGATIVE"},
    {"text": "The mutual fund performed exactly as expected this month.", "true_sentiment": "NEUTRAL"},
    {"text": "I was charged hidden brokerage fees on my last transaction and I want a refund immediately.", "true_sentiment": "NEGATIVE"},
    {"text": "How do I download my annual tax statement for the previous fiscal year?", "true_sentiment": "NEUTRAL"},
    {"text": "Great service, the support team resolved my margin call query quickly.", "true_sentiment": "POSITIVE"}
]

def evaluate_models():
    print("Starting AI Model Evaluation Pipeline...")
    df = pd.DataFrame(sample_data)
    
    y_true = []
    y_pred = []
    
    print("\nEvaluating Sentiment Analysis API...")
    for index, row in df.iterrows():
        text = row['text']
        true_label = row['true_sentiment']
        
        try:
            response = requests.post(API_URL, json={"text": text})
            if response.status_code == 200:
                pred_label = response.json().get("sentiment")
                y_true.append(true_label)
                y_pred.append(pred_label)
                print(f"[{true_label} -> {pred_label}] Score: {response.json().get('score')} | Text: {text[:30]}...")
            else:
                print(f"Error {response.status_code} for text: {text}")
        except Exception as e:
            print(f"Failed to connect to API: {e}")
            return
            
        time.sleep(0.5) # Prevent rate limiting
        
    # Calculate Metrics
    if len(y_true) > 0:
        accuracy = accuracy_score(y_true, y_pred)
        f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)
        precision = precision_score(y_true, y_pred, average="weighted", zero_division=0)
        recall = recall_score(y_true, y_pred, average="weighted", zero_division=0)
        
        print("\n" + "="*40)
        print("MODEL ACCURACY REPORT")
        print("="*40)
        print(f"Total Samples Tested: {len(y_true)}")
        print(f"Accuracy:  {accuracy:.2%}")
        print(f"Precision: {precision:.2%} (Negative Class)")
        print(f"Recall:    {recall:.2%} (Negative Class)")
        print(f"F1-Score:  {f1:.2%} (Negative Class)")
        print("="*40)
    else:
        print("No data was evaluated successfully.")

if __name__ == "__main__":
    evaluate_models()
