from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.safety import SafetyIncident, WomenSafetyEvent
from app.models.sos import GuardianTracking, VoiceEvidence
from app.models.system import Notification
from app.models.user import EmergencyContact, User

router = APIRouter(prefix="/women-safety", tags=["Women Safety"])


class IncidentTrigger(BaseModel):
    incident_type: str = "panic"
    lat: float | None = None
    lng: float | None = None
    record_audio: bool = False
    audio_url: str | None = None
    transcript: str | None = None


class GuardianLocation(BaseModel):
    lat: float
    lng: float
    speed_kmh: float | None = None
    heading: float | None = None


@router.post("/incident")
async def trigger_incident(
    data: IncidentTrigger,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    audio_id = None
    if data.record_audio and data.audio_url:
        voice = VoiceEvidence(
            user_id=user.id,
            audio_url=data.audio_url,
            transcript=data.transcript,
        )
        db.add(voice)
        await db.flush()
        audio_id = voice.id

    incident = SafetyIncident(
        user_id=user.id,
        incident_type=data.incident_type,
        lat=data.lat,
        lng=data.lng,
        audio_evidence_id=audio_id,
        details={"trigger": "shield"},
    )
    db.add(incident)
    db.add(
        WomenSafetyEvent(
            user_id=user.id,
            event_type=data.incident_type,
            lat=data.lat,
            lng=data.lng,
            status="active",
        )
    )

    contacts = await db.execute(
        select(EmergencyContact).where(EmergencyContact.user_id == user.id, EmergencyContact.is_guardian == True)  # noqa: E712
    )
    guardian_phones = [c.phone for c in contacts.scalars().all()]

    db.add(
        Notification(
            user_id=user.id,
            category="women_safety",
            title="Women Safety Shield activated",
            body=f"Location shared with {len(guardian_phones)} guardian(s).",
            payload={"incident_id": str(incident.id), "lat": data.lat, "lng": data.lng},
        )
    )
    await db.flush()
    return {"incident_id": str(incident.id), "guardians_notified": len(guardian_phones)}


@router.get("/incidents")
async def list_incidents(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SafetyIncident).where(SafetyIncident.user_id == user.id).order_by(SafetyIncident.created_at.desc()).limit(30)
    )
    return [
        {
            "id": str(i.id),
            "type": i.incident_type,
            "status": i.status,
            "created_at": i.created_at.isoformat(),
        }
        for i in result.scalars()
    ]


@router.post("/guardian/location")
async def post_guardian_location(
    data: GuardianLocation,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    track = GuardianTracking(
        user_id=user.id,
        lat=data.lat,
        lng=data.lng,
        speed_kmh=data.speed_kmh,
        heading=data.heading,
        recorded_at=datetime.now(UTC),
    )
    db.add(track)
    await db.flush()
    return {"status": "recorded", "id": str(track.id)}
