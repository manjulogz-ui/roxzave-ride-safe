import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.types import JsonType
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import SoftDeleteMixin, TimestampMixin


class CommunityPost(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "community_posts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    community_name: Mapped[str] = mapped_column(String(255), index=True)
    category: Mapped[str] = mapped_column(String(50), index=True, default="hazards")
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    image_urls: Mapped[list] = mapped_column(JsonType, default=list)
    verify_count: Mapped[int] = mapped_column(Integer, default=0)
    dispute_count: Mapped[int] = mapped_column(Integer, default=0)
    lat: Mapped[float | None] = mapped_column()
    lng: Mapped[float | None] = mapped_column()
    metadata_: Mapped[dict] = mapped_column("metadata", JsonType, default=dict)


class CommunityComment(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "community_comments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)


class CommunityLike(Base, TimestampMixin):
    __tablename__ = "community_likes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    reaction: Mapped[str] = mapped_column(String(20), default="verify")
