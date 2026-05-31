import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, String
from sqlalchemy.dialects.postgresql import UUID
from app.models.types import JsonType
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import TimestampMixin


class Hospital(Base, TimestampMixin):
    __tablename__ = "hospitals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    lat: Mapped[float] = mapped_column(Float, index=True)
    lng: Mapped[float] = mapped_column(Float, index=True)
    phone: Mapped[str | None] = mapped_column(String(20))
    has_trauma_center: Mapped[bool] = mapped_column(default=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JsonType, default=dict)


class BloodBank(Base, TimestampMixin):
    __tablename__ = "blood_banks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    lat: Mapped[float] = mapped_column(Float, index=True)
    lng: Mapped[float] = mapped_column(Float, index=True)
    phone: Mapped[str | None] = mapped_column(String(20))
    blood_types: Mapped[dict] = mapped_column(JsonType, default=dict)


class PetrolStation(Base, TimestampMixin):
    __tablename__ = "petrol_stations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    brand: Mapped[str | None] = mapped_column(String(100))
    lat: Mapped[float] = mapped_column(Float, index=True)
    lng: Mapped[float] = mapped_column(Float, index=True)
    rating: Mapped[float | None] = mapped_column(Float)
    has_ev_charging: Mapped[bool] = mapped_column(default=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JsonType, default=dict)


class FuelPrice(Base, TimestampMixin):
    __tablename__ = "fuel_prices"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    station_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    fuel_type: Mapped[str] = mapped_column(String(30))
    price_per_liter: Mapped[float] = mapped_column(Float)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class TollPlaza(Base, TimestampMixin):
    __tablename__ = "toll_plazas"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    lat: Mapped[float] = mapped_column(Float, index=True)
    lng: Mapped[float] = mapped_column(Float, index=True)
    fee_inr: Mapped[float | None] = mapped_column(Float)
    highway: Mapped[str | None] = mapped_column(String(100))


class PoliceStation(Base, TimestampMixin):
    __tablename__ = "police_stations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    lat: Mapped[float] = mapped_column(Float, index=True)
    lng: Mapped[float] = mapped_column(Float, index=True)
    phone: Mapped[str | None] = mapped_column(String(20))
