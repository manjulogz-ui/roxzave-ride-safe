from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_optional_user
from app.database.session import get_db
from app.models.safety import DrowsinessEvent, PotholeReport
from app.models.system import Device, SensorLog
from app.models.trip import CrashEvent
from app.models.user import User
from app.schemas.common import DeviceCrashEvent, DevicePotholeEvent, DeviceRegister, DeviceTelemetry

router = APIRouter(prefix="/device", tags=["ESP32 Device"])


@router.post("/register")
async def register_device(data: DeviceRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device).where(Device.device_id == data.device_id))
    device = result.scalar_one_or_none()
    if device:
        device.firmware_version = data.firmware_version
        device.last_seen_at = datetime.now(UTC)
        device.is_online = True
    else:
        device = Device(
            device_id=data.device_id,
            device_type=data.device_type,
            firmware_version=data.firmware_version,
            is_online=True,
            last_seen_at=datetime.now(UTC),
        )
        db.add(device)
    await db.flush()
    return {"device_id": data.device_id, "status": "registered"}


@router.post("/telemetry")
async def device_telemetry(data: DeviceTelemetry, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device).where(Device.device_id == data.device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not registered")
    device.battery_level = data.battery_level
    device.last_seen_at = datetime.now(UTC)
    device.is_online = True
    meta = device.metadata_ or {}
    meta["last_telemetry"] = data.model_dump()
    meta["mock_mode"] = data.mock_mode
    device.metadata_ = meta

    if data.drowsiness_score is not None and device.user_id:
        level = "critical" if data.drowsiness_score >= 80 else "high" if data.drowsiness_score >= 60 else "low"
        db.add(
            DrowsinessEvent(
                user_id=device.user_id,
                device_id=device.id,
                risk_score=data.drowsiness_score,
                alert_level=level,
                lat=data.lat,
                lng=data.lng,
                sensor_payload=data.model_dump(),
            )
        )
        db.add(
            SensorLog(
                user_id=device.user_id,
                device_id=device.id,
                sensor_type="mpu6050_drowsiness",
                payload=data.model_dump(),
                lat=data.lat,
                lng=data.lng,
            )
        )
    return {"status": "ok", "mock_mode": data.mock_mode}


@router.post("/crash-event")
async def crash_event(data: DeviceCrashEvent, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device).where(Device.device_id == data.device_id))
    device = result.scalar_one_or_none()
    event = CrashEvent(
        user_id=device.user_id if device else None,
        device_id=device.id if device else None,
        severity=data.severity,
        lat=data.lat,
        lng=data.lng,
        acceleration_g=data.acceleration_g,
        golden_hour_triggered=True,
    )
    db.add(event)
    return {"crash_id": str(event.id), "golden_hour": True}


@router.post("/pothole-event")
async def pothole_event(data: DevicePotholeEvent, db: AsyncSession = Depends(get_db)):
    report = PotholeReport(lat=data.lat, lng=data.lng, severity=data.severity, description="Device detected")
    db.add(report)
    return {"report_id": str(report.id)}


@router.get("/status/{device_id}")
async def device_status(device_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return {
        "device_id": device.device_id,
        "is_online": device.is_online,
        "battery_level": device.battery_level,
        "last_seen_at": device.last_seen_at.isoformat() if device.last_seen_at else None,
    }
