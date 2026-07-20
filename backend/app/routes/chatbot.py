from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag_service import query_context
from app.services.llm_service import query_llm

router = APIRouter()

@router.post("/ask", response_model=ChatResponse)
async def ask_chatbot(request: ChatRequest):
    # 1. Retrieval
    context_str, sources = query_context(request.question)
    
    # No ticket context for now, keep it strictly FAQ RAG-based.
    
    # 4. Prompt Construction
    system_prompt = (
        "You are Finora, the intelligent AI assistant for FinnovaX — a modern, secure investor services platform by FinnovaX. "
        "Your tone is professional, warm, and reassuring. Always be concise and helpful.\n\n"
        "GREETING RULE: If this appears to be a first message or a greeting (e.g. 'hi', 'hello', 'hey', 'start'), "
        "respond with EXACTLY this and nothing else:\n"
        "'Welcome to FinnovaX! 👋\n\nI'm Finora, your personal investment services assistant.\n\n"
        "I can help you with:\n"
        "• Understanding your KYC or profile status\n"
        "• Ticket submissions and service requests\n"
        "• Bank account, nominee, or address update queries\n"
        "• General platform FAQs\n\n"
        "What can I help you with today?'\n\n"
        "For all other questions: answer ONLY using the provided context in a clean, direct paragraph. "
        "Do NOT prefix your answer with 'Q:' or 'A:' or repeat the question. Return only the direct answer text. "
        "If the answer is not in the context, say 'I don't have that information right now, but our support team is here to help.' "
        "Never hallucinate policies or invent information."
    )
    if context_str:
        system_prompt += f"\n\nKNOWLEDGE BASE CONTEXT:\n{context_str}\n"

    
    history_str = ""
    if request.history:
        history_str = "CHAT HISTORY:\n"
        # Only process last 4 messages to save tokens
        for msg in request.history[-4:]:
            history_str += f"{'User' if msg['type'] == 'user' else 'Finora Assist'}: {msg['text']}\n"
    
    full_prompt = f"{system_prompt}\n{history_str}\nUser: {request.question}\nFinora Assist:"
    
    # 5. LLM Call
    llm_response = await query_llm(full_prompt)
    
    # Clean up any accidental Q/A prefix from LLM response
    if llm_response.startswith("A: "):
        llm_response = llm_response.split("A: ", 1)[1].strip()
    elif "\nA: " in llm_response and llm_response.startswith("Q: "):
        llm_response = llm_response.split("\nA: ", 1)[1].strip()
    
    # Graceful fallback if Gemini hits 429 quota or fails in cloud
    if "failed to respond" in llm_response or "429" in llm_response or "RESOURCE_EXHAUSTED" in llm_response:
        q_lower = request.question.lower().strip()
        if q_lower in ["hi", "hello", "hey", "start", "help", "good morning", "good evening"]:
            llm_response = (
                "Welcome to FinnovaX! 👋\n\nI'm Finora, your personal investment services assistant.\n\n"
                "I can help you with:\n"
                "• Understanding your KYC or profile status\n"
                "• Ticket submissions and service requests\n"
                "• Bank account, nominee, or address update queries\n"
                "• General platform FAQs\n\n"
                "What can I help you with today?"
            )
        elif context_str:
            llm_response = context_str
        else:
            llm_response = "I am currently experiencing high AI traffic, but our L1/L2 support desk is actively monitoring all tickets. Please submit a service request or check your dashboard for real-time updates."
    
    return ChatResponse(
        query=request.question,
        response=llm_response,
        retrieved_data_source=sources,
        sentiment="NEUTRAL",
        fraud_alert=False
    )

