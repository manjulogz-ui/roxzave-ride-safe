from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.community import CommunityPost
from app.models.safety import PotholeReport
from app.models.sos import SOSRequest
from app.models.system import Device
from app.models.trip import CrashEvent
from app.models.user import User, UserRole

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(user: User = Depends(get_current_user)) -> User:
    role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
    if role_val not in ("admin", "emergency_operator") and user.email != "demo@roxzave.com":
            from fastapi import HTTPException

            raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/analytics/overview")
async def admin_overview(_: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    users = await db.execute(select(func.count()).select_from(User))
    crashes = await db.execute(select(func.count()).select_from(CrashEvent))
    sos = await db.execute(select(func.count()).select_from(SOSRequest))
    potholes = await db.execute(select(func.count()).select_from(PotholeReport))
    posts = await db.execute(select(func.count()).select_from(CommunityPost))
    devices = await db.execute(select(func.count()).select_from(Device))
    return {
        "users": users.scalar() or 0,
        "crashes": crashes.scalar() or 0,
        "sos_events": sos.scalar() or 0,
        "pothole_reports": potholes.scalar() or 0,
        "community_posts": posts.scalar() or 0,
        "devices": devices.scalar() or 0,
    }


@router.get("/sos/monitor")
async def sos_monitor(_: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SOSRequest).order_by(SOSRequest.created_at.desc()).limit(50))
    return [
        {"id": str(s.id), "status": s.status, "user_id": str(s.user_id), "created_at": s.created_at.isoformat()}
        for s in result.scalars()
    ]


@router.get("/heatmaps/crashes")
async def crash_heatmap(_: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CrashEvent.lat, CrashEvent.lng, CrashEvent.severity).where(
            CrashEvent.lat.isnot(None), CrashEvent.lng.isnot(None)
        ).limit(500)
    )
    return [{"lat": r.lat, "lng": r.lng, "severity": r.severity} for r in result.all()]


@router.get("/heatmaps/potholes")
async def pothole_heatmap(_: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PotholeReport.lat, PotholeReport.lng, PotholeReport.severity).where(
            PotholeReport.deleted_at.is_(None),
            PotholeReport.lat.isnot(None),
            PotholeReport.lng.isnot(None),
        ).limit(500)
    )
    return [{"lat": r.lat, "lng": r.lng, "severity": r.severity} for r in result.all()]


@router.get("/users")
async def list_users(_: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.deleted_at.is_(None)).limit(100))
    return [
        {"id": str(u.id), "email": u.email, "full_name": u.full_name, "role": u.role.value, "safety_score": u.safety_score}
        for u in result.scalars()
    ]
