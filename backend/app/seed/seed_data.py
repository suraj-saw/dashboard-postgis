import os
from pathlib import Path
import pandas as pd
from dotenv import load_dotenv
from app.database import Base, engine, SessionLocal
from app.models.accident import Accident
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from app.core.config import POSTGIS_SRID

load_dotenv()

# Configuration
DEFAULT_DATA_FILE = (
    Path(__file__).resolve().parents[1] / "data" / "accident_dummy_data.xlsx"
)

DATA_FILE = Path(os.getenv("ACCIDENT_DATASET_PATH", DEFAULT_DATA_FILE)).resolve()
CHUNK_SIZE = int(
    os.getenv(
        "SEED_BATCH_SIZE",
        "1000",
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

def to_int(value):
    try:
        return int(value)
    except Exception:
        return 0

def load_dataset():
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Dataset not found:\n{DATA_FILE}")
    print(f"Reading dataset:\n{DATA_FILE}")
    df = pd.read_excel(DATA_FILE)
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")

    df[DATE_COLUMN] = pd.to_datetime(
        df[DATE_COLUMN],
        errors="coerce",
        dayfirst=True,
    )
    return df

def build_accident(row):

    latitude = float(row["Latitude"])
    longitude = float(row["Longitude"])

    point = from_shape(
        Point(
            longitude,
            latitude
        ),
        srid=POSTGIS_SRID,
    )

    return Accident(

        accident_id=str(row["Accident_ID"]),

        district=str(row["District"]),
        police_station=str(row["Police_Station"]),

        latitude=latitude,
        longitude=longitude,

        location=point,

        accident_datetime=row["Accident_DateTime"],

        road_name=str(row["Road_Name"]),
        road_classification=str(row["Road_Classification"]),

        severity=str(row["Severity"]),

        no_of_vehicles=to_int(
            row["No_of_Vehicles"]
        ),

        drivers_killed=to_int(row["Drivers_Killed"]),
        drivers_grievous_injury=to_int(row["Drivers_Grievous_Injury"]),
        drivers_minor_injury=to_int(row["Drivers_Minor_Injury"]),

        passengers_killed=to_int(row["Passengers_Killed"]),
        passengers_grievous_injury=to_int(
            row["Passengers_Grievous_Injury"]
        ),
        passengers_minor_injury=to_int(
            row["Passengers_Minor_Injury"]
        ),

        pedestrians_killed=to_int(
            row["Pedestrians_Killed"]
        ),
        pedestrians_grievous_injury=to_int(
            row["Pedestrians_Grievous_Injury"]
        ),
        pedestrians_minor_injury=to_int(
            row["Pedestrians_Minor_Injury"]
        ),

        collision_type=str(row["Collision_Type"]),
        collision_feature=str(row["Collision_Feature"]),

        weather_condition=str(
            row["Weather_Condition"]
        ),

        light_condition=str(
            row["Light_Condition"]
        ),

        visibility=str(row["Visibility"]),

        traffic_violation=str(
            row["Traffic_Violation"]
        ),
    )
    return Accident(
        accident_id=str(row["Accident_ID"]),
        district=str(row["District"]),
        police_station=str(row["Police_Station"]),
        accident_datetime=row["Accident_DateTime"],
        latitude=float(row["Latitude"]),
        longitude=float(row["Longitude"]),
        road_name=str(row["Road_Name"]),
        road_classification=str(row["Road_Classification"]),
        severity=str(row["Severity"]),
        no_of_vehicles=to_int(row["No_of_Vehicles"]),
        drivers_killed=to_int(row["Drivers_Killed"]),
        drivers_grievous_injury=to_int(row["Drivers_Grievous_Injury"]),
        drivers_minor_injury=to_int(row["Drivers_Minor_Injury"]),
        passengers_killed=to_int(row["Passengers_Killed"]),
        passengers_grievous_injury=to_int(row["Passengers_Grievous_Injury"]),
        passengers_minor_injury=to_int(row["Passengers_Minor_Injury"]),
        pedestrians_killed=to_int(row["Pedestrians_Killed"]),
        pedestrians_grievous_injury=to_int(row["Pedestrians_Grievous_Injury"]),
        pedestrians_minor_injury=to_int(row["Pedestrians_Minor_Injury"]),
        collision_type=str(row["Collision_Type"]),
        collision_feature=str(row["Collision_Feature"]),
        weather_condition=str(row["Weather_Condition"]),
        light_condition=str(row["Light_Condition"]),
        visibility=str(row["Visibility"]),
        traffic_violation=str(row["Traffic_Violation"]),
    )

def seed_accidents():
    print("=" * 60)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Accident).count()
        if existing:
            print(f"Skipping seed. Existing rows: {existing}")
            return
        df = load_dataset()
        total = len(df)
        print(f"Rows detected: {total}")
        for start in range(0, total, CHUNK_SIZE):
            end = start + CHUNK_SIZE
            batch = df.iloc[start:end]
            rows = [build_accident(row) for _, row in batch.iterrows()]
            db.bulk_save_objects(rows)
            db.commit()
            print(f"Inserted {min(end,total)}/{total}")

        print("Seed complete")
    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

if __name__ == "__main__":
    seed_accidents()
