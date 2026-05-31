from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.community import CommunityComment, CommunityLike, CommunityPost
from app.models.user import User
from app.schemas.common import CommunityCommentCreate, CommunityPostCreate, CommunityPostResponse

router = APIRouter(prefix="/community", tags=["Community"])


def _post_response(post: CommunityPost, author_name: str | None = None) -> CommunityPostResponse:
    return CommunityPostResponse(
        id=post.id,
        community_name=post.community_name,
        category=post.category,
        title=post.title,
        body=post.body,
        verify_count=post.verify_count,
        dispute_count=post.dispute_count,
        created_at=post.created_at,
        author_name=author_name,
    )


@router.get("/posts", response_model=list[CommunityPostResponse])
async def list_posts(
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(CommunityPost).where(CommunityPost.deleted_at.is_(None)).order_by(CommunityPost.created_at.desc())
    if category and category != "all":
        q = q.where(CommunityPost.category == category)
    result = await db.execute(q.limit(50))
    posts = result.scalars().all()
    responses = []
    for post in posts:
        user_result = await db.execute(select(User).where(User.id == post.user_id))
        author = user_result.scalar_one_or_none()
        responses.append(_post_response(post, author.full_name if author else None))
    return responses


@router.get("/posts/{post_id}", response_model=CommunityPostResponse)
async def get_post(post_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    user_result = await db.execute(select(User).where(User.id == post.user_id))
    author = user_result.scalar_one_or_none()
    return _post_response(post, author.full_name if author else None)


@router.post("/posts", response_model=CommunityPostResponse)
async def create_post(
    data: CommunityPostCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = CommunityPost(user_id=user.id, **data.model_dump())
    db.add(post)
    await db.flush()
    return _post_response(post, user.full_name)


@router.post("/posts/{post_id}/verify")
async def verify_post(
    post_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    existing = await db.execute(
        select(CommunityLike).where(CommunityLike.post_id == post_id, CommunityLike.user_id == user.id)
    )
    if existing.scalar_one_or_none():
        return {"message": "Already verified"}
    db.add(CommunityLike(post_id=post_id, user_id=user.id, reaction="verify"))
    post.verify_count += 1
    return {"message": "Verified", "verify_count": post.verify_count}


@router.post("/posts/{post_id}/comments")
async def add_comment(
    post_id: UUID,
    data: CommunityCommentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    comment = CommunityComment(post_id=post_id, user_id=user.id, body=data.body)
    db.add(comment)
    return {"message": "Comment added"}


@router.get("/posts/{post_id}/comments")
async def list_comments(post_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CommunityComment, User.full_name)
        .join(User, User.id == CommunityComment.user_id)
        .where(CommunityComment.post_id == post_id, CommunityComment.deleted_at.is_(None))
    )
    return [
        {"id": str(c.id), "body": c.body, "author": name, "created_at": c.created_at.isoformat()}
        for c, name in result.all()
    ]
