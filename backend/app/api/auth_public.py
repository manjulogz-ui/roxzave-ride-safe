"""Mount auth at /auth/* per PRD (duplicate of /api/auth/*)."""
from fastapi import APIRouter

from app.api.v1 import auth

auth_public_router = APIRouter()
auth_public_router.include_router(auth.router)
