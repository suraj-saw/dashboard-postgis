import os
from pathlib import Path

import pandas as pd

from dotenv import load_dotenv

from geoalchemy2.shape import from_shape
from shapely.geometry import Point


from app.database import (
    Base,
    engine,
    SessionLocal,
)

from app.models.accident import Accident

from app.core.config import POSTGIS_SRID



load_dotenv()



DEFAULT_DATA_FILE = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "accident_dummy_data.xlsx"
)



DATA_FILE = Path(
    os.getenv(
        "ACCIDENT_DATASET_PATH",
        DEFAULT_DATA_FILE,
    )
).resolve()



CHUNK_SIZE = int(
    os.getenv(
        "SEED_BATCH_SIZE",
        "1000"
    )
)



DATE_COLUMN = os.getenv(
    "ACCIDENT_DATETIME_COLUMN",
    "Accident_DateTime",
)




REQUIRED_COLUMNS = {


    "Accident_ID",

    "District",

    "Police_Station",

    "Accident_DateTime",


    "Latitude",

    "Longitude",


    "Road_Name",

    "Road_Classification",


    "Severity",


    "No_of_Vehicles",


    "Drivers_Killed",

    "Drivers_Grievous_Injury",

    "Drivers_Minor_Injury",


    "Passengers_Killed",

    "Passengers_Grievous_Injury",

    "Passengers_Minor_Injury",


    "Pedestrians_Killed",

    "Pedestrians_Grievous_Injury",

    "Pedestrians_Minor_Injury",


    "Collision_Type",

    "Collision_Feature",


    "Weather_Condition",

    "Light_Condition",

    "Visibility",


    "Traffic_Violation",


}







# --------------------------------
# Helpers
# --------------------------------


def clean_text(value):


    if pd.isna(value):

        return None


    return str(value)






def clean_int(value):


    if pd.isna(value):

        return None



    try:

        return int(value)


    except Exception:

        return None








def clean_float(value):


    if pd.isna(value):

        return None



    try:

        return float(value)


    except Exception:

        return None










# --------------------------------
# Load Excel
# --------------------------------


def load_dataset():



    if not DATA_FILE.exists():


        raise FileNotFoundError(
            f"Dataset not found:\n{DATA_FILE}"
        )




    print(
        f"Reading dataset:\n{DATA_FILE}"
    )



    df = pd.read_excel(
        DATA_FILE
    )




    missing = (
        REQUIRED_COLUMNS
        -
        set(df.columns)
    )



    if missing:


        raise ValueError(

            f"Missing columns: {sorted(missing)}"

        )




    df[DATE_COLUMN] = pd.to_datetime(

        df[DATE_COLUMN],

        errors="coerce",

        dayfirst=True,

    )



    return df











# --------------------------------
# Convert row → Accident model
# --------------------------------


def build_accident(row):



    latitude = clean_float(
        row["Latitude"]
    )


    longitude = clean_float(
        row["Longitude"]
    )




    location = None




    if (

        latitude is not None

        and

        longitude is not None

    ):


        location = from_shape(


            Point(
                longitude,
                latitude,
            ),


            srid=POSTGIS_SRID,


        )








    return Accident(



        accident_id=clean_text(
            row["Accident_ID"]
        ),



        district=clean_text(
            row["District"]
        ),



        police_station=clean_text(
            row["Police_Station"]
        ),



        accident_datetime=row[
            "Accident_DateTime"
        ],




        latitude=latitude,


        longitude=longitude,


        location=location,





        road_name=clean_text(
            row["Road_Name"]
        ),



        road_classification=clean_text(
            row["Road_Classification"]
        ),




        severity=clean_text(
            row["Severity"]
        ),




        no_of_vehicles=clean_int(
            row["No_of_Vehicles"]
        ),




        drivers_killed=clean_int(
            row["Drivers_Killed"]
        ),



        drivers_grievous_injury=clean_int(
            row["Drivers_Grievous_Injury"]
        ),



        drivers_minor_injury=clean_int(
            row["Drivers_Minor_Injury"]
        ),





        passengers_killed=clean_int(
            row["Passengers_Killed"]
        ),



        passengers_grievous_injury=clean_int(
            row["Passengers_Grievous_Injury"]
        ),



        passengers_minor_injury=clean_int(
            row["Passengers_Minor_Injury"]
        ),






        pedestrians_killed=clean_int(
            row["Pedestrians_Killed"]
        ),



        pedestrians_grievous_injury=clean_int(
            row["Pedestrians_Grievous_Injury"]
        ),



        pedestrians_minor_injury=clean_int(
            row["Pedestrians_Minor_Injury"]
        ),





        collision_type=clean_text(
            row["Collision_Type"]
        ),



        collision_feature=clean_text(
            row["Collision_Feature"]
        ),




        weather_condition=clean_text(
            row["Weather_Condition"]
        ),



        light_condition=clean_text(
            row["Light_Condition"]
        ),



        visibility=clean_text(
            row["Visibility"]
        ),




        traffic_violation=clean_text(
            row["Traffic_Violation"]
        ),



    )









# --------------------------------
# Seed database
# --------------------------------


def seed_accidents():



    print(
        "=" * 60
    )



    Base.metadata.create_all(
        bind=engine
    )




    db = SessionLocal()




    try:



        existing = (
            db.query(Accident)
            .count()
        )



        if existing:


            print(
                f"Skipping seed. Existing rows: {existing}"
            )


            return






        df = load_dataset()



        total = len(df)



        print(
            f"Rows detected: {total}"
        )






        for start in range(
            0,
            total,
            CHUNK_SIZE,
        ):



            end = (
                start
                +
                CHUNK_SIZE
            )



            batch = df.iloc[
                start:end
            ]




            rows = [


                build_accident(row)


                for _, row

                in batch.iterrows()


            ]





            db.bulk_save_objects(
                rows
            )



            db.commit()




            print(

                f"Inserted {min(end,total)}/{total}"

            )





        print(
            "Seed complete"
        )





    except Exception:



        db.rollback()


        raise





    finally:



        db.close()







if __name__ == "__main__":


    seed_accidents()