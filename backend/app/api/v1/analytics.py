from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.rewards import RewardEvent, UserPoints
from app.models.trip import DrivingScore, Trip
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/driver")
async def driver_analytics(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    trips = await db.execute(
        select(Trip).where(Trip.user_id == user.id, Trip.deleted_at.is_(None)).order_by(Trip.started_at.desc()).limit(50)
    )
    trip_list = list(trips.scalars())
    prev_score = user.safety_score
    trend = "+0"
    if len(trip_list) >= 2:
        diff = (trip_list[0].safety_score or user.safety_score) - (trip_list[1].safety_score or user.safety_score)
        trend = f"{diff:+d}" if diff else "+0"

    points = await db.execute(select(UserPoints).where(UserPoints.user_id == user.id))
    pts = points.scalar_one_or_none()

    return {
        "safety_score": user.safety_score,
        "total_trips": len(trip_list),
        "total_distance_km": round(sum(t.distance_km or 0 for t in trip_list), 2),
        "weekly_trend": trend,
        "reward_points": pts.total_points if pts else user.safety_score * 10,
        "active_alerts": 0,
    }


@router.get("/safety")
async def safety_analytics(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DrivingScore).where(DrivingScore.user_id == user.id).order_by(DrivingScore.created_at.desc()).limit(30)
    )
    score_list = list(result.scalars())
    return {
        "scores": [{"score": s.score, "date": s.created_at.isoformat()} for s in score_list],
        "harsh_braking_total": sum(s.harsh_braking for s in score_list),
        "speeding_total": sum(s.speeding_events for s in score_list),
    }


@router.get("/trends")
async def analytics_trends(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    trips = await db.execute(
        select(Trip).where(Trip.user_id == user.id, Trip.deleted_at.is_(None)).order_by(Trip.started_at.desc()).limit(30)
    )
    trip_list = list(trips.scalars())
    rewards = await db.execute(
        select(RewardEvent).where(RewardEvent.user_id == user.id).order_by(RewardEvent.created_at.desc()).limit(30)
    )
    reward_list = list(rewards.scalars())
    scores = await db.execute(
        select(DrivingScore).where(DrivingScore.user_id == user.id).order_by(DrivingScore.created_at.desc()).limit(30)
    )
    score_list = list(scores.scalars())

    return {
        "ride_trends": [
            {"date": t.started_at.isoformat() if t.started_at else None, "distance_km": t.distance_km, "score": t.safety_score}
            for t in trip_list
        ],
        "risk_trends": [{"date": s.created_at.isoformat(), "score": s.score} for s in score_list],
        "behavior_trends": {
            "harsh_braking": sum(s.harsh_braking for s in score_list),
            "speeding": sum(s.speeding_events for s in score_list),
        },
        "rewards_trends": [
            {"date": r.created_at.isoformat(), "points": r.points, "type": r.event_type} for r in reward_list
        ],
    }
