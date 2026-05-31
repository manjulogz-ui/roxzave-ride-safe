"""Initialize database tables and seed demo data before dev server starts."""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text

from app.database.base import Base
from app.database.session import engine
from app.models import *  # noqa: F401, F403
from app.services.seed import ensure_seed_data


async def main() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text("SELECT 1"))
    await ensure_seed_data()
    print("[OK] Database ready - tables created - seed checked")


if __name__ == "__main__":
    asyncio.run(main())
