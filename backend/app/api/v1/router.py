from fastapi import APIRouter

from app.api.v1 import (
    admin,
    ai,
    analytics,
    auth,
    community,
    crash,
    devices,
    drowsiness,
    maps,
    navigation,
    notifications,
    rewards,
    safety,
    sos,
    trips,
    users,
    voice,
    women_safety,
)

api_router = APIRouter(prefix="/api")
api_router.include_router(ai.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(trips.router)
api_router.include_router(sos.router)
api_router.include_router(community.router)
api_router.include_router(notifications.router)
api_router.include_router(maps.router)
api_router.include_router(devices.router)
api_router.include_router(safety.router)
api_router.include_router(navigation.router)
api_router.include_router(admin.router)
api_router.include_router(analytics.router)
api_router.include_router(drowsiness.router)
api_router.include_router(crash.router)
api_router.include_router(rewards.router)
api_router.include_router(women_safety.router)
api_router.include_router(voice.router)
