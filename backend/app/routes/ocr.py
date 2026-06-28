from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import List
from app.models.schemas import OCRVerificationResponse, KYCVerificationResponse
from app.services.ocr_service import extract_and_verify

router = APIRouter()

@router.post("/verify-account", response_model=OCRVerificationResponse)
async def verify_account(
    account_number: str = Form("", description="The account number to verify"),
    files: List[UploadFile] = File(..., description="The image(s) of the document (e.g. check, statement)")
):
    image_bytes_list = []
    
    for file in files:
        content_type = file.content_type or ""
        if not content_type.startswith('image/') and not content_type.startswith('application/pdf'):
            raise HTTPException(status_code=400, detail=f"File '{file.filename}' is not an image or PDF.")
        image_bytes_list.append(await file.read())

    if not image_bytes_list:
        raise HTTPException(status_code=400, detail="No valid files provided.")

    account_found, extracted_text_blocks, message = extract_and_verify(image_bytes_list, account_number)
    
    return OCRVerificationResponse(
        account_found=account_found,
        extracted_text=extracted_text_blocks,
        message=message
    )

@router.post("/verify-kyc", response_model=KYCVerificationResponse)
async def verify_kyc(
    target_name: str = Form("", description="The name to verify"),
    target_dob: str = Form("", description="The dob to verify (YYYY-MM-DD or DD/MM/YYYY etc)"),
    files: List[UploadFile] = File(..., description="The image(s) of the KYC document (e.g. Aadhaar, PAN)")
):
    image_bytes_list = []
    
    for file in files:
        content_type = file.content_type or ""
        if not content_type.startswith('image/') and not content_type.startswith('application/pdf'):
            raise HTTPException(status_code=400, detail=f"File '{file.filename}' is not an image or PDF.")
        image_bytes_list.append(await file.read())

    if not image_bytes_list:
        raise HTTPException(status_code=400, detail="No valid files provided.")

    from app.services.ocr_service import extract_and_verify_kyc
    match_found, extracted_text_blocks, message = extract_and_verify_kyc(image_bytes_list, target_name, target_dob)
    
    return KYCVerificationResponse(
        match_found=match_found,
        extracted_text=extracted_text_blocks,
        message=message
    )
