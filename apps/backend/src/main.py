from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from src.config.database import engine
from src.config.logging import configure_logging, get_logger
from src.config.redis import get_redis_client
from src.config.settings import settings
from src.middlewares.error_handler import register_exception_handlers
from src.middlewares.rate_limiter import limiter
from src.middlewares.request_logger import RequestLoggingMiddleware
from src.middlewares.security_headers import SecurityHeadersMiddleware
from src.modules.analytics.router import router as analytics_router
from src.modules.applications.router import router as applications_router
from src.modules.auth.router import router as auth_router
from src.modules.beneficiaries.router import router as beneficiaries_router
from src.modules.documents.router import router as documents_router
from src.modules.facilitators.router import router as facilitators_router
from src.modules.matching.router import router as matching_router
from src.modules.notifications.router import router as notifications_router
from src.modules.outreach.router import router as outreach_router
from src.modules.readiness.router import router as readiness_router
from src.modules.schemes.router import router as schemes_router
from src.modules.users.router import router as users_router
from src.modules.voice.router import router as voice_router
from src.modules.voice.router import webhook_router as voice_webhook_router

configure_logging(settings.ENV)
logger = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("application_startup", env=settings.ENV)
    get_redis_client()
    yield
    logger.info("application_shutdown")
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/api/docs" if settings.ENV != "production" else None,
    redoc_url="/api/redoc" if settings.ENV != "production" else None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: _rate_limit_handler(request, exc))

app.add_middleware(SlowAPIMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

register_exception_handlers(app)

api_router_prefix = settings.API_V1_PREFIX
app.include_router(auth_router, prefix=api_router_prefix)
app.include_router(users_router, prefix=api_router_prefix)
app.include_router(beneficiaries_router, prefix=api_router_prefix)
app.include_router(schemes_router, prefix=api_router_prefix)
app.include_router(matching_router, prefix=api_router_prefix)
app.include_router(voice_router, prefix=api_router_prefix)
app.include_router(voice_webhook_router, prefix=api_router_prefix)
app.include_router(outreach_router, prefix=api_router_prefix)
app.include_router(readiness_router, prefix=api_router_prefix)
app.include_router(applications_router, prefix=api_router_prefix)
app.include_router(facilitators_router, prefix=api_router_prefix)
app.include_router(analytics_router, prefix=api_router_prefix)
app.include_router(documents_router, prefix=api_router_prefix)
app.include_router(notifications_router, prefix=api_router_prefix)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "environment": settings.ENV}


def _rate_limit_handler(request, exc):
    from fastapi.responses import JSONResponse

    return JSONResponse(status_code=429, content={"error_code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests, please try again later"})
