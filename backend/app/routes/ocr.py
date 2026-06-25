from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from app.models.schemas import OCRVerificationResponse
from app.services.ocr_service import extract_and_verify

router = APIRouter()

@router.post("/verify-account", response_model=OCRVerificationResponse)
async def verify_account(
    account_number: str = Form(..., description="The account number to verify"),
    file: UploadFile = File(..., description="The image of the document (e.g. check, statement)")
):
    content_type = file.content_type or ""
    if not content_type.startswith('image/') and not content_type.startswith('application/pdf'):
        raise HTTPException(status_code=400, detail="File provided is not an image or PDF.")

    image_bytes = await file.read()
    
    account_found, extracted_text_blocks, message = extract_and_verify(image_bytes, account_number)
    
    return OCRVerificationResponse(
        account_found=account_found,
        extracted_text=extracted_text_blocks,
        message=message
    )
