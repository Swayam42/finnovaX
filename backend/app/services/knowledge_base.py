import os
import json
import chromadb
from chromadb.utils import embedding_functions

def seed_faqs():
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chroma_db")
    data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "faqs.json")
    
    print(f"Initializing ChromaDB client at {db_path}...")
    client = chromadb.PersistentClient(path=db_path)
    emb_fn = embedding_functions.DefaultEmbeddingFunction()
    
    collection_name = "finnovax_faqs"
    print(f"Creating or getting collection: {collection_name}")
    collection = client.get_or_create_collection(
        name=collection_name,
        embedding_function=emb_fn
    )
    
    with open(data_path, "r", encoding="utf-8") as f:
        faqs = json.load(f)
    
    existing_count = collection.count()
    if existing_count > 0:
        print(f"Found {existing_count} existing documents. Skipping seed.")
        return
        
    documents = []
    metadatas = []
    ids = []
    
    for faq in faqs:
        doc_text = f"Q: {faq['question']}\nA: {faq['answer']}"
        documents.append(doc_text)
        metadatas.append({"type": "faq", "question": faq['question'], "answer": faq['answer']})
        ids.append(faq["id"])
        
    print(f"Adding {len(documents)} FAQs to ChromaDB...")
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )
    print("Seed ingestion complete!")
    print(f"Collection now has {collection.count()} items.")

if __name__ == "__main__":
    seed_faqs()
