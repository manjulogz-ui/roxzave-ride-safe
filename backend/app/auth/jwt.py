from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

from jose import JWTError, jwt

from app.config import settings


def create_access_token(subject: str | UUID, extra: dict[str, Any] | None = None) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(subject), "exp": expire, "type": "access"}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str | UUID) -> str:
    expire = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    payload = {"sub": str(subject), "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.jwt_refresh_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])


def decode_refresh_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_refresh_secret_key, algorithms=[settings.jwt_algorithm])


def verify_token_type(payload: dict[str, Any], expected: str) -> bool:
    return payload.get("type") == expected


class TokenValidationError(Exception):
    pass


def get_subject_from_token(token: str, token_type: str = "access") -> str:
    try:
        decode_fn = decode_access_token if token_type == "access" else decode_refresh_token
        payload = decode_fn(token)
        if not verify_token_type(payload, token_type):
            raise TokenValidationError("Invalid token type")
        sub = payload.get("sub")
        if not sub:
            raise TokenValidationError("Missing subject")
        return sub
    except JWTError as e:
        raise TokenValidationError(str(e)) from e
