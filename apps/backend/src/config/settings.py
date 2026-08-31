from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENV: str = "development"
    APP_NAME: str = "SIH26092 Scheme Matching API"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/scheme_matching"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_DEFAULT: str = "100/minute"

    AI_PROVIDER_API_KEY: str = ""
    AI_PROVIDER_BASE_URL: str = "https://api.openai.com/v1"

    TELEPHONY_PROVIDER: str = "exotel"
    TELEPHONY_API_KEY: str = ""
    TELEPHONY_API_SECRET: str = ""
    TELEPHONY_CALLBACK_NUMBER: str = ""

    SMS_PROVIDER: str = "msg91"
    SMS_API_KEY: str = ""

    OCR_PROVIDER: str = "google_vision"
    OCR_API_KEY: str = ""

    AWS_S3_BUCKET: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"

    EMAIL_PROVIDER: str = "ses"
    EMAIL_FROM_ADDRESS: str = "no-reply@scheme-matching.gov.in"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
