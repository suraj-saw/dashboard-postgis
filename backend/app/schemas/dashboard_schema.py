from typing import List
from pydantic import BaseModel, ConfigDict

# Base Response Model
class ResponseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# Summary
class SummaryResponse(ResponseModel):
    total_accidents: int
    total_fatalities: int
    total_grievous: int
    total_minor: int
    total_damage_only: int
    total_vehicles: int
    districts_covered: int
    police_stations: int

# District Statistics
class DistrictCount(ResponseModel):
    district: str
    accident_count: int
    fatalities: int

class DistrictResponse(ResponseModel):
    data: List[DistrictCount]

# Severity Statistics
class SeverityCount(ResponseModel):
    severity: str
    count: int

class SeverityResponse(ResponseModel):
    data: List[SeverityCount]

# Time Series
class TimeSeriesPoint(ResponseModel):
    year: int
    month: int
    month_label: str
    accident_count: int
    fatalities: int

class TimeSeriesResponse(ResponseModel):
    data: List[TimeSeriesPoint]

# Collision Statistics

class CollisionCount(ResponseModel):
    collision_type: str
    count: int

class CollisionResponse(ResponseModel):
    data: List[CollisionCount]

# Accident Heatmap
class HeatmapPoint(ResponseModel):
    accident_id: str
    latitude: float
    longitude: float
    severity: str
    district: str

class HeatmapResponse(ResponseModel):
    total: int
    data: List[HeatmapPoint]

# Traffic Violation Statistics
class ViolationCount(ResponseModel):
    traffic_violation: str
    count: int

class ViolationResponse(ResponseModel):
    data: List[ViolationCount]

# Road Classification Statistics
class RoadClassCount(ResponseModel):
    road_classification: str
    accident_count: int
    fatalities: int

class RoadClassResponse(ResponseModel):
    data: List[RoadClassCount]

# Weather Statistics
class WeatherCount(ResponseModel):
    weather_condition: str
    count: int

class WeatherResponse(ResponseModel):
    data: List[WeatherCount]

# Light Condition Statistics
class LightCount(ResponseModel):
    light_condition: str
    count: int

class LightResponse(ResponseModel):
    data: List[LightCount]

# Police Station Statistics
class PoliceStationCount(ResponseModel):
    police_station: str
    district: str
    accident_count: int
    fatalities: int

class PoliceStationResponse(ResponseModel):
    data: List[PoliceStationCount]

# Casualty Breakdown
class CasualtyBreakdown(ResponseModel):
    category: str
    killed: int
    grievous: int
    minor: int

class CasualtyResponse(ResponseModel):
    data: List[CasualtyBreakdown]

# Dangerous District Ranking
class DangerousDistrict(ResponseModel):
    rank: int
    district: str
    fatal_accidents: int
    total_killed: int

class TopDangerousResponse(ResponseModel):
    data: List[DangerousDistrict]

# Yearly Comparison
class YearlyStats(ResponseModel):
    year: int
    total_accidents: int
    fatalities: int
    grievous: int

class YearlyResponse(ResponseModel):
    data: List[YearlyStats]



# GIS GeoJSON

class Geometry(ResponseModel):

    type: str

    coordinates: list[float]



class GeoJSONFeature(ResponseModel):

    type: str

    geometry: Geometry

    properties: dict



class GeoJSONResponse(ResponseModel):

    type: str

    features: List[GeoJSONFeature]



# Spatial Query

class NearbyAccident(ResponseModel):

    accident_id: str

    district: str

    severity: str

    latitude: float

    longitude: float

    distance_meters: float



class NearbyResponse(ResponseModel):

    total: int

    data: List[NearbyAccident]