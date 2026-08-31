import httpx
from src.config.settings import settings
from src.config.logging import get_logger

logger = get_logger("ai_client")
_HTTP_TIMEOUT = 30.0


async def transcribe_audio(audio_url: str, language: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
            response = await client.post(
                f"{settings.AI_PROVIDER_BASE_URL}/audio/transcriptions",
                headers={"Authorization": f"Bearer {settings.AI_PROVIDER_API_KEY}"},
                json={"audio_url": audio_url, "language": language},
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as exc:
        logger.error("stt_request_failed", error=str(exc))
        return {"text": "", "confidence": 0.0}


async def synthesize_speech(text: str, language: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
            response = await client.post(
                f"{settings.AI_PROVIDER_BASE_URL}/audio/speech",
                headers={"Authorization": f"Bearer {settings.AI_PROVIDER_API_KEY}"},
                json={"text": text, "language": language},
            )
            response.raise_for_status()
            return response.json().get("audio_url", "")
    except httpx.HTTPError as exc:
        logger.error("tts_request_failed", error=str(exc))
        return ""


async def extract_document_fields(document_url: str, doc_type: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
            response = await client.post(
                f"{settings.AI_PROVIDER_BASE_URL}/vision/extract",
                headers={"Authorization": f"Bearer {settings.AI_PROVIDER_API_KEY}"},
                json={"document_url": document_url, "doc_type": doc_type},
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as exc:
        logger.error("ocr_request_failed", error=str(exc))
        return {}


async def generate_natural_language_explanation(prompt: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
            response = await client.post(
                f"{settings.AI_PROVIDER_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {settings.AI_PROVIDER_API_KEY}"},
                json={"messages": [{"role": "user", "content": prompt}], "max_tokens": 200},
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except (httpx.HTTPError, KeyError, IndexError) as exc:
        logger.error("llm_explanation_failed", error=str(exc))
        return ""
