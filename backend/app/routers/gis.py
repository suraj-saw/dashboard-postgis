from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

import json

from app.database import get_db
from app.models.accident import Accident


router = APIRouter(
    prefix="/gis",
    tags=["GIS"]
)


# ---------------------------------------------------
# GeoJSON API
# Used by frontend map libraries (Leaflet / Mapbox)
# ---------------------------------------------------
@router.get("/geojson")
def get_accidents_geojson(
    district: str | None = None,
    year: int | None = None,
    severity: str | None = None,
    db: Session = Depends(get_db)
):

    query = db.query(Accident)

    if district:
        query = query.filter(
            Accident.district == district
        )

    if year:
        query = query.filter(
            Accident.year == year
        )

    if severity:
        query = query.filter(
            Accident.severity == severity
        )


    accidents = (
        query
        .filter(Accident.location.isnot(None))
        .all()
    )


    features = []


    for accident in accidents:

        geometry = db.scalar(
            func.ST_AsGeoJSON(
                accident.location
            )
        )


        features.append(
            {
                "type": "Feature",

                "geometry": json.loads(
                    geometry
                ),

                "properties": {

                    "id": accident.id,

                    "district": accident.district,

                    "severity": accident.severity,

                    "year": accident.year,
                }
            }
        )


    return {

        "type": "FeatureCollection",

        "features": features
    }



# ---------------------------------------------------
# Nearby Accident Search
# Finds accidents within radius meters
# ---------------------------------------------------
@router.get("/nearby")
def nearby_accidents(

    latitude: float = Query(...),

    longitude: float = Query(...),

    radius: int = Query(
        1000,
        description="Radius in meters"
    ),

    db: Session = Depends(get_db)
):


    user_point = func.ST_SetSRID(

        func.ST_MakePoint(
            longitude,
            latitude
        ),

        4326
    )


    accidents = (

        db.query(

            Accident,

            func.ST_DistanceSphere(
                Accident.location,
                user_point
            ).label(
                "distance"
            )
        )

        .filter(

            func.ST_DWithin(

                func.Geography(
                    Accident.location
                ),

                func.Geography(
                    user_point
                ),

                radius
            )
        )

        .order_by(
            "distance"
        )

        .all()
    )



    return {

        "total": len(accidents),

        "data": [

            {

                "id": accident.id,

                "district": accident.district,

                "severity": accident.severity,

                "latitude": accident.latitude,

                "longitude": accident.longitude,

                "distance_meters": round(
                    distance,
                    2
                )
            }

            for accident, distance in accidents

        ]
    }




# ---------------------------------------------------
# Accident Hotspots
# Spatial clustering using grid
# ---------------------------------------------------
@router.get("/hotspots")
def accident_hotspots(

    grid_size: float = Query(
        0.05,
        description="Cluster grid size"
    ),

    db: Session = Depends(get_db)
):


    grid = func.ST_SnapToGrid(

        Accident.location,

        grid_size

    )


    results = (

        db.query(

            func.ST_Y(
                grid
            ).label(
                "latitude"
            ),


            func.ST_X(
                grid
            ).label(
                "longitude"
            ),


            func.count(
                Accident.id
            ).label(
                "count"
            )

        )


        .filter(
            Accident.location.isnot(None)
        )


        .group_by(
            grid
        )


        .order_by(
            func.count(
                Accident.id
            ).desc()
        )


        .limit(
            50
        )


        .all()

    )



    return {

        "data": [

            {

                "latitude": lat,

                "longitude": lon,

                "accident_count": count

            }

            for lat, lon, count in results

        ]

    }