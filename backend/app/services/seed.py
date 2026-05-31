"""Auto-seed demo data on first startup."""
from sqlalchemy import select, text

from app.auth.security import hash_password
from app.database.session import AsyncSessionLocal
from app.models.community import CommunityPost
from app.models.places import BloodBank, Hospital, PetrolStation, PoliceStation
from app.models.safety import CrimeZone, PotholeReport, WeatherSnapshot
from app.models.user import User


async def ensure_seed_data() -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            return

        admin = User(
            email="demo@roxzave.com",
            password_hash=hash_password("Roxzave123"),
            full_name="Demo User",
            mobile="9876543210",
            safety_score=89,
        )
        db.add(admin)
        await db.flush()

        db.add(PetrolStation(name="Indian Oil Koramangala", brand="IOCL", lat=12.98, lng=77.60, rating=4.3))
        db.add(PetrolStation(name="HP Petrol Silk Board", brand="HP", lat=12.92, lng=77.62, rating=4.1))
        db.add(Hospital(name="Manipal Hospital", lat=12.96, lng=77.64, phone="080-2502-4444", has_trauma_center=True))
        db.add(PoliceStation(name="Koramangala Police", lat=12.93, lng=77.62, phone="100"))
        db.add(
            CommunityPost(
                user_id=admin.id,
                community_name="Rescue Community",
                category="hazards",
                title="Pothole cluster near Silk Board",
                body="Reduce speed — verified reports in last hour.",
                verify_count=128,
                lat=12.92,
                lng=77.62,
            )
        )
        db.add(CrimeZone(name="Silk Board Junction", lat=12.92, lng=77.62, risk_level="high", radius_m=600))
        db.add(CrimeZone(name="Koramangala 5th Block", lat=12.93, lng=77.63, risk_level="medium", radius_m=400))
        db.add(PotholeReport(lat=12.925, lng=77.615, severity=3, verified_count=12))
        db.add(WeatherSnapshot(lat=12.97, lng=77.59, condition="partly_cloudy", temperature_c=28.0, risk_factor=0.2))
        db.add(BloodBank(name="Red Cross Bangalore", lat=12.98, lng=77.60, phone="080-2222-2222"))
        await db.commit()
        print("[OK] Seeded demo user: demo@roxzave.com / Roxzave123")
