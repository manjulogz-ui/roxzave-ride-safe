from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.sos import EmergencyEvent, SOSRequest
from app.models.system import Notification
from app.models.trip import CrashEvent
from app.models.user import User
from app.schemas.navigation import CrashEventCreate

router = APIRouter(prefix="/crash", tags=["Crash Detection"])


@router.post("/event")
async def create_crash_event(
    data: CrashEventCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    event = CrashEvent(
        user_id=user.id,
        severity=data.severity,
        lat=data.lat,
        lng=data.lng,
        acceleration_g=data.acceleration_g,
        golden_hour_triggered=data.trigger_sos,
        details=data.details,
    )
    db.add(event)
    await db.flush()

    if data.trigger_sos:
        sos = SOSRequest(
            user_id=user.id,
            lat=data.lat,
            lng=data.lng,
            trigger_type="crash",
            status="active",
            golden_hour_active=True,
            details={"crash_id": str(event.id)},
        )
        db.add(sos)
        await db.flush()
        db.add(
            EmergencyEvent(
                user_id=user.id,
                sos_id=sos.id,
                event_type="crash_auto_sos",
                lat=data.lat,
                lng=data.lng,
                escalation_level=2,
                gps_shared=True,
            )
        )
        db.add(
            Notification(
                user_id=user.id,
                category="crash",
                title="Crash detected — SOS activated",
                body="Golden Hour emergency protocol started.",
                payload={"crash_id": str(event.id), "sos_id": str(sos.id)},
            )
        )

    return {"id": str(event.id), "severity": event.severity, "golden_hour_triggered": event.golden_hour_triggered}


@router.get("/history")
async def crash_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CrashEvent).where(CrashEvent.user_id == user.id).order_by(CrashEvent.created_at.desc()).limit(50)
    )
    return [
        {
            "id": str(e.id),
            "severity": e.severity,
            "acceleration_g": e.acceleration_g,
            "golden_hour_triggered": e.golden_hour_triggered,
            "created_at": e.created_at.isoformat(),
        }
        for e in result.scalars()
    ]


@router.get("/analytics")
async def crash_analytics(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(func.count(CrashEvent.id)).where(CrashEvent.user_id == user.id)
    )
    severe = await db.execute(
        select(func.count()).select_from(CrashEvent).where(
            CrashEvent.user_id == user.id, CrashEvent.severity.in_(["high", "critical"])
        )
    )
    return {
        "total_crashes": result.scalar() or 0,
        "severe_events": severe.scalar() or 0,
    }
