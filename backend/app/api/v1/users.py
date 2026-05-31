from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.user import EmergencyContact, User, Vehicle
from app.schemas.user import (
    EmergencyContactCreate,
    EmergencyContactResponse,
    UserProfile,
    UserProfileUpdate,
    VehicleCreate,
    VehicleResponse,
)

router = APIRouter(prefix="/user", tags=["User Profile"])


@router.get("/profile", response_model=UserProfile)
async def get_profile(user: User = Depends(get_current_user)):
    return user


@router.patch("/profile", response_model=UserProfile)
async def update_profile(
    data: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.flush()
    return user


@router.get("/vehicles", response_model=list[VehicleResponse])
async def list_vehicles(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vehicle).where(Vehicle.user_id == user.id, Vehicle.deleted_at.is_(None)))
    return list(result.scalars().all())


@router.post("/vehicles", response_model=VehicleResponse)
async def create_vehicle(
    data: VehicleCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    vehicle = Vehicle(user_id=user.id, **data.model_dump())
    db.add(vehicle)
    await db.flush()
    return vehicle


@router.patch("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: UUID,
    data: VehicleCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.user_id == user.id, Vehicle.deleted_at.is_(None))
    )
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)
    await db.flush()
    return vehicle


@router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.user_id == user.id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    vehicle.deleted_at = datetime.now(UTC)
    return {"message": "Vehicle deleted"}


@router.get("/emergency-contacts", response_model=list[EmergencyContactResponse])
async def list_contacts(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(EmergencyContact).where(EmergencyContact.user_id == user.id, EmergencyContact.deleted_at.is_(None))
    )
    return list(result.scalars().all())


@router.post("/emergency-contacts", response_model=EmergencyContactResponse)
async def create_contact(
    data: EmergencyContactCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    contact = EmergencyContact(user_id=user.id, **data.model_dump())
    db.add(contact)
    await db.flush()
    return contact


@router.patch("/emergency-contacts/{contact_id}", response_model=EmergencyContactResponse)
async def update_contact(
    contact_id: UUID,
    data: EmergencyContactCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EmergencyContact).where(EmergencyContact.id == contact_id, EmergencyContact.user_id == user.id)
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    for field, value in data.model_dump().items():
        setattr(contact, field, value)
    await db.flush()
    return contact


@router.delete("/emergency-contacts/{contact_id}")
async def delete_contact(
    contact_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import UTC, datetime

    result = await db.execute(
        select(EmergencyContact).where(EmergencyContact.id == contact_id, EmergencyContact.user_id == user.id)
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    contact.deleted_at = datetime.now(UTC)
    return {"message": "Contact deleted"}
