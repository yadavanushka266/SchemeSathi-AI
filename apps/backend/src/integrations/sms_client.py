import httpx
from src.config.settings import settings
from src.config.logging import get_logger

logger = get_logger("sms_client")


async def send_sms(phone_number: str, message: str) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"https://api.{settings.SMS_PROVIDER}.com/v1/sms",
                headers={"Authorization": f"Bearer {settings.SMS_API_KEY}"},
                json={"to": phone_number, "message": message},
            )
            response.raise_for_status()
            return response.json().get("message_id")
    except httpx.HTTPError as exc:
        logger.error("sms_send_failed", phone_number=phone_number, error=str(exc))
        return None
