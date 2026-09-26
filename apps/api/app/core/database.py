import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator

from sqlalchemy import DateTime, String
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.core.config import settings
from app.core.logging import logger

# Create async engine
engine_kwargs = {"echo": settings.DATABASE_ECHO}
if not settings.is_sqlite:
    engine_kwargs.update({
        "pool_size": 20,
        "max_overflow": 10,
        "pool_pre_ping": True,
    })

engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base model class with standard common attributes."""
    pass


class TimestampMixin:
    """Provides created_at and updated_at UTC timestamps."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class UUIDPrimaryKeyMixin:
    """Provides UUID string primary key for public/internal identity."""
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency yielding an async database session with automatic commit/rollback."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initializes tables for development/testing."""
    # Ensure all models are registered on Base.metadata
    import app.domains.identity.models  # noqa
    import app.domains.sources.models  # noqa
    import app.domains.evidence.models  # noqa
    import app.domains.skills.models  # noqa
    import app.domains.career_goals.models  # noqa
    import app.domains.jobs.models  # noqa
    import app.domains.matching.models  # noqa
    import app.domains.learning.models  # noqa
    import app.domains.assessments.models  # noqa
    import app.domains.applications.models  # noqa
    import app.domains.outcomes.models  # noqa
    import app.domains.privacy.models  # noqa

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized successfully")

