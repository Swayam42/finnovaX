from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from pydantic import BaseModel
import easyocr

router = APIRouter()

# Initialize EasyOCR reader (downloads model weights on first run)
reader = easyocr.Reader(['en'])

class OCRVerificationResponse(BaseModel):
    account_found: bool
    extracted_text: list[str]
    message: str

@router.post("/verify-account", response_model=OCRVerificationResponse)
async def verify_account(
    account_number: str = Form(..., description="The account number to verify"),
    file: UploadFile = File(..., description="The image of the document (e.g. check, statement)")
):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    # Read the image bytes
    image_bytes = await file.read()
    
    # Extract text using EasyOCR
    # reader.readtext accepts bytes directly
    results = reader.readtext(image_bytes)
    
    # EasyOCR results format: [(bbox, text, confidence), ...]
    extracted_text_blocks = [result[1] for result in results]
    
    # Exact string matching logic
    # We join all extracted text blocks and remove spaces/dashes to ensure 
    # we don't fail the verification due to OCR spacing artifacts
    combined_text = " ".join(extracted_text_blocks)
    clean_extracted = combined_text.replace(" ", "").replace("-", "")
    clean_account = account_number.replace(" ", "").replace("-", "")
    
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
