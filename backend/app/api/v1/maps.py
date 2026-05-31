import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.places import BloodBank, Hospital, PetrolStation, PoliceStation, TollPlaza
from app.models.safety import CrimeZone, PotholeReport, SchoolZone
from app.schemas.common import FuelCostEstimate, FuelCostResponse, MapNearbyQuery, PetrolStationResponse

router = APIRouter(prefix="/maps", tags=["Maps & Places"])


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return r * 2 * math.asin(math.sqrt(a))


@router.get("/nearby/petrol-stations", response_model=list[PetrolStationResponse])
async def nearby_petrol(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_km: float = Query(15),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PetrolStation).limit(100))
    stations = []
    for s in result.scalars().all():
        dist = haversine_km(lat, lng, s.lat, s.lng)
        if dist <= radius_km:
            stations.append(
                PetrolStationResponse(
                    id=s.id,
                    name=s.name,
                    brand=s.brand,
                    lat=s.lat,
                    lng=s.lng,
                    rating=s.rating,
                    distance_km=round(dist, 2),
                    fuel_price=107.95,
                    has_ev_charging=s.has_ev_charging,
                )
            )
    stations.sort(key=lambda x: x.distance_km or 999)
    return stations[:20]


@router.get("/nearby/hospitals")
async def nearby_hospitals(lat: float = Query(...), lng: float = Query(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Hospital).limit(50))
    return [
        {"id": str(h.id), "name": h.name, "lat": h.lat, "lng": h.lng, "phone": h.phone, "distance_km": haversine_km(lat, lng, h.lat, h.lng)}
        for h in result.scalars().all()
    ]


@router.get("/nearby/police")
async def nearby_police(lat: float = Query(...), lng: float = Query(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PoliceStation).limit(50))
    return [{"id": str(p.id), "name": p.name, "lat": p.lat, "lng": p.lng, "phone": p.phone} for p in result.scalars().all()]


@router.get("/layers")
async def safety_layers(lat: float = Query(...), lng: float = Query(...), db: AsyncSession = Depends(get_db)):
    potholes = await db.execute(select(PotholeReport).where(PotholeReport.deleted_at.is_(None)).limit(100))
    crimes = await db.execute(select(CrimeZone).limit(50))
    schools = await db.execute(select(SchoolZone).limit(50))
    return {
        "potholes": [{"id": str(p.id), "lat": p.lat, "lng": p.lng, "severity": p.severity} for p in potholes.scalars()],
        "crime_zones": [{"id": str(c.id), "name": c.name, "lat": c.lat, "lng": c.lng, "risk": c.risk_level} for c in crimes.scalars()],
        "school_zones": [{"id": str(s.id), "name": s.name, "lat": s.lat, "lng": s.lng} for s in schools.scalars()],
    }


@router.post("/fuel-cost-estimate", response_model=FuelCostResponse)
async def fuel_cost_estimate(data: FuelCostEstimate):
    liters = data.trip_distance_km / data.mileage_kmpl
    cost = liters * data.fuel_price_per_liter
    return FuelCostResponse(
        estimated_cost_inr=round(cost, 2),
        fuel_liters=round(liters, 2),
        trip_distance_km=data.trip_distance_km,
        mileage_kmpl=data.mileage_kmpl,
        fuel_price_per_liter=data.fuel_price_per_liter,
    )
