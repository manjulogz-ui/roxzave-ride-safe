from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    message: str


class SOSCreate(BaseModel):
    lat: float | None = None
    lng: float | None = None
    trigger_type: str = "manual"


class SOSResponse(BaseModel):
    id: UUID
    status: str
    lat: float | None
    lng: float | None
    trigger_type: str
    golden_hour_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CommunityPostCreate(BaseModel):
    community_name: str = "Roxzave Community"
    category: str = "hazards"
    title: str
    body: str
    lat: float | None = None
    lng: float | None = None


class CommunityPostResponse(BaseModel):
    id: UUID
    community_name: str
    category: str
    title: str
    body: str
    verify_count: int
    dispute_count: int
    created_at: datetime
    author_name: str | None = None

    model_config = {"from_attributes": True}


class CommunityCommentCreate(BaseModel):
    body: str


class NotificationResponse(BaseModel):
    id: UUID
    category: str
    title: str
    body: str
    is_read: bool
    created_at: datetime
    payload: dict

    model_config = {"from_attributes": True}


class PetrolStationResponse(BaseModel):
    id: UUID
    name: str
    brand: str | None
    lat: float
    lng: float
    rating: float | None
    distance_km: float | None = None
    fuel_price: float | None = None
    has_ev_charging: bool

    model_config = {"from_attributes": True}


class FuelCostEstimate(BaseModel):
    trip_distance_km: float = Field(gt=0)
    mileage_kmpl: float = Field(gt=0, default=15)
    fuel_price_per_liter: float = Field(gt=0, default=107.95)


class FuelCostResponse(BaseModel):
    estimated_cost_inr: float
    fuel_liters: float
    trip_distance_km: float
    mileage_kmpl: float
    fuel_price_per_liter: float


class MapNearbyQuery(BaseModel):
    lat: float
    lng: float
    radius_km: float = 10


class DeviceRegister(BaseModel):
    device_id: str
    device_type: str = "esp32_mpu6050"
    firmware_version: str | None = None


class DeviceTelemetry(BaseModel):
    device_id: str
    speed_kmh: float | None = None
    acceleration_g: float | None = None
    tilt_angle: float | None = None
    battery_level: float | None = None
    lat: float | None = None
    lng: float | None = None
    drowsiness_score: float | None = None
    mock_mode: bool = False


class DeviceCrashEvent(BaseModel):
    device_id: str
    acceleration_g: float
    lat: float | None = None
    lng: float | None = None
    severity: str = "high"


class DevicePotholeEvent(BaseModel):
    device_id: str
    lat: float
    lng: float
    severity: int = 2
