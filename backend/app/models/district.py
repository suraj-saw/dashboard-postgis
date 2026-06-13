from sqlalchemy import (
    Column,
    Integer,
    String,
    Index,
)

from geoalchemy2 import Geometry

from app.database import Base
from app.core.config import POSTGIS_SRID


class District(Base):

    __tablename__ = "districts"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    name = Column(
        String,
        nullable=False,
        index=True
    )


    state = Column(
        String,
        nullable=False,
        default="Gujarat"
    )


    geometry = Column(
        Geometry(
            geometry_type="GEOMETRY",
            srid=POSTGIS_SRID,
            spatial_index=True,
        ),
        nullable=False,
    )


Index(
    "idx_district_geometry",
    District.geometry,
    postgresql_using="gist",
)