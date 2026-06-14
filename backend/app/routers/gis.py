from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text
import json
from sqlalchemy import extract
import math

from app.database import get_db
from app.models.accident import Accident
from app.services.gis_service import (
    get_accident_markers,
)
from app.services.gis_service import (
    get_accident_heatmap
)
from app.services.gis_service import get_accident_blackspots

def clean_value(value):

    if isinstance(value, float):

        if math.isnan(value):
            return None

    return value

router = APIRouter(
    prefix="/gis",
    tags=["GIS"]
)

SEVERITY_WEIGHT = {
    "Fatal": 1.0,
    "Grievous Injury": 0.7,
    "Minor Injury": 0.4,
    "Damage Only": 0.2,
}


# ---------------------------------------------------
# GeoJSON API – returns all accident points as GeoJSON
# Used by MapLibre frontend
# ---------------------------------------------------
@router.get("/geojson")
def get_accidents_geojson(
    district: str | None = None,
    year: int | None = None,
    severity: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(
        Accident.accident_id,
        Accident.district,
        Accident.severity,
        Accident.latitude,
        Accident.longitude,
        func.ST_AsGeoJSON(Accident.location).label("geojson"),
    ).filter(Accident.location.isnot(None))

    if district:
        query = query.filter(Accident.district == district)
    if year:
        query = query.filter(extract("year", Accident.accident_datetime) == year)
    if severity:
        query = query.filter(Accident.severity == severity)

    rows = query.all()

    features = []
    for row in rows:
        if not row.geojson:
            continue
        features.append({
            "type": "Feature",
            "geometry": json.loads(row.geojson),
            "properties": {
                "id": row.accident_id,
                "district": row.district,
                "severity": row.severity,
                "severity_weight": SEVERITY_WEIGHT.get(row.severity, 0.3),
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }


# ---------------------------------------------------
# Nearby Accident Search – ST_DWithin
# ---------------------------------------------------
@router.get("/nearby")
def nearby_accidents(
    latitude: float = Query(...),
    longitude: float = Query(...),
    radius: int = Query(1000, description="Radius in meters"),
    db: Session = Depends(get_db)
):
    user_point = func.ST_SetSRID(
        func.ST_MakePoint(longitude, latitude),
        4326
    )

    results = (
        db.query(
            Accident.accident_id,
            Accident.district,
            Accident.severity,
            Accident.latitude,
            Accident.longitude,
            func.ST_DistanceSphere(
                Accident.location,
                user_point
            ).label("distance")
        )
        .filter(Accident.location.isnot(None))
        .filter(
            func.ST_DWithin(
                func.Geography(Accident.location),
                func.Geography(user_point),
                radius
            )
        )
        .order_by("distance")
        .limit(200)
        .all()
    )

    return {
        "total": len(results),
        "data": [
            {
                "id": row.accident_id,
                "district": row.district,
                "severity": row.severity,
                "latitude": row.latitude,
                "longitude": row.longitude,
                "distance_meters": round(row.distance, 2)
            }
            for row in results
        ]
    }


# ---------------------------------------------------
# Hotspots – grid clustering via ST_SnapToGrid
# ---------------------------------------------------
@router.get("/hotspots")
def accident_hotspots(
    grid_size: float = Query(0.05, description="Cluster grid size in degrees"),
    db: Session = Depends(get_db)
):
    grid = func.ST_SnapToGrid(Accident.location, grid_size)

    results = (
        db.query(
            func.ST_Y(func.ST_Centroid(func.ST_Collect(Accident.location))).label("latitude"),
            func.ST_X(func.ST_Centroid(func.ST_Collect(Accident.location))).label("longitude"),
            func.count(Accident.id).label("count")
        )
        .filter(Accident.location.isnot(None))
        .group_by(grid)
        .order_by(func.count(Accident.id).desc())
        .limit(500)
        .all()
    )

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [row.longitude, row.latitude]
                },
                "properties": {
                    "accident_count": row.count
                }
            }
            for row in results
            if row.latitude is not None and row.longitude is not None
        ]
    }

@router.get(
    "/accident-markers"
)
def accident_markers(
    db: Session = Depends(get_db)
):

    rows = get_accident_markers(
        db
    )


    features = []


    for row in rows:


        features.append(
            {
                "type": "Feature",

                "geometry": {

                    "type": "Point",

                    "coordinates": [

                        row.longitude,

                        row.latitude

                    ]

                },


                "properties": {


                    "id": row.id,


                    "severity": row.severity,


                    "road_name": row.road_name,


                    "weather_condition": row.weather_condition,

                }

            }
        )


    return {

        "type": "FeatureCollection",

        "features": features

    }


@router.get("/heatmap")
def accident_heatmap(
        db: Session = Depends(get_db)
    ):

    return get_accident_heatmap(db)

@router.get("/blackspots")
def accident_blackspots(
    db: Session = Depends(get_db)
):

    return get_accident_blackspots(db)