from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.sos import EmergencyEvent, SOSRequest
from app.models.system import Notification
from app.models.user import EmergencyContact, User
from app.schemas.common import SOSCreate, SOSResponse

router = APIRouter(prefix="/sos", tags=["SOS Emergency"])

EMERGENCY_NUMBERS = [
    {"name": "Ambulance", "phone": "108", "type": "ambulance"},
    {"name": "Police", "phone": "100", "type": "police"},
    {"name": "Fire", "phone": "101", "type": "fire"},
    {"name": "Women Helpline", "phone": "1091", "type": "women"},
    {"name": "Highway Patrol", "phone": "1033", "type": "highway"},
]


@router.get("/emergency-numbers")
async def emergency_numbers():
    return EMERGENCY_NUMBERS


@router.post("/activate", response_model=SOSResponse)
async def activate_sos(
    data: SOSCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await trigger_sos(data, user, db)


@router.post("/escalate")
async def escalate_sos(
    sos_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from uuid import UUID

    result = await db.execute(select(SOSRequest).where(SOSRequest.id == UUID(sos_id), SOSRequest.user_id == user.id))
    sos = result.scalar_one_or_none()
    if not sos:
        return {"error": "SOS not found"}
    level = (sos.details or {}).get("escalation_level", 1) + 1
    sos.details = {**(sos.details or {}), "escalation_level": level}
    db.add(
        EmergencyEvent(
            user_id=user.id,
            sos_id=sos.id,
            event_type="escalation",
            lat=sos.lat,
            lng=sos.lng,
            escalation_level=level,
            sms_sent=True,
            gps_shared=True,
            details={"level": level},
        )
    )
    contacts = await db.execute(
        select(EmergencyContact).where(EmergencyContact.user_id == user.id, EmergencyContact.deleted_at.is_(None))
    )
    phones = [c.phone for c in contacts.scalars().all()]
    return {"sos_id": str(sos.id), "escalation_level": level, "sms_targets": phones}


@router.post("", response_model=SOSResponse)
async def trigger_sos(
    data: SOSCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    sos = SOSRequest(
        user_id=user.id,
        lat=data.lat,
        lng=data.lng,
        trigger_type=data.trigger_type,
        status="active",
        golden_hour_active=True,
        details={"user_name": user.full_name},
    )
    db.add(sos)
    await db.flush()

    db.add(
        EmergencyEvent(
            user_id=user.id,
            sos_id=sos.id,
            event_type="sos_activate",
            lat=data.lat,
            lng=data.lng,
            escalation_level=1,
            gps_shared=True,
            details={"trigger_type": data.trigger_type},
        )
    )

    db.add(
        Notification(
            user_id=user.id,
            category="sos",
            title="SOS Activated",
            body="Emergency alert sent to guardians and emergency network.",
            payload={"sos_id": str(sos.id)},
        )
    )

    contacts = await db.execute(
        select(EmergencyContact).where(
            EmergencyContact.user_id == user.id,
            EmergencyContact.deleted_at.is_(None),
        )
    )
    guardian_phones = [c.phone for c in contacts.scalars().all() if c.is_guardian]

    return SOSResponse(
        id=sos.id,
        status=sos.status,
        lat=sos.lat,
        lng=sos.lng,
        trigger_type=sos.trigger_type,
        golden_hour_active=sos.golden_hour_active,
        created_at=sos.created_at,
    )


@router.get("/history", response_model=list[SOSResponse])
async def sos_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SOSRequest).where(SOSRequest.user_id == user.id).order_by(SOSRequest.created_at.desc()).limit(20)
    )
    return list(result.scalars().all())


@router.post("/{sos_id}/resolve")
async def resolve_sos(
    sos_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from uuid import UUID

    result = await db.execute(select(SOSRequest).where(SOSRequest.id == UUID(sos_id), SOSRequest.user_id == user.id))
    sos = result.scalar_one_or_none()
    if sos:
        sos.status = "resolved"
        sos.resolved_at = datetime.now(UTC)
    return {"message": "SOS resolved"}
