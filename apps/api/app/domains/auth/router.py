from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.domains.auth.schemas import (
    AuthTokenResponse,
    GoogleAuthRequest,
    OAuthSignInRequest,
    UserAuthResponse,
    UserLoginRequest,
    UserRegisterRequest,
)
from app.domains.auth.security import decode_access_token
from app.domains.auth.services import AuthService

router = APIRouter()


async def get_current_user_id(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
) -> str:
    """
    Extracts and validates user ID from JWT Bearer token or legacy X-User-ID header.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            return payload["sub"]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if x_user_id:
        return x_user_id

    # Fallback to default demo user ID only in development and testing
    if settings.APP_ENV in ("development", "test"):
        return "00000000-0000-0000-0000-000000000001"

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication credentials required.",
        headers={"WWW-Authenticate": "Bearer"},
    )



@router.post(
    "/register",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user with email and password",
)
async def register(
    req: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthTokenResponse:
    return await AuthService.register(db, req)


@router.post(
    "/login",
    response_model=AuthTokenResponse,
    summary="Authenticate user with email and password",
)
async def login(
    req: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthTokenResponse:
    return await AuthService.login(db, req)


@router.post(
    "/google",
    response_model=AuthTokenResponse,
    summary="Authenticate or sign up with Google SSO",
)
async def google_auth(
    req: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthTokenResponse:
    return await AuthService.google_auth(db, req)


@router.post(
    "/oauth",
    response_model=AuthTokenResponse,
    summary="Authenticate or sign up with GitHub/LinkedIn OAuth",
)
async def oauth_auth(
    req: OAuthSignInRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthTokenResponse:
    return await AuthService.oauth_login(db, req)


@router.post(
    "/github",
    response_model=AuthTokenResponse,
    summary="Authenticate with GitHub OAuth",
)
async def github_auth(
    req: OAuthSignInRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthTokenResponse:
    req.provider = "github"
    return await AuthService.oauth_login(db, req)


@router.post(
    "/linkedin",
    response_model=AuthTokenResponse,
    summary="Authenticate with LinkedIn OAuth",
)
async def linkedin_auth(
    req: OAuthSignInRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthTokenResponse:
    req.provider = "linkedin"
    return await AuthService.oauth_login(db, req)


@router.get(
    "/me",
    response_model=UserAuthResponse,
    summary="Get profile of current authenticated user",
)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> UserAuthResponse:
    return await AuthService.get_current_user_profile(user_id, db)


@router.post(
    "/logout",
    summary="Log out current session",
)
async def logout():
    return {"status": "success", "message": "Logged out successfully."}
