import requests
import json

# URL of the local FastAPI server
url = "http://localhost:8000/sentiment/analyze"

complaints = [
    "I have been trying to withdraw my funds from the mutual fund for 3 weeks and nobody is responding to my emails. This is absolutely unacceptable and I am filing a regulatory complaint!",
    "The new dashboard update is really nice. It's much easier to see my daily returns now. Thanks for the good work.",
    "I was charged a management fee twice this month on my index fund. I need this reversed immediately, your system is broken and stealing my money.",
    "Can someone please explain how the dividend reinvestment plan works for the growth fund? The FAQ is a bit confusing.",
    "Your customer service representative hung up on me when I asked about the hidden fees in the aggressive growth portfolio. I am closing my account today!"
]

def run_tests():
    print("Testing Sentiment & Priority API with Mutual Fund Complaints...\n")
    for i, complaint in enumerate(complaints, 1):
        print(f"Complaint {i}: \"{complaint}\"")
        try:
            response = requests.post(url, json={"text": complaint})
            if response.status_code == 200:
                result = response.json()
                priority_color = "\033[91m" if result['priority'] == "CRITICAL" else "\033[92m"
                reset_color = "\033[0m"
                print(f"--> Sentiment: {result['sentiment']} (Confidence: {result['score']:.4f})")
                print(f"--> Priority:  {priority_color}{result['priority']}{reset_color}\n")
            else:
                print(f"Error: {response.status_code} - {response.text}\n")
        except requests.exceptions.ConnectionError:
            print("Error: Could not connect to the server. Is the FastAPI backend running?\n")

if __name__ == "__main__":
    run_tests()
