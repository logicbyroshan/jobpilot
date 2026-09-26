import time
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.database import init_db
from app.core.errors import register_exception_handlers
from app.core.logging import logger, request_id_ctx, setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup and shutdown lifespan context."""
    setup_logging(level="DEBUG" if settings.DEBUG else "INFO")
    logger.info(f"Starting {settings.APP_NAME} in {settings.APP_ENV} environment...")

    # Initialize database tables
    try:
        await init_db()
        logger.info("Database schema initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize database schema: {e}", exc_info=True)

    yield

    logger.info(f"Shutting down {settings.APP_NAME}...")


app = FastAPI(
    title=settings.APP_NAME,
    description="JobPilot - AI-Powered Career Operating System API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_and_context_middleware(request: Request, call_next) -> Response:
    """Attaches unique request ID, enforces DPDP security headers, and logs structured HTTP metrics."""
    req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    token = request_id_ctx.set(req_id)
    start_time = time.time()

    try:
        response = await call_next(request)
        duration_ms = round((time.time() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = req_id

        # DPDP & OWASP Recommended Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        if settings.APP_ENV == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # Skip noisy polling endpoints from logs
        if not request.url.path.endswith("/health/live"):
            logger.info(
                f"{request.method} {request.url.path} - {response.status_code} ({duration_ms}ms)"
            )
        return response
    except Exception as exc:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        logger.error(f"Request failed: {request.method} {request.url.path} ({duration_ms}ms) - {exc}")
        raise
    finally:
        request_id_ctx.reset(token)



# Register Exception Handlers
register_exception_handlers(app)

# Include API Routers
app.include_router(api_v1_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": "0.1.0",
        "status": "online",
        "documentation": "/docs",
        "health": "/api/v1/health",
        "loop": "KNOW -> MATCH -> GAP -> IMPROVE -> PROVE -> APPLY -> OUTCOME",
    }
