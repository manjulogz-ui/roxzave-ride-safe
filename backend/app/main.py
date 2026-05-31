from contextlib import asynccontextmanager
from time import monotonic

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text

from app.api.v1.router import api_router
from app.api.auth_public import auth_public_router
from app.config import settings
from app.database.base import Base
from app.database.session import engine
from app.models import *  # noqa: F401, F403
from app.websocket.manager import manager

_started_at = monotonic()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Auto-seed when empty (dev)
    try:
        from app.services.seed import ensure_seed_data

        await ensure_seed_data()
    except Exception as e:
        print(f"Seed skipped: {e}")
    yield
    await engine.dispose()


limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(
    title="Roxzave API",
    description="Enterprise road safety platform API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|172\.16\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PRD paths: /auth/* and /api/auth/*
app.include_router(auth_public_router)
app.include_router(api_router)


@app.get("/health")
async def health():
    db_ok = False
    seed_user = False
    tables_ok = False
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_ok = True
            tables_ok = True
        from sqlalchemy import select
        from app.database.session import AsyncSessionLocal
        from app.models.user import User

        async with AsyncSessionLocal() as db:
            demo = await db.execute(select(User).where(User.email == "demo@roxzave.com").limit(1))
            seed_user = demo.scalar_one_or_none() is not None
    except Exception:
        db_ok = False

    checks = {
        "api": True,
        "database": db_ok,
        "tables": tables_ok,
        "seed_user": seed_user,
    }
    healthy = db_ok and tables_ok
    return {
        "status": "healthy" if healthy else "degraded",
        "environment": settings.environment,
        "database": "connected" if db_ok else "disconnected",
        "database_type": "sqlite" if settings.is_sqlite else "postgresql",
        "version": "1.0.0",
        "uptime_seconds": int(monotonic() - _started_at),
        "checks": checks,
        "routes_loaded": len(app.routes),
    }


@app.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    await manager.connect(channel, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(channel, {"type": "message", "data": data})
    except WebSocketDisconnect:
        manager.disconnect(channel, websocket)


@app.websocket("/ws/guardian/{user_id}")
async def guardian_tracking(websocket: WebSocket, user_id: str):
    channel = f"guardian:{user_id}"
    await manager.connect(channel, websocket)
    try:
        while True:
            location = await websocket.receive_json()
            await manager.broadcast(channel, {"type": "location", "user_id": user_id, **location})
    except WebSocketDisconnect:
        manager.disconnect(channel, websocket)
