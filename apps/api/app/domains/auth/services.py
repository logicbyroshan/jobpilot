import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.domains.applications.models import ApplicationPolicy
from app.domains.auth.schemas import (
    AuthTokenResponse,
    GoogleAuthRequest,
    OAuthSignInRequest,
    UserAuthResponse,
    UserLoginRequest,
    UserRegisterRequest,
)
from app.domains.auth.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.domains.career_goals.models import CareerGoal
from app.domains.identity.models import ProfessionalIdentity, User
from app.infrastructure.sources.github import GitHubConnector


class AuthService:
    """Authentication and identity lifecycle service."""

    @staticmethod
    async def _format_user_auth_response(user: User, db: AsyncSession) -> UserAuthResponse:
        result = await db.execute(
            select(ProfessionalIdentity).where(ProfessionalIdentity.user_id == user.id)
        )
        identity = result.scalars().first()

        headline = identity.headline if identity else "Software Engineer"
        years_of_exp = identity.years_of_experience if identity else 0.0
        current_lvl = identity.current_level if identity else "Mid-Level"

        return UserAuthResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            avatar_url=user.avatar_url,
            headline=headline,
            years_of_experience=years_of_exp,
            current_level=current_lvl,
            auth_provider=user.auth_provider,
            is_verified=user.is_verified,
        )

    @classmethod
    async def register(cls, db: AsyncSession, req: UserRegisterRequest) -> AuthTokenResponse:
        existing = await db.execute(select(User).where(User.email == req.email.lower()))
        if existing.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists.",
            )

        if not req.consent_agreed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Affirmative consent to the DPDP Privacy Notice is required to create an account.",
            )

        new_user = User(
            id=str(uuid.uuid4()),
            email=req.email.lower(),
            full_name=req.full_name,
            hashed_password=hash_password(req.password),
            auth_provider="local",
            is_active=True,
            is_verified=False,
        )
        db.add(new_user)
        await db.flush()

        identity = ProfessionalIdentity(
            user_id=new_user.id,
            headline=req.headline or "Software Engineer",
            bio="",
            years_of_experience=2.0,
            current_level="Mid-Level",
            profile_confidence=0.75,
            summary_json={"core_competencies": ["Backend", "Python", "APIs"]},
        )
        db.add(identity)

        goal = CareerGoal(
            user_id=new_user.id,
            target_role="Software Engineer",
            target_seniority="Senior",
            location_preference="Remote",
            is_remote_preferred=True,
            target_salary_min=120000,
            target_salary_max=180000,
        )
        db.add(goal)

        policy = ApplicationPolicy(
            user_id=new_user.id,
            mode="ASSISTED",
            is_auto_apply_enabled=False,
            min_match_score=80.0,
            daily_application_limit=5,
            requires_user_approval=True,
        )
        db.add(policy)

        # Record Initial DPDP Section 6 Consent in Immutable Consent Ledger
        from app.domains.privacy.models import ConsentRecord, ParentalConsent
        now = datetime.now(timezone.utc)

        # Core Essential Purpose
        core_consent = ConsentRecord(
            id=str(uuid.uuid4()),
            user_id=new_user.id,
            purpose_id="CORE_CAREER_OPERATING_SYSTEM",
            purpose_name="Core Professional Identity & Opportunity Matching",
            status="GRANTED",
            notice_version="v1.0-dpdp-2025",
            consent_method="EXPLICIT_WEB_FORM_SIGNUP",
            granted_at=now,
        )
        db.add(core_consent)

        # Optional consented purposes
        if req.consented_purposes:
            for p_id in req.consented_purposes:
                if p_id != "CORE_CAREER_OPERATING_SYSTEM":
                    opt_consent = ConsentRecord(
                        id=str(uuid.uuid4()),
                        user_id=new_user.id,
                        purpose_id=p_id,
                        purpose_name=p_id,
                        status="GRANTED",
                        notice_version="v1.0-dpdp-2025",
                        consent_method="EXPLICIT_WEB_FORM_SIGNUP",
                        granted_at=now,
                    )
                    db.add(opt_consent)

        # Handle Minor / Under-18 VPC requirement
        if not req.is_adult:
            minor_vpc = ParentalConsent(
                id=str(uuid.uuid4()),
                user_id=new_user.id,
                parent_full_name="Parent / Legal Guardian",
                parent_email=f"parent_{new_user.email}",
                verification_method="EMAIL_OTP_VERIFICATION",
                verification_token=f"VPC-{uuid.uuid4().hex[:8].upper()}",
                is_verified=False,
            )
            db.add(minor_vpc)

        await db.commit()


        token = create_access_token({"sub": new_user.id, "email": new_user.email})
        user_resp = await cls._format_user_auth_response(new_user, db)

        return AuthTokenResponse(
            access_token=token,
            token_type="bearer",
            user=user_resp,
        )

    @classmethod
    async def login(cls, db: AsyncSession, req: UserLoginRequest) -> AuthTokenResponse:
        email_clean = req.email.lower()
        result = await db.execute(select(User).where(User.email == email_clean))
        user = result.scalars().first()

        if not user or not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account has been deactivated.",
            )

        token = create_access_token({"sub": user.id, "email": user.email})
        user_resp = await cls._format_user_auth_response(user, db)

        return AuthTokenResponse(
            access_token=token,
            token_type="bearer",
            user=user_resp,
        )

    @classmethod
    async def google_auth(cls, db: AsyncSession, req: GoogleAuthRequest) -> AuthTokenResponse:
        email_clean = req.email.lower()
        result = await db.execute(select(User).where(User.email == email_clean))
        user = result.scalars().first()

        if not user:
            user = User(
                id=str(uuid.uuid4()),
                email=email_clean,
                full_name=req.full_name,
                avatar_url=req.avatar_url,
                google_id=req.google_id or f"google_{uuid.uuid4().hex[:12]}",
                auth_provider="google",
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            await db.flush()

            identity = ProfessionalIdentity(
                user_id=user.id,
                headline="Software Engineer",
                bio="Google Authenticated Profile",
                years_of_experience=3.0,
                current_level="Mid-Level",
                profile_confidence=0.80,
                summary_json={"core_competencies": ["Full Stack", "Distributed Systems"]},
            )
            db.add(identity)

            goal = CareerGoal(
                user_id=user.id,
                target_role="Software Engineer",
                target_seniority="Senior",
                location_preference="Remote",
                is_remote_preferred=True,
                target_salary_min=130000,
                target_salary_max=200000,
            )
            db.add(goal)

            policy = ApplicationPolicy(
                user_id=user.id,
                mode="ASSISTED",
                is_auto_apply_enabled=False,
                min_match_score=80.0,
                daily_application_limit=5,
                requires_user_approval=True,
            )
            db.add(policy)
            await db.commit()
        else:
            if req.google_id and not user.google_id:
                user.google_id = req.google_id
            if req.avatar_url and not user.avatar_url:
                user.avatar_url = req.avatar_url
            await db.commit()

        token = create_access_token({"sub": user.id, "email": user.email})
        user_resp = await cls._format_user_auth_response(user, db)

        return AuthTokenResponse(
            access_token=token,
            token_type="bearer",
            user=user_resp,
        )

    @classmethod
    async def oauth_login(cls, db: AsyncSession, req: OAuthSignInRequest) -> AuthTokenResponse:
        """
        Handles GitHub and LinkedIn OAuth sign-in and account auto-provisioning.
        Exchanges code or uses profile info to create/login user seamlessly.
        """
        provider = req.provider.lower()
        email = (req.email or f"user_{provider}_{uuid.uuid4().hex[:6]}@jobpilot.dev").lower()
        full_name = req.full_name or f"{provider.capitalize()} Engineer"
        avatar_url = req.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
        headline = "Staff Systems Architect" if provider == "github" else "Senior Distributed Systems Engineer"

        # If live GitHub code provided, fetch live profile
        if provider == "github" and req.code:
            connector = GitHubConnector(
                client_id=settings.GITHUB_CLIENT_ID or "",
                client_secret=settings.GITHUB_CLIENT_SECRET or "",
            )
            token_res = await connector.exchange_code_for_token(req.code)
            access_token = token_res.get("access_token")
            if access_token:
                profile = await connector.fetch_user_profile(access_token)
                if profile:
                    login_name = profile.get("login")
                    email = (profile.get("email") or f"{login_name}@users.noreply.github.com").lower()
                    full_name = profile.get("name") or login_name
                    avatar_url = profile.get("avatar_url") or avatar_url
                    headline = f"GitHub Engineer (@{login_name})"

        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()

        if not user:
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                full_name=full_name,
                avatar_url=avatar_url,
                auth_provider=provider,
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            await db.flush()

            identity = ProfessionalIdentity(
                user_id=user.id,
                headline=headline,
                bio=f"Verified through {provider.capitalize()} OAuth integration.",
                years_of_experience=5.0 if provider == "github" else 4.0,
                current_level="Staff" if provider == "github" else "Senior",
                profile_confidence=0.92,
                summary_json={"core_competencies": ["Distributed Systems", "Python", "Go", "Cloud"]},
            )
            db.add(identity)

            goal = CareerGoal(
                user_id=user.id,
                target_role="Staff Systems Architect" if provider == "github" else "Staff Engineer",
                target_seniority="Staff",
                location_preference="Remote",
                is_remote_preferred=True,
                target_salary_min=180000,
                target_salary_max=280000,
            )
            db.add(goal)

            policy = ApplicationPolicy(
                user_id=user.id,
                mode="ASSISTED",
                is_auto_apply_enabled=False,
                min_match_score=85.0,
                daily_application_limit=10,
                requires_user_approval=True,
            )
            db.add(policy)
            await db.commit()
        else:
            if avatar_url and not user.avatar_url:
                user.avatar_url = avatar_url
            await db.commit()

        token = create_access_token({"sub": user.id, "email": user.email})
        user_resp = await cls._format_user_auth_response(user, db)

        return AuthTokenResponse(
            access_token=token,
            token_type="bearer",
            user=user_resp,
        )

    @classmethod
    async def get_current_user_profile(cls, user_id: str, db: AsyncSession) -> UserAuthResponse:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return await cls._format_user_auth_response(user, db)
