import httpx
from src.config.settings import settings
from src.config.logging import get_logger

logger = get_logger("telephony_client")


async def initiate_callback(phone_number: str) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"https://api.{settings.TELEPHONY_PROVIDER}.com/v1/calls",
                auth=(settings.TELEPHONY_API_KEY, settings.TELEPHONY_API_SECRET),
                json={"to": phone_number, "from": settings.TELEPHONY_CALLBACK_NUMBER},
            )
            response.raise_for_status()
            return response.json().get("call_sid")
    except httpx.HTTPError as exc:
        logger.error("callback_initiation_failed", phone_number=phone_number, error=str(exc))
        return None
