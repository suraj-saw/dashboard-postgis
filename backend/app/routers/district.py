import json

from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.services.district_service import get_district_hotspots


router = APIRouter(
    prefix="/gis",
    tags=["District GIS"]
)



@router.get(
    "/district-hotspots"
)
def district_hotspots(
    db: Session = Depends(get_db)
):

    rows = get_district_hotspots(
        db
    )


    features = []


    for row in rows:

        features.append(
            {
                "type": "Feature",

                "properties": {

                    "district": row.name,

                    "accidents": row.accidents,

                    "fatal": row.fatal,
                },

                "geometry": json.loads(
                    row.geometry
                ),
            }
        )


    return {

        "type": "FeatureCollection",

        "features": features
    }