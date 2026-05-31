import secrets
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import create_access_token, create_refresh_token, get_subject_from_token
from app.auth.security import hash_password, verify_password
from app.database.session import get_db
from app.models.user import User, UserRole
from app.schemas.auth import (
    ForgotPasswordRequest,
    GuestSessionResponse,
    LoginRequest,
    RefreshRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory reset tokens for dev; use Redis in production
_password_reset_tokens: dict[str, str] = {}


@router.post("/signup", response_model=TokenResponse)
async def signup(data: SignupRequest, db: AsyncSession = Depends(get_db)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if len(data.password) < 8 or not any(c.isupper() for c in data.password) or not any(c.isdigit() for c in data.password):
        raise HTTPException(status_code=400, detail="Password must be 8+ chars with uppercase and number")

    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        mobile=data.mobile,
        role=UserRole.USER,
    )
    db.add(user)
    await db.flush()

    return TokenResponse(
        access_token=create_access_token(user.id, {"role": user.role.value}),
        refresh_token=create_refresh_token(user.id),
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user.last_login_at = datetime.now(UTC)
    return TokenResponse(
        access_token=create_access_token(user.id, {"role": user.role.value}),
        refresh_token=create_refresh_token(user.id),
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        is_guest=user.is_guest,
    )


@router.post("/guest", response_model=GuestSessionResponse)
async def guest_session(db: AsyncSession = Depends(get_db)):
    guest_id = uuid.uuid4().hex[:8]
    user = User(
        email=f"guest_{guest_id}@roxzave.local",
        password_hash=hash_password(secrets.token_urlsafe(32)),
        full_name="Guest User",
        role=UserRole.USER,
        is_guest=True,
    )
    db.add(user)
    await db.flush()
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        is_guest=True,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    from uuid import UUID

    from app.auth.jwt import TokenValidationError

    try:
        user_id = UUID(get_subject_from_token(data.refresh_token, "refresh"))
    except (TokenValidationError, ValueError) as e:
        raise HTTPException(status_code=401, detail="Invalid refresh token") from e

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return TokenResponse(
        access_token=create_access_token(user.id, {"role": user.role.value}),
        refresh_token=create_refresh_token(user.id),
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        is_guest=user.is_guest,
    )


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email.lower()))
    user = result.scalar_one_or_none()
    if user:
        token = secrets.token_urlsafe(32)
        _password_reset_tokens[token] = str(user.id)
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    from uuid import UUID

    user_id = _password_reset_tokens.pop(data.token, None)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(data.new_password)
    return {"message": "Password updated successfully"}
