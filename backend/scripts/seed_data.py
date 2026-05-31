"""Run: python -m scripts.seed_data (from backend dir with DATABASE_URL_SYNC set)"""
import asyncio
import uuid

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.config import settings
from app.database.base import Base
from app.models.places import Hospital, PetrolStation, PoliceStation
from app.models.community import CommunityPost
from app.models.user import User
from app.auth.security import hash_password

# Bangalore sample coordinates
BLR = (12.9716, 77.5946)


def seed():
    engine = create_engine(settings.database_url_sync.replace("+asyncpg", ""))
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        if db.execute(text("SELECT COUNT(*) FROM users")).scalar() > 0:
            print("Already seeded")
            return

        admin = User(
            email="demo@roxzave.com",
            password_hash=hash_password("Roxzave123"),
            full_name="Demo User",
            mobile="9876543210",
            safety_score=89,
        )
        db.add(admin)
        db.flush()

        for i, (name, lat_off, lng_off) in enumerate([
            ("Indian Oil Koramangala", 0.02, 0.01),
            ("HP Petrol Silk Board", -0.01, 0.03),
            ("BPCL Hebbal", 0.05, -0.02),
        ]):
            db.add(PetrolStation(
                name=name,
                brand="IOCL" if i == 0 else "HP",
                lat=BLR[0] + lat_off,
                lng=BLR[1] + lng_off,
                rating=4.2 + i * 0.1,
            ))

        db.add(Hospital(name="Manipal Hospital", lat=12.96, lng=77.64, phone="080-2502-4444", has_trauma_center=True))
        db.add(PoliceStation(name="Koramangala Police", lat=12.93, lng=77.62, phone="100"))

        db.add(CommunityPost(
            user_id=admin.id,
            community_name="Rescue Community",
            category="hazards",
            title="Pothole cluster near Silk Board",
            body="Reduce speed — 4 verified reports in last hour.",
            verify_count=128,
            lat=12.92,
            lng=77.62,
        ))

        db.commit()
        print("Seed complete. Login: demo@roxzave.com / Roxzave123")


if __name__ == "__main__":
    seed()
