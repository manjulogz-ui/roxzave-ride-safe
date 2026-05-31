from typing import Literal

from pydantic import BaseModel, Field


class RoutePlanRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    route_mode: Literal["fastest", "safest", "balanced"] = "balanced"


class DrowsinessEventCreate(BaseModel):
    risk_score: float = Field(ge=0, le=100)
    alert_level: str = "low"
    lat: float | None = None
    lng: float | None = None
    device_id: str | None = None
    sensor_payload: dict = Field(default_factory=dict)


class CrashEventCreate(BaseModel):
    severity: str = "high"
    lat: float | None = None
    lng: float | None = None
    acceleration_g: float | None = None
    device_id: str | None = None
    trigger_sos: bool = True
    details: dict = Field(default_factory=dict)
