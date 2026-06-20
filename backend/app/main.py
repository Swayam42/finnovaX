from fastapi import FastAPI
from app.api import sentiment
from app.api import ocr
from app.api import chatbot

app = FastAPI(title="KFintech Nexus Portal AI Models API")

# Include the routers
app.include_router(sentiment.router, prefix="/sentiment", tags=["Sentiment"])
app.include_router(ocr.router, prefix="/ocr", tags=["OCR Verification"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["RAG Chatbot"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the KFintech Nexus Portal AI Models API"}
