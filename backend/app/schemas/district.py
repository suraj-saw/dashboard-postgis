from pydantic import BaseModel


class DistrictHotspot(BaseModel):

    district: str

    accidents: int

    fatal: int

    geometry: dict