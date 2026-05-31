"""Navigation — safe routes (OSM/GraphHopper), fuel, toll, traffic laws, emergency network."""
import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.places import BloodBank, Hospital, PoliceStation, TollPlaza
from app.models.safety import CrimeZone, PotholeReport, RouteSafetyScore
from app.models.user import User
from app.schemas.navigation import RoutePlanRequest
from app.services.routing_engine import compute_risk_breakdown, haversine, plan_route

router = APIRouter(prefix="/navigation", tags=["Navigation"])


@router.post("/route")
async def plan_navigation_route(
    data: RoutePlanRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await plan_route(
        db,
        user.id,
        data.origin_lat,
        data.origin_lng,
        data.dest_lat,
        data.dest_lng,
        data.route_mode,
    )


@router.get("/risk")
async def route_risk(
    origin_lat: float = Query(...),
    origin_lng: float = Query(...),
    dest_lat: float = Query(...),
    dest_lng: float = Query(...),
    route_mode: str = Query("balanced"),
    db: AsyncSession = Depends(get_db),
):
    risks = await compute_risk_breakdown(db, origin_lat, origin_lng, dest_lat, dest_lng, route_mode)
    distance = haversine(origin_lat, origin_lng, dest_lat, dest_lng)
    return {"distance_km": round(distance, 2), "route_mode": route_mode, **risks}


@router.get("/crime-zones")
async def crime_zones(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CrimeZone).limit(100))
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "lat": c.lat,
            "lng": c.lng,
            "radius_m": c.radius_m,
            "risk_level": c.risk_level,
        }
        for c in result.scalars()
    ]


@router.post("/safe-route")
async def safe_route(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    route_type: str = "safe",
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    mode = {"safe": "safest", "fast": "fastest", "balanced": "balanced"}.get(route_type, route_type)
    return await plan_route(db, user.id, origin_lat, origin_lng, dest_lat, dest_lng, mode)


@router.get("/toll/estimate")
async def toll_estimate(distance_km: float = Query(50), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TollPlaza).limit(20))
    plazas = list(result.scalars())
    fee = sum(p.fee_inr or 45 for p in plazas[: max(1, int(distance_km / 40))])
    return {"estimated_toll_inr": round(fee, 2), "plazas_count": len(plazas), "fastag_ready": True}


@router.get("/traffic-laws")
async def traffic_laws(state: str = Query("KA")):
    laws = {
        "KA": [
            {"code": "KA-01", "title": "Helmet mandatory", "fine_inr": 1000},
            {"code": "KA-02", "title": "School zone 25 km/h", "fine_inr": 2000},
            {"code": "KA-03", "title": "Red light violation", "fine_inr": 5000},
        ],
    }
    return {"state": state, "laws": laws.get(state, laws["KA"])}


@router.get("/emergency-network")
async def emergency_network(lat: float = Query(12.97), lng: float = Query(77.59), db: AsyncSession = Depends(get_db)):
    hospitals = await db.execute(select(Hospital).limit(20))
    police = await db.execute(select(PoliceStation).limit(20))
    blood = await db.execute(select(BloodBank).limit(10))
    return {
        "hospitals": [
            {"id": str(h.id), "name": h.name, "lat": h.lat, "lng": h.lng, "trauma": h.has_trauma_center}
            for h in hospitals.scalars()
        ],
        "police": [{"id": str(p.id), "name": p.name, "lat": p.lat, "lng": p.lng} for p in police.scalars()],
        "blood_banks": [{"id": str(b.id), "name": b.name, "lat": b.lat, "lng": b.lng} for b in blood.scalars()],
        "ambulances": [
            {"id": "amb-108", "name": "National Ambulance 108", "phone": "108", "lat": lat, "lng": lng}
        ],
    }
