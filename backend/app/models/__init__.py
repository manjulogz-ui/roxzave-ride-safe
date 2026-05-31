from app.models.user import User, EmergencyContact, Vehicle
from app.models.trip import Trip, TripEvent, CrashEvent, DrivingScore
from app.models.safety import (
    DrowsinessEvent,
    PotholeReport,
    CrimeZone,
    SchoolZone,
    RoadQualityReport,
    RouteSafetyScore,
    SafetyIncident,
    WeatherSnapshot,
    WomenSafetyEvent,
)
from app.models.places import (
    Hospital,
    BloodBank,
    PetrolStation,
    FuelPrice,
    TollPlaza,
    PoliceStation,
)
from app.models.community import CommunityPost, CommunityComment, CommunityLike
from app.models.sos import SOSRequest, VoiceEvidence, Guardian, GuardianTracking, EmergencyEvent
from app.models.rewards import Badge, RewardEvent, UserBadge, UserPoints
from app.models.system import Notification, AuditLog, Device, AIRecommendation, SensorLog

__all__ = [
    "User",
    "EmergencyContact",
    "Vehicle",
    "Trip",
    "TripEvent",
    "CrashEvent",
    "DrivingScore",
    "PotholeReport",
    "CrimeZone",
    "SchoolZone",
    "RoadQualityReport",
    "RouteSafetyScore",
    "WomenSafetyEvent",
    "Hospital",
    "BloodBank",
    "PetrolStation",
    "FuelPrice",
    "TollPlaza",
    "PoliceStation",
    "CommunityPost",
    "CommunityComment",
    "CommunityLike",
    "SOSRequest",
    "VoiceEvidence",
    "Guardian",
    "GuardianTracking",
    "Notification",
    "AuditLog",
    "Device",
    "AIRecommendation",
    "SensorLog",
    "DrowsinessEvent",
    "SafetyIncident",
    "WeatherSnapshot",
    "EmergencyEvent",
    "UserPoints",
    "Badge",
    "UserBadge",
    "RewardEvent",
]
