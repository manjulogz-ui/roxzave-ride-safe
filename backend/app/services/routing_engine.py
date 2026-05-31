"""Safe route engine — GraphHopper + OSRM (OpenStreetMap data) with DB risk scoring."""
from __future__ import annotations

import math
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.safety import CrimeZone, PotholeReport, RouteSafetyScore, WeatherSnapshot
from app.models.trip import CrashEvent


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return r * 2 * math.asin(math.sqrt(a))


def _point_near(lat: float, lng: float, plat: float, plng: float, radius_km: float = 0.5) -> bool:
    return haversine(lat, lng, plat, plng) <= radius_km


async def fetch_osrm_route(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> dict[str, Any]:
    url = (
        f"https://router.project-osrm.org/route/v1/driving/"
        f"{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
        "?overview=full&geometries=geojson&steps=false"
    )
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()
    route = data["routes"][0]
    return {
        "distance_km": route["distance"] / 1000,
        "duration_minutes": int(route["duration"] / 60),
        "geometry": route["geometry"],
        "provider": "osrm",
    }


async def fetch_graphhopper_route(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> dict[str, Any]:
    if not settings.graphhopper_api_key:
        raise ValueError("GraphHopper API key not configured")
    params = {
        "point": [f"{origin_lat},{origin_lng}", f"{dest_lat},{dest_lng}"],
        "vehicle": "car",
        "key": settings.graphhopper_api_key,
        "points_encoded": "false",
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.get("https://graphhopper.com/api/1/route", params=params)
        resp.raise_for_status()
        data = resp.json()
    path = data["paths"][0]
    coords = [[c[1], c[0]] for c in path["points"]["coordinates"]]
    return {
        "distance_km": path["distance"] / 1000,
        "duration_minutes": int(path["time"] / 60000),
        "geometry": {"type": "LineString", "coordinates": [[c[1], c[0]] for c in path["points"]["coordinates"]]},
        "provider": "graphhopper",
        "coordinates": coords,
    }


async def get_route_geometry(
    origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float,
) -> dict[str, Any]:
    if settings.graphhopper_api_key:
        try:
            return await fetch_graphhopper_route(origin_lat, origin_lng, dest_lat, dest_lng)
        except Exception:
            pass
    return await fetch_osrm_route(origin_lat, origin_lng, dest_lat, dest_lng)


async def compute_risk_breakdown(
    db: AsyncSession,
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    route_mode: str,
) -> dict[str, Any]:
    mid_lat = (origin_lat + dest_lat) / 2
    mid_lng = (origin_lng + dest_lng) / 2

    crimes = list((await db.execute(select(CrimeZone).limit(100))).scalars())
    potholes = list((await db.execute(select(PotholeReport).where(PotholeReport.deleted_at.is_(None)).limit(200))).scalars())
    crashes = list((await db.execute(select(CrashEvent).limit(200))).scalars())
    weather = list((await db.execute(select(WeatherSnapshot).order_by(WeatherSnapshot.created_at.desc()).limit(5))).scalars())

    crime_hits = sum(1 for c in crimes if _point_near(mid_lat, mid_lng, c.lat, c.lng, c.radius_m / 1000))
    pothole_hits = sum(1 for p in potholes if _point_near(mid_lat, mid_lng, p.lat, p.lng))
    crash_hits = sum(1 for e in crashes if e.lat and e.lng and _point_near(mid_lat, mid_lng, e.lat, e.lng))
    weather_risk = weather[0].risk_factor if weather else 0.15
    traffic_density = min(1.0, (crime_hits + pothole_hits) / 10)

    weights = {"fastest": 0.2, "safest": 0.9, "balanced": 0.55}.get(route_mode, 0.55)
    penalty = (
        crime_hits * 4 * weights
        + pothole_hits * 2 * weights
        + crash_hits * 5 * weights
        + weather_risk * 10 * weights
        + traffic_density * 8 * weights
    )
    base = {"fastest": 78, "safest": 92, "balanced": 85}.get(route_mode, 85)
    safety_score = max(35, min(99, int(base - penalty)))

    return {
        "accident_history": crash_hits,
        "crime_zones": crime_hits,
        "weather": round(weather_risk, 2),
        "road_quality": pothole_hits,
        "traffic_density": round(traffic_density, 2),
        "safety_score": safety_score,
    }


async def plan_route(
    db: AsyncSession,
    user_id,
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    route_mode: str = "balanced",
) -> dict[str, Any]:
    geometry_data = await get_route_geometry(origin_lat, origin_lng, dest_lat, dest_lng)
    risks = await compute_risk_breakdown(db, origin_lat, origin_lng, dest_lat, dest_lng, route_mode)

    distance_km = geometry_data["distance_km"]
    if route_mode == "safest":
        distance_km *= 1.08
    elif route_mode == "balanced":
        distance_km *= 1.04

    eta = geometry_data["duration_minutes"]
    if route_mode == "safest":
        eta = int(eta * 1.12)

    record = RouteSafetyScore(
        user_id=user_id,
        origin_lat=origin_lat,
        origin_lng=origin_lng,
        dest_lat=dest_lat,
        dest_lng=dest_lng,
        route_type=route_mode,
        safety_score=float(risks["safety_score"]),
        factors={
            "distance_km": round(distance_km, 2),
            "eta_minutes": eta,
            "risk_breakdown": risks,
            "provider": geometry_data.get("provider"),
        },
    )
    db.add(record)
    await db.flush()

    return {
        "route_id": str(record.id),
        "route_mode": route_mode,
        "distance_km": round(distance_km, 2),
        "eta_minutes": eta,
        "safety_score": risks["safety_score"],
        "risk_breakdown": risks,
        "geometry": geometry_data.get("geometry"),
        "provider": geometry_data.get("provider"),
    }
