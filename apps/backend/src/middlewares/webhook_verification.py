import hashlib
import hmac
from fastapi import Header
from src.config.settings import settings
from src.middlewares.error_handler import UnauthorizedException


async def verify_telephony_webhook(x_webhook_signature: str | None = Header(default=None)) -> None:
    if not settings.TELEPHONY_API_SECRET:
        return
    if not x_webhook_signature:
        raise UnauthorizedException("Missing webhook signature")
    expected = hmac.new(settings.TELEPHONY_API_SECRET.encode(), b"telephony-webhook", hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, x_webhook_signature):
        raise UnauthorizedException("Webhook signature verification failed")
