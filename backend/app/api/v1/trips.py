from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.rewards import RewardEvent, UserPoints
from app.models.trip import DrivingScore, Trip, TripEvent
from app.models.user import User

router = APIRouter(prefix="/trips", tags=["Trips"])


class RideStart(BaseModel):
    origin_lat: float | None = None
    origin_lng: float | None = None
    origin_address: str | None = None
    vehicle_id: str | None = None


class RideEventPayload(BaseModel):
    event_type: str
    lat: float | None = None
    lng: float | None = None
    payload: dict = Field(default_factory=dict)


class RideEnd(BaseModel):
    dest_lat: float | None = None
    dest_lng: float | None = None
    dest_address: str | None = None
    distance_km: float = Field(ge=0)
    duration_minutes: int = Field(ge=0)
    harsh_braking: int = 0
    speeding_events: int = 0


def _trip_json(t: Trip) -> dict:
    return {
        "id": str(t.id),
        "origin_address": t.origin_address,
        "dest_address": t.dest_address,
        "distance_km": t.distance_km,
        "duration_minutes": t.duration_minutes,
        "safety_score": t.safety_score,
        "route_type": t.route_type,
        "started_at": t.started_at.isoformat() if t.started_at else None,
        "ended_at": t.ended_at.isoformat() if t.ended_at else None,
        "status": "active" if t.ended_at is None else "completed",
    }


@router.get("")
async def list_trips(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Trip).where(Trip.user_id == user.id, Trip.deleted_at.is_(None)).order_by(Trip.started_at.desc()).limit(50)
    )
    return [_trip_json(t) for t in result.scalars()]


@router.get("/active")
async def active_ride(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Trip).where(Trip.user_id == user.id, Trip.ended_at.is_(None), Trip.deleted_at.is_(None)).limit(1)
    )
    trip = result.scalar_one_or_none()
    return _trip_json(trip) if trip else None


@router.post("/start")
async def start_ride(data: RideStart, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(Trip).where(Trip.user_id == user.id, Trip.ended_at.is_(None), Trip.deleted_at.is_(None))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Active ride already in progress")

    trip = Trip(
        user_id=user.id,
        started_at=datetime.now(UTC),
        origin_lat=data.origin_lat,
        origin_lng=data.origin_lng,
        origin_address=data.origin_address or "Current location",
        route_type="active",
    )
    db.add(trip)
    await db.flush()
    db.add(TripEvent(trip_id=trip.id, event_type="ride_started", lat=data.origin_lat, lng=data.origin_lng))
    return _trip_json(trip)


@router.post("/{trip_id}/pause")
async def pause_ride(trip_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from uuid import UUID

    trip = await _get_active_trip(db, user.id, UUID(trip_id))
    db.add(TripEvent(trip_id=trip.id, event_type="ride_paused"))
    return {"status": "paused", "trip_id": str(trip.id)}


@router.post("/{trip_id}/resume")
async def resume_ride(trip_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from uuid import UUID

    trip = await _get_active_trip(db, user.id, UUID(trip_id))
    db.add(TripEvent(trip_id=trip.id, event_type="ride_resumed"))
    return {"status": "active", "trip_id": str(trip.id)}


@router.post("/{trip_id}/event")
async def log_ride_event(
    trip_id: str,
    data: RideEventPayload,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from uuid import UUID

    trip = await _get_active_trip(db, user.id, UUID(trip_id))
    db.add(TripEvent(trip_id=trip.id, event_type=data.event_type, lat=data.lat, lng=data.lng, payload=data.payload))
    return {"logged": data.event_type}


@router.post("/{trip_id}/end")
async def end_ride(
    trip_id: str,
    data: RideEnd,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from uuid import UUID

    trip = await _get_active_trip(db, user.id, UUID(trip_id))
    trip.ended_at = datetime.now(UTC)
    trip.dest_lat = data.dest_lat
    trip.dest_lng = data.dest_lng
    trip.dest_address = data.dest_address or "Destination"
    trip.distance_km = data.distance_km
    trip.duration_minutes = data.duration_minutes

    score = max(40, min(99, user.safety_score - data.harsh_braking * 2 - data.speeding_events * 3))
    trip.safety_score = score
    user.safety_score = int((user.safety_score * 0.7) + (score * 0.3))

    db.add(
        DrivingScore(
            user_id=user.id,
            trip_id=trip.id,
            score=score,
            harsh_braking=data.harsh_braking,
            speeding_events=data.speeding_events,
        )
    )
    db.add(TripEvent(trip_id=trip.id, event_type="ride_ended", payload=data.model_dump()))

    ride_points = max(10, min(100, int(data.distance_km * 5) + score // 2))
    pts_result = await db.execute(select(UserPoints).where(UserPoints.user_id == user.id))
    pts = pts_result.scalar_one_or_none()
    if not pts:
        pts = UserPoints(user_id=user.id, total_points=0, level=1)
        db.add(pts)
    pts.total_points += ride_points
    pts.level = max(1, pts.total_points // 200 + 1)
    db.add(
        RewardEvent(
            user_id=user.id,
            event_type="safe_ride",
            points=ride_points,
            description=f"Completed {data.distance_km:.1f} km ride",
        )
    )

    await db.flush()
    return {**_trip_json(trip), "points_earned": ride_points}


async def _get_active_trip(db: AsyncSession, user_id, trip_id):
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == user_id, Trip.ended_at.is_(None))
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Active ride not found")
    return trip


@router.get("/driving-score")
async def driving_score(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DrivingScore).where(DrivingScore.user_id == user.id).order_by(DrivingScore.created_at.desc()).limit(30)
    )
    scores = list(result.scalars())
    latest = scores[0] if scores else None
    return {
        "current_score": user.safety_score,
        "latest_trip_score": latest.score if latest else user.safety_score,
        "harsh_braking": latest.harsh_braking if latest else 0,
        "speeding_events": latest.speeding_events if latest else 0,
        "drowsiness_events": latest.drowsiness_events if latest else 0,
        "history": [{"score": s.score, "date": s.created_at.isoformat()} for s in scores],
        "daily": user.safety_score,
        "weekly_avg": int(sum(s.score for s in scores[:7]) / max(1, len(scores[:7]))),
        "monthly_avg": int(sum(s.score for s in scores) / max(1, len(scores))),
        "lifetime": user.safety_score,
    }
