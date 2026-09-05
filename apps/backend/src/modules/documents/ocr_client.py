from src.integrations.storage_client import get_presigned_download_url
from src.integrations.ai_client import extract_document_fields


async def run_ocr(file_key: str, doc_type: str) -> dict:
    download_url = get_presigned_download_url(file_key)
    return await extract_document_fields(download_url, doc_type)
