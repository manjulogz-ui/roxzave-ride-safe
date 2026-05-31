from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.safety import DrowsinessEvent
from app.models.system import Device, SensorLog
from app.models.user import User
from app.schemas.navigation import DrowsinessEventCreate

router = APIRouter(prefix="/drowsiness", tags=["Drowsiness"])


@router.post("/event")
async def create_drowsiness_event(
    data: DrowsinessEventCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    device_uuid = None
    if data.device_id:
        result = await db.execute(select(Device).where(Device.device_id == data.device_id))
        dev = result.scalar_one_or_none()
        if dev:
            device_uuid = dev.id
            dev.user_id = user.id

    event = DrowsinessEvent(
        user_id=user.id,
        device_id=device_uuid,
        risk_score=data.risk_score,
        alert_level=data.alert_level,
        lat=data.lat,
        lng=data.lng,
        sensor_payload=data.sensor_payload,
    )
    db.add(event)
    db.add(
        SensorLog(
            user_id=user.id,
            device_id=device_uuid,
            sensor_type="drowsiness",
            payload={"risk_score": data.risk_score, **data.sensor_payload},
            lat=data.lat,
            lng=data.lng,
        )
    )
    await db.flush()
    return {"id": str(event.id), "alert_level": event.alert_level, "risk_score": event.risk_score}


@router.get("/history")
async def drowsiness_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DrowsinessEvent).where(DrowsinessEvent.user_id == user.id).order_by(DrowsinessEvent.created_at.desc()).limit(50)
    )
    return [
        {
            "id": str(e.id),
            "risk_score": e.risk_score,
            "alert_level": e.alert_level,
            "lat": e.lat,
            "lng": e.lng,
            "created_at": e.created_at.isoformat(),
        }
        for e in result.scalars()
    ]


@router.get("/analytics")
async def drowsiness_analytics(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            func.count(DrowsinessEvent.id),
            func.avg(DrowsinessEvent.risk_score),
            func.max(DrowsinessEvent.risk_score),
        ).where(DrowsinessEvent.user_id == user.id)
    )
    count, avg_risk, max_risk = result.one()
    high = await db.execute(
        select(func.count()).select_from(DrowsinessEvent).where(
            DrowsinessEvent.user_id == user.id, DrowsinessEvent.alert_level.in_(["high", "critical"])
        )
    )
    return {
        "total_events": count or 0,
        "avg_risk_score": round(float(avg_risk or 0), 2),
        "max_risk_score": round(float(max_risk or 0), 2),
        "high_alerts": high.scalar() or 0,
    }
