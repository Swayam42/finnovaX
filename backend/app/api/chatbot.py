from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate
import os

router = APIRouter()

# Global variables for lazy loading
embedding_model = None
vector_store = None
llm = None

def get_vector_store():
    global embedding_model, vector_store
    if vector_store is None:
        try:
            # Load the same embedding model used during ingestion
            embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            
            # Connect to the persistent ChromaDB created by ingest_faqs.py
            db_path = os.path.join(os.getcwd(), "chroma_db")
            vector_store = Chroma(persist_directory=db_path, embedding_function=embedding_model)
        except Exception as e:
            print(f"Warning: Could not load ChromaDB: {e}")
    return vector_store

def get_llm():
    global llm
    if llm is None:
        # Connect to a local Ollama instance running the llama3 model
        llm = Ollama(model="llama3")
    return llm

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    query: str
    response: str
    retrieved_data_source: list[str]

# Aggressive System Prompt to strictly enforce RAG rules and prevent hallucination
PROMPT_TEMPLATE = """
You are a strict, precise financial compliance AI assistant for the KFintech Nexus Portal.
You must answer the user's question USING ONLY the provided context below.
If the context does not contain the information needed to answer the question, you must explicitly state: "I do not have enough information in my context to answer this query."
DO NOT hallucinate. DO NOT use outside knowledge. DO NOT guess.

Context:
{context}

Question: {question}

Answer:
"""

@router.post("/ask", response_model=ChatResponse)
def ask_chatbot(request: ChatRequest):
    db = get_vector_store()
    if db is None:
        raise HTTPException(status_code=500, detail="Vector store not initialized. Run ingest_faqs.py first.")
        
    local_llm = get_llm()
    
    # Perform cosine-similarity search against ChromaDB (top 2 closest matches)
    retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 2})
    docs = retriever.invoke(request.question)
    
    # Extract text from retrieved chunks
    retrieved_text = [doc.page_content for doc in docs]
    context_str = "\n\n".join(retrieved_text)
    
    # Assemble the prompt
    prompt = PromptTemplate(
        template=PROMPT_TEMPLATE,
        input_variables=["context", "question"]
    )
    formatted_prompt = prompt.format(context=context_str, question=request.question)
    
    # Query Llama 3 via Ollama
    try:
        response_text = local_llm.invoke(formatted_prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to communicate with Ollama: {e}. Is Ollama running locally?")
    
    return ChatResponse(
        query=request.question,
        response=response_text.strip(),
        retrieved_data_source=retrieved_text
    )
