import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from app.models.types import JsonType
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import SoftDeleteMixin, TimestampMixin


class UserRole(str, enum.Enum):
    USER = "user"
    GUARDIAN = "guardian"
    ADMIN = "admin"
    EMERGENCY_OPERATOR = "emergency_operator"


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mobile: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    profile_photo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, values_callable=lambda x: [e.value for e in x], native_enum=False),
        default=UserRole.USER,
        nullable=False,
    )
    is_guest: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    safety_score: Mapped[int] = mapped_column(default=85)
    preferences: Mapped[dict] = mapped_column(JsonType, default=dict)
    blood_group: Mapped[str | None] = mapped_column(String(10), nullable=True)
    allergies: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    vehicles: Mapped[list["Vehicle"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    emergency_contacts: Mapped[list["EmergencyContact"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Vehicle(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "vehicles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    make: Mapped[str | None] = mapped_column(String(100))
    model: Mapped[str | None] = mapped_column(String(100))
    year: Mapped[int | None] = mapped_column()
    registration_number: Mapped[str | None] = mapped_column(String(50))
    fuel_type: Mapped[str | None] = mapped_column(String(30))
    mileage_kmpl: Mapped[float | None] = mapped_column()
    is_primary: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped["User"] = relationship(back_populates="vehicles")


class EmergencyContact(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "emergency_contacts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    relationship_type: Mapped[str | None] = mapped_column(String(50))
    is_guardian: Mapped[bool] = mapped_column(Boolean, default=False)
    priority: Mapped[int] = mapped_column(default=1)

    user: Mapped["User"] = relationship(back_populates="emergency_contacts")
