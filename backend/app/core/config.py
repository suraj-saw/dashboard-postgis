import os
from dotenv import load_dotenv


load_dotenv()


POSTGIS_SRID = int(
    os.getenv(
        "POSTGIS_SRID",
        4326,
    )
)


POSTGIS_GEOMETRY_TYPE = os.getenv(
    "POSTGIS_GEOMETRY_TYPE",
    "POINT",
)