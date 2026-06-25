from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag_service import query_context
from app.services.sentiment_service import analyze_complaint_text
from app.services.llm_service import query_llm

router = APIRouter()

@router.post("/ask", response_model=ChatResponse)
async def ask_chatbot(request: ChatRequest):
    # 1. Retrieval
    context_str, sources = query_context(request.question)
    
    # 2. Add Ticket Context
    if request.ticket_context:
        context_str += f"\n\nUSER'S ACTIVE TICKETS (Use this if they ask for status):\n{request.ticket_context}"
        sources.append("User's Live Ticket Data")
        
    # 3. Sentiment Analysis
    sentiment, _, _, fraud_alert = analyze_complaint_text(request.question)
    
    # 4. Prompt Construction
    system_prompt = (
        "You are Nexus, a friendly and professional KFintech compliance assistant. "
        "If the user greets you (e.g. 'hi', 'hello', 'hlo'), greet them back and ask how you can help. "
        "If they ask a specific question, answer it ONLY using the provided context. "
        "If the specific answer is not in the context, politely say 'I do not have that information.' "
        "Do not hallucinate policies."
    )
    if context_str:
        system_prompt += f"\n\nCONTEXT:\n{context_str}\n\n"
    
    history_str = ""
    if request.history:
        history_str = "CHAT HISTORY:\n"
        for msg in request.history[-4:]:
            history_str += f"{'User' if msg['type'] == 'user' else 'Nexus'}: {msg['text']}\n"
    
    full_prompt = f"{system_prompt}\n{history_str}\nUser: {request.question}\nNexus:"
    
    # 5. LLM Call
    llm_response = await query_llm(full_prompt)
    
    if not sources and not request.ticket_context:
        # Don't add a fake source if there genuinely are no sources and it's just a greeting.
        pass
        
    return ChatResponse(
        query=request.question,
        response=llm_response,
        retrieved_data_source=sources,
        sentiment=sentiment,
        fraud_alert=fraud_alert
    )
