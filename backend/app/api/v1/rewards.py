from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.rewards import Badge, RewardEvent, UserBadge, UserPoints
from app.models.user import User

router = APIRouter(prefix="/rewards", tags=["Rewards"])

DEFAULT_BADGES = [
    ("safe-starter", "Safe Starter", 100),
    ("community-helper", "Community Helper", 250),
    ("hazard-hunter", "Hazard Hunter", 400),
    ("elite-driver", "Elite Driver", 700),
]


async def ensure_badges(db: AsyncSession) -> None:
    for slug, name, pts in DEFAULT_BADGES:
        existing = await db.execute(select(Badge).where(Badge.slug == slug))
        if not existing.scalar_one_or_none():
            db.add(Badge(slug=slug, name=name, points_required=pts, description=f"Unlock at {pts} points"))


async def get_or_create_points(user_id: UUID, db: AsyncSession) -> UserPoints:
    result = await db.execute(select(UserPoints).where(UserPoints.user_id == user_id))
    row = result.scalar_one_or_none()
    if not row:
        row = UserPoints(user_id=user_id, total_points=0, level=1)
        db.add(row)
        await db.flush()
    return row


@router.get("/summary")
async def rewards_summary(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await ensure_badges(db)
    points = await get_or_create_points(user.id, db)
    if points.total_points == 0:
        points.total_points = user.safety_score * 10
        points.level = max(1, points.total_points // 200)
        await db.flush()

    badges = await db.execute(select(Badge))
    all_badges = list(badges.scalars())
    unlocked = await db.execute(select(UserBadge.badge_id).where(UserBadge.user_id == user.id))
    unlocked_ids = {str(b) for b in unlocked.scalars()}

    badge_list = []
    for b in all_badges:
        is_unlocked = str(b.id) in unlocked_ids or points.total_points >= b.points_required
        if is_unlocked and str(b.id) not in unlocked_ids:
            db.add(UserBadge(user_id=user.id, badge_id=b.id, unlocked_at=datetime.now(UTC)))
        badge_list.append({
            "slug": b.slug,
            "name": b.name,
            "points_required": b.points_required,
            "unlocked": is_unlocked,
        })
    await db.flush()

    events = await db.execute(
        select(RewardEvent).where(RewardEvent.user_id == user.id).order_by(RewardEvent.created_at.desc()).limit(20)
    )
    return {
        "total_points": points.total_points,
        "level": points.level,
        "badges": badge_list,
        "recent_events": [
            {"type": e.event_type, "points": e.points, "description": e.description, "at": e.created_at.isoformat()}
            for e in events.scalars()
        ],
    }


class AwardPoints(BaseModel):
    event_type: str
    points: int = Field(ge=1, le=500)
    description: str | None = None


@router.post("/award")
async def award_points(
    data: AwardPoints,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    points = await get_or_create_points(user.id, db)
    points.total_points += data.points
    points.level = max(1, points.total_points // 200 + 1)
    db.add(
        RewardEvent(
            user_id=user.id,
            event_type=data.event_type,
            points=data.points,
            description=data.description,
        )
    )
    await db.flush()
    return {"total_points": points.total_points, "level": points.level}


@router.get("/leaderboard")
async def leaderboard(
    scope: str = "global",
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User.full_name, User.email, User.safety_score, UserPoints.total_points)
        .join(UserPoints, UserPoints.user_id == User.id, isouter=True)
        .where(User.deleted_at.is_(None), User.is_guest == False)  # noqa: E712
        .order_by(func.coalesce(UserPoints.total_points, User.safety_score * 10).desc())
        .limit(50)
    )
    rows = []
    for rank, r in enumerate(result.all(), start=1):
        pts = r[3] if r[3] is not None else r[2] * 10
        rows.append({
            "rank": rank,
            "full_name": r[0],
            "email": r[1],
            "safety_score": r[2],
            "total_points": pts,
            "scope": scope,
        })
    return rows
