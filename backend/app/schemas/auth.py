from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    mobile: str = Field(min_length=10, max_length=15)
    password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: UUID
    email: str
    full_name: str
    role: str
    is_guest: bool = False


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class GuestSessionResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: UUID
    is_guest: bool = True
