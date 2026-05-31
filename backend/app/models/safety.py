import uuid

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.types import JsonType
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import SoftDeleteMixin, TimestampMixin


class PotholeReport(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "pothole_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    lat: Mapped[float] = mapped_column(Float, index=True)
    lng: Mapped[float] = mapped_column(Float, index=True)
    severity: Mapped[int] = mapped_column(Integer, default=1)
    description: Mapped[str | None] = mapped_column(Text)
    verified_count: Mapped[int] = mapped_column(Integer, default=0)
    image_url: Mapped[str | None] = mapped_column(String(512))


class CrimeZone(Base, TimestampMixin):
    __tablename__ = "crime_zones"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))
    lat: Mapped[float] = mapped_column(Float, index=True)
    lng: Mapped[float] = mapped_column(Float, index=True)
    radius_m: Mapped[float] = mapped_column(Float, default=500)
    risk_level: Mapped[str] = mapped_column(String(20), default="medium")
    metadata_: Mapped[dict] = mapped_column("metadata", JsonType, default=dict)


class SchoolZone(Base, TimestampMixin):
    __tablename__ = "school_zones"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))
    lat: Mapped[float] = mapped_column(Float, index=True)
    lng: Mapped[float] = mapped_column(Float, index=True)
    radius_m: Mapped[float] = mapped_column(Float, default=300)
    speed_limit_kmh: Mapped[int] = mapped_column(Integer, default=25)


class RoadQualityReport(Base, TimestampMixin):
    __tablename__ = "road_quality_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    ai_score: Mapped[float] = mapped_column(Float)
    surface_type: Mapped[str | None] = mapped_column(String(50))
    details: Mapped[dict] = mapped_column(JsonType, default=dict)


class RouteSafetyScore(Base, TimestampMixin):
    __tablename__ = "route_safety_scores"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    origin_lat: Mapped[float] = mapped_column(Float)
    origin_lng: Mapped[float] = mapped_column(Float)
    dest_lat: Mapped[float] = mapped_column(Float)
    dest_lng: Mapped[float] = mapped_column(Float)
    route_type: Mapped[str] = mapped_column(String(20), index=True)
    safety_score: Mapped[float] = mapped_column(Float)
    polyline: Mapped[str | None] = mapped_column(Text)
    factors: Mapped[dict] = mapped_column(JsonType, default=dict)


class DrowsinessEvent(Base, TimestampMixin):
    __tablename__ = "drowsiness_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    device_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("devices.id"), nullable=True)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, index=True)
    alert_level: Mapped[str] = mapped_column(String(20), default="low")
    lat: Mapped[float | None] = mapped_column(Float)
    lng: Mapped[float | None] = mapped_column(Float)
    sensor_payload: Mapped[dict] = mapped_column(JsonType, default=dict)


class WeatherSnapshot(Base, TimestampMixin):
    __tablename__ = "weather_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lat: Mapped[float] = mapped_column(Float, index=True)
    lng: Mapped[float] = mapped_column(Float, index=True)
    condition: Mapped[str] = mapped_column(String(50), default="clear")
    temperature_c: Mapped[float | None] = mapped_column(Float)
    precipitation_mm: Mapped[float | None] = mapped_column(Float)
    wind_kmh: Mapped[float | None] = mapped_column(Float)
    risk_factor: Mapped[float] = mapped_column(Float, default=0.0)


class SafetyIncident(Base, TimestampMixin):
    __tablename__ = "safety_incidents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    incident_type: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(20), default="active")
    lat: Mapped[float | None] = mapped_column(Float)
    lng: Mapped[float | None] = mapped_column(Float)
    audio_evidence_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("voice_evidence.id"), nullable=True)
    details: Mapped[dict] = mapped_column(JsonType, default=dict)


class WomenSafetyEvent(Base, TimestampMixin):
    __tablename__ = "women_safety_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    event_type: Mapped[str] = mapped_column(String(50))
    lat: Mapped[float | None] = mapped_column(Float)
    lng: Mapped[float | None] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="active")
    details: Mapped[dict] = mapped_column(JsonType, default=dict)
