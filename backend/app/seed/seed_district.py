from app.database import engine
from app.database import Base
import json
import os

from geoalchemy2.shape import from_shape
from shapely.geometry import shape

from app.database import SessionLocal
from app.models.district import District
from app.models.accident import Accident
from app.core.config import POSTGIS_SRID


CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


APP_DIR = os.path.dirname(
    CURRENT_DIR
)


BACKEND_DIR = os.path.dirname(
    APP_DIR
)


GEOJSON_PATH = os.path.join(
    BACKEND_DIR,
    "data",
    "gujarat_districts.json"
)

def seed_districts():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Loading Gujarat district GeoJSON...")


        # avoid duplicate inserts
        existing_count = (
            db.query(District)
            .count()
        )

        if existing_count > 0:

            print(
                f"District table already contains {existing_count} records"
            )

            return


        with open(
            GEOJSON_PATH,
            "r",
            encoding="utf-8"
        ) as file:

            geojson = json.load(file)


        districts = []


        for feature in geojson["features"]:

            properties = feature["properties"]


            district_name = properties.get(
                "NAME_2"
            )


            geometry = shape(
                feature["geometry"]
            )


            district = District(

                name=district_name,

                state="Gujarat",

                geometry=from_shape(
                    geometry,
                    srid=POSTGIS_SRID
                )
            )


            districts.append(
                district
            )


        db.bulk_save_objects(
            districts
        )


        db.commit()


        print(
            f"{len(districts)} districts inserted successfully"
        )


    except Exception as error:

        db.rollback()

        print(
            "District seeding failed:",
            error
        )


    finally:

        db.close()



if __name__ == "__main__":

    seed_districts()