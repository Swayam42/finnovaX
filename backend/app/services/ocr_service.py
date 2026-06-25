import re
import difflib

# Load Reader globally to save time on subsequent requests
try:
    import easyocr
    import torch
    use_gpu = torch.cuda.is_available()
    reader = easyocr.Reader(['en'], gpu=use_gpu)
except Exception as e:
    reader = None
    print(f"Failed to load EasyOCR: {e}")

def extract_and_verify(image_bytes: bytes, account_number: str):
    extracted_text_blocks = []
    if reader:
        try:
            results = reader.readtext(image_bytes)
            extracted_text_blocks = [text for (_, text, _) in results]
        except Exception as e:
            print(f"EasyOCR processing failed: {e}")
            extracted_text_blocks = ["OCR Processing Failed"]
    else:
        extracted_text_blocks = ["OCR Engine Not Loaded"]
    
    combined_text = " ".join(extracted_text_blocks).upper()
    
    clean_extracted = re.sub(r'[^A-Z0-9]', '', combined_text)
    clean_account = re.sub(r'[^A-Z0-9]', '', account_number.upper())
    
    account_found = clean_account in clean_extracted
    
    if not account_found and len(clean_account) > 0 and len(clean_extracted) >= len(clean_account):
        window_size = len(clean_account)
        for i in range(len(clean_extracted) - window_size + 1):
            window = clean_extracted[i:i+window_size+1]
            ratio = difflib.SequenceMatcher(None, clean_account, window).ratio()
            if ratio >= 0.85:
                account_found = True
                break
                
    message = f"Account number '{account_number}' successfully verified in document." if account_found else f"Account number '{account_number}' not found in document."
    
    return account_found, extracted_text_blocks, message
