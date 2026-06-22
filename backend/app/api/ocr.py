# pyrefly: ignore [missing-import]
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
import random

router = APIRouter()

class OCRVerificationResponse(BaseModel):
    account_found: bool
    extracted_text: list[str]
    message: str

import easyocr
import io

# Load Reader globally to save time on subsequent requests
try:
    import torch
    use_gpu = torch.cuda.is_available()
    reader = easyocr.Reader(['en'], gpu=use_gpu)
except Exception as e:
    reader = None
    print(f"Failed to load EasyOCR: {e}")

@router.post("/verify-account", response_model=OCRVerificationResponse)
async def verify_account(
    account_number: str = Form(..., description="The account number to verify"),
    file: UploadFile = File(..., description="The image of the document (e.g. check, statement)")
):
    content_type = file.content_type or ""
    if not content_type.startswith('image/') and not content_type.startswith('application/pdf'):
        raise HTTPException(status_code=400, detail="File provided is not an image or PDF, or missing content-type.")

    # Read the file bytes
    image_bytes = await file.read()
    
    extracted_text_blocks = []
    if reader:
        try:
            # easyocr can read directly from bytes
            results = reader.readtext(image_bytes)
            # results is a list of tuples: (bbox, text, prob)
            extracted_text_blocks = [text for (_, text, _) in results]
        except Exception as e:
            print(f"EasyOCR processing failed: {e}")
            extracted_text_blocks = ["OCR Processing Failed"]
    else:
        extracted_text_blocks = ["OCR Engine Not Loaded"]
    
    # Exact string matching logic
    combined_text = " ".join(extracted_text_blocks).upper()
    clean_extracted = combined_text.replace(" ", "").replace("-", "")
    clean_account = account_number.upper().replace(" ", "").replace("-", "")
    
    account_found = clean_account in clean_extracted
    
    if account_found:
        message = f"Account number '{account_number}' successfully verified in document."
    else:
        message = f"Account number '{account_number}' not found in document."
        
    return OCRVerificationResponse(
        account_found=account_found,
        extracted_text=extracted_text_blocks,
        message=message
    )
