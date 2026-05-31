from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserProfile(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    mobile: str | None
    address: str | None
    profile_photo_url: str | None
    role: str
    safety_score: int
    blood_group: str | None
    allergies: str | None
    preferences: dict
    is_guest: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    full_name: str | None = None
    mobile: str | None = None
    address: str | None = None
    blood_group: str | None = None
    allergies: str | None = None
    preferences: dict | None = None


class VehicleCreate(BaseModel):
    make: str | None = None
    model: str | None = None
    year: int | None = None
    registration_number: str | None = None
    fuel_type: str | None = "petrol"
    mileage_kmpl: float | None = 15.0
    is_primary: bool = True


class VehicleResponse(BaseModel):
    id: UUID
    make: str | None
    model: str | None
    year: int | None
    registration_number: str | None
    fuel_type: str | None
    mileage_kmpl: float | None
    is_primary: bool

    model_config = {"from_attributes": True}


class EmergencyContactCreate(BaseModel):
    name: str
    phone: str
    relationship_type: str | None = None
    is_guardian: bool = False
    priority: int = 1


class EmergencyContactResponse(BaseModel):
    id: UUID
    name: str
    phone: str
    relationship_type: str | None
    is_guardian: bool
    priority: int

    model_config = {"from_attributes": True}
