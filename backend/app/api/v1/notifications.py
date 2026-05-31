from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.system import Notification
from app.models.user import User
from app.schemas.common import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    category: str | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Notification).where(Notification.user_id == user.id).order_by(Notification.created_at.desc())
    if category:
        q = q.where(Notification.category == category)
    result = await db.execute(q.limit(100))
    return list(result.scalars().all())


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id, Notification.user_id == user.id)
    )
    n = result.scalar_one_or_none()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.is_read = True
    return {"message": "Marked as read"}


@router.post("/read-all")
async def mark_all_read(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(update(Notification).where(Notification.user_id == user.id).values(is_read=True))
    return {"message": "All marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id, Notification.user_id == user.id)
    )
    n = result.scalar_one_or_none()
    if n:
        await db.delete(n)
    return {"message": "Deleted"}
