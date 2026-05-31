import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.types import JsonType
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import SoftDeleteMixin, TimestampMixin


class Trip(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "trips"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    vehicle_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    origin_lat: Mapped[float | None] = mapped_column(Float)
    origin_lng: Mapped[float | None] = mapped_column(Float)
    dest_lat: Mapped[float | None] = mapped_column(Float)
    dest_lng: Mapped[float | None] = mapped_column(Float)
    origin_address: Mapped[str | None] = mapped_column(String(512))
    dest_address: Mapped[str | None] = mapped_column(String(512))
    distance_km: Mapped[float | None] = mapped_column(Float)
    duration_minutes: Mapped[int | None] = mapped_column(Integer)
    safety_score: Mapped[int | None] = mapped_column(Integer)
    route_type: Mapped[str | None] = mapped_column(String(20))
    metadata_: Mapped[dict] = mapped_column("metadata", JsonType, default=dict)


class TripEvent(Base, TimestampMixin):
    __tablename__ = "trip_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    event_type: Mapped[str] = mapped_column(String(50), index=True)
    lat: Mapped[float | None] = mapped_column(Float)
    lng: Mapped[float | None] = mapped_column(Float)
    payload: Mapped[dict] = mapped_column(JsonType, default=dict)


class CrashEvent(Base, TimestampMixin):
    __tablename__ = "crash_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    trip_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=True)
    device_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("devices.id"), nullable=True)
    severity: Mapped[str] = mapped_column(String(20), default="high")
    lat: Mapped[float | None] = mapped_column(Float)
    lng: Mapped[float | None] = mapped_column(Float)
    acceleration_g: Mapped[float | None] = mapped_column(Float)
    golden_hour_triggered: Mapped[bool] = mapped_column(default=False)
    details: Mapped[dict] = mapped_column(JsonType, default=dict)


class DrivingScore(Base, TimestampMixin):
    __tablename__ = "driving_scores"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    trip_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=True)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    harsh_braking: Mapped[int] = mapped_column(Integer, default=0)
    speeding_events: Mapped[int] = mapped_column(Integer, default=0)
    drowsiness_events: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str | None] = mapped_column(Text)
