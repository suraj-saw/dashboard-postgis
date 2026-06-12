from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Index,
)

from geoalchemy2 import Geometry
from app.core.config import (
    POSTGIS_SRID,
    POSTGIS_GEOMETRY_TYPE,
)

from app.database import Base


class Accident(Base):
    __tablename__ = "accidents"

    id = Column(Integer, primary_key=True, index=True)

    # Identification
    accident_id = Column(String, unique=True, nullable=False, index=True)

    # Location
    district = Column(String, index=True)
    police_station = Column(String, index=True)

    # Keep for existing APIs
    latitude = Column(Float)
    longitude = Column(Float)

    # PostGIS location
    location = Column(
    Geometry(
            geometry_type=POSTGIS_GEOMETRY_TYPE,
            srid=POSTGIS_SRID,
        ),
        index=True,
    )

    # Time
    accident_datetime = Column(DateTime, index=True)

    # Road information
    road_name = Column(String)
    road_classification = Column(String, index=True)

    # Accident info
    severity = Column(String, index=True)
    no_of_vehicles = Column(Integer, default=0)

    # Driver casualties
    drivers_killed = Column(Integer, default=0)
    drivers_grievous_injury = Column(Integer, default=0)
    drivers_minor_injury = Column(Integer, default=0)

    # Passenger casualties
    passengers_killed = Column(Integer, default=0)
    passengers_grievous_injury = Column(Integer, default=0)
    passengers_minor_injury = Column(Integer, default=0)

    # Pedestrian casualties
    pedestrians_killed = Column(Integer, default=0)
    pedestrians_grievous_injury = Column(Integer, default=0)
    pedestrians_minor_injury = Column(Integer, default=0)

    # Conditions
    collision_type = Column(String, index=True)
    collision_feature = Column(String)
    weather_condition = Column(String, index=True)
    light_condition = Column(String, index=True)
    visibility = Column(String)
    traffic_violation = Column(String, index=True)



# dashboard indexes

Index(
    "idx_district_date",
    Accident.district,
    Accident.accident_datetime,
)


Index(
    "idx_severity_date",
    Accident.severity,
    Accident.accident_datetime,
)


# PostGIS spatial index

Index(
    "idx_accident_location",
    Accident.location,
    postgresql_using="gist",
)