"""Safety modules API — drowsiness, crash, pothole, golden hour, trauma."""
from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.safety import PotholeReport, WomenSafetyEvent
from app.models.sos import SOSRequest
from app.models.trip import CrashEvent, DrivingScore
from app.models.user import User

router = APIRouter(prefix="/safety", tags=["Safety Modules"])


@router.get("/drowsiness/events")
async def drowsiness_events(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    scores = await db.execute(
        select(DrivingScore).where(DrivingScore.user_id == user.id).order_by(DrivingScore.created_at.desc()).limit(20)
    )
    return [
        {
            "id": str(s.id),
            "drowsiness_events": s.drowsiness_events,
            "score": s.score,
            "created_at": s.created_at.isoformat(),
            "risk": "high" if s.drowsiness_events > 2 else "low",
        }
        for s in scores.scalars()
    ]


@router.get("/crash/events")
async def crash_events(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CrashEvent).where(CrashEvent.user_id == user.id).order_by(CrashEvent.created_at.desc()).limit(30)
    )
    return [
        {
            "id": str(e.id),
            "severity": e.severity,
            "acceleration_g": e.acceleration_g,
            "golden_hour": e.golden_hour_triggered,
            "lat": e.lat,
            "lng": e.lng,
            "created_at": e.created_at.isoformat(),
        }
        for e in result.scalars()
    ]


class PotholeReportCreate(BaseModel):
    lat: float
    lng: float
    severity: int = Field(default=2, ge=1, le=5)
    description: str | None = None


@router.get("/pothole/reports")
async def pothole_reports(
    lat: float = Query(12.97),
    lng: float = Query(77.59),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PotholeReport).where(PotholeReport.deleted_at.is_(None)).limit(50))
    return [
        {"id": str(p.id), "lat": p.lat, "lng": p.lng, "severity": p.severity, "verified_count": p.verified_count}
        for p in result.scalars()
    ]


@router.post("/pothole/reports")
async def create_pothole_report(
    data: PotholeReportCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = PotholeReport(
        user_id=user.id,
        lat=data.lat,
        lng=data.lng,
        severity=data.severity,
        description=data.description,
    )
    db.add(report)
    await db.flush()
    return {"id": str(report.id), "lat": report.lat, "lng": report.lng, "severity": report.severity}


@router.get("/golden-hour/status")
async def golden_hour_status(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SOSRequest)
        .where(SOSRequest.user_id == user.id, SOSRequest.status == "active")
        .order_by(SOSRequest.created_at.desc())
        .limit(1)
    )
    sos = result.scalar_one_or_none()
    return {
        "active": sos is not None,
        "sos_id": str(sos.id) if sos else None,
        "golden_hour_active": sos.golden_hour_active if sos else False,
    }


@router.get("/trauma/guidance")
async def trauma_guidance():
    return {
        "steps": [
            "Ensure scene safety — turn on hazards.",
            "Call 108 / emergency services immediately.",
            "Do not move victim unless immediate danger.",
            "Control severe bleeding with direct pressure.",
            "Monitor breathing; begin CPR if not breathing.",
            "Share GPS with Roxzave Golden Hour SOS.",
        ],
        "languages": ["en", "ta", "hi", "te", "kn"],
    }


@router.get("/women/events")
async def women_safety_events(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WomenSafetyEvent).where(WomenSafetyEvent.user_id == user.id).order_by(WomenSafetyEvent.created_at.desc())
    )
    return [{"id": str(e.id), "type": e.event_type, "status": e.status} for e in result.scalars()]
