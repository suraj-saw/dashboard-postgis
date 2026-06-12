
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import calendar
from collections import defaultdict

from app.database import get_db
from app.models.accident import Accident

from app.schemas.dashboard_schema import (
    SummaryResponse,
    DistrictResponse,
    DistrictCount,
    SeverityResponse,
    SeverityCount,
    TimeSeriesResponse,
    TimeSeriesPoint,
    CollisionResponse,
    CollisionCount,
    HeatmapResponse,
    HeatmapPoint,
    ViolationResponse,
    ViolationCount,
    RoadClassResponse,
    RoadClassCount,
    WeatherResponse,
    WeatherCount,
    LightResponse,
    LightCount,
    PoliceStationResponse,
    PoliceStationCount,
    CasualtyResponse,
    CasualtyBreakdown,
    TopDangerousResponse,
    DangerousDistrict,
    YearlyResponse,
    YearlyStats,
)

from app.utils.accident_utils import (
    apply_filters,
    total_fatalities,
    total_grievous,
    total_minor,
)

from app.core.constants import (
    SEVERITY_FATAL,
    SEVERITY_DAMAGE_ONLY,
    CASUALTY_TYPES,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

# Filter Options (dynamic)
@router.get("/filter-options")
def get_filter_options(
    db: Session = Depends(get_db),
):
    """Return all unique values for each filterable column."""

    def distinct_values(column):
        rows = (
            db.query(column)
            .filter(column.isnot(None), column != "", column != "nan")
            .distinct()
            .order_by(column)
            .all()
        )
        return [row[0] for row in rows]
    return {
        "road_classifications": distinct_values(Accident.road_classification),
        "weather_conditions": distinct_values(Accident.weather_condition),
        "light_conditions": distinct_values(Accident.light_condition),
        "collision_types": distinct_values(Accident.collision_type),
    }

# Summary
@router.get(
    "/summary",
    response_model=SummaryResponse,
)
def get_summary(
    district: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = apply_filters(
        db.query(Accident),
        district,
        year,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    )

    accidents = query.all()

    return SummaryResponse(
        total_accidents=len(accidents),
        total_fatalities=sum(total_fatalities(a) for a in accidents),
        total_grievous=sum(total_grievous(a) for a in accidents),
        total_minor=sum(total_minor(a) for a in accidents),
        total_damage_only=sum(
            1 for a in accidents if a.severity == SEVERITY_DAMAGE_ONLY
        ),
        total_vehicles=sum(a.no_of_vehicles or 0 for a in accidents),
        districts_covered=len({a.district for a in accidents}),
        police_stations=len({a.police_station for a in accidents}),
    )

# District
@router.get(
    "/by-district",
    response_model=DistrictResponse,
)
def get_by_district(
    year: Optional[int] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = apply_filters(
        db.query(Accident),
        None,
        year,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    )

    district_map = defaultdict(
        lambda: {
            "accident_count": 0,
            "fatalities": 0,
        }
    )

    for accident in query.all():
        district_map[accident.district]["accident_count"] += 1
        district_map[accident.district]["fatalities"] += total_fatalities(accident)
    return DistrictResponse(
        data=[
            DistrictCount(
                district=name,
                accident_count=value["accident_count"],
                fatalities=value["fatalities"],
            )
            for name, value in sorted(
                district_map.items(),
                key=lambda x: x[1]["accident_count"],
                reverse=True,
            )
        ]
    )

# Severity
@router.get(
    "/by-severity",
    response_model=SeverityResponse,
)
def get_by_severity(
    district: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(
        Accident.severity,
        func.count(Accident.id).label("count"),
    )
    query = apply_filters(
        query,
        district,
        year,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    )

    rows = query.group_by(Accident.severity).all()

    return SeverityResponse(
        data=[
            SeverityCount(
                severity=row.severity,
                count=row.count,
            )
            for row in rows
        ]
    )

# Time Series
@router.get(
    "/time-series",
    response_model=TimeSeriesResponse,
)
def get_time_series(
    district: Optional[str] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    granularity: str = Query(
        "month",
        enum=[
            "month",
            "year",
        ],
    ),
    db: Session = Depends(get_db),
):
    query = apply_filters(
        db.query(Accident),
        district,
        None,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    )

    buckets = defaultdict(
        lambda: {
            "count": 0,
            "fatalities": 0,
        }
    )

    for accident in query.all():
        date = accident.accident_datetime
        if not date:
            continue
        key = (
            date.year,
            date.month if granularity == "month" else 1,
        )
        buckets[key]["count"] += 1
        buckets[key]["fatalities"] += total_fatalities(accident)
    return TimeSeriesResponse(
        data=[
            TimeSeriesPoint(
                year=y,
                month=m,
                month_label=(
                    f"{calendar.month_abbr[m]} {y}"
                    if granularity == "month"
                    else str(y)
                ),
                accident_count=value["count"],
                fatalities=value["fatalities"],
            )
            for (y, m), value in sorted(buckets.items())
        ]
    )

# Collision Type
@router.get(
    "/by-collision",
    response_model=CollisionResponse,
)
def get_by_collision(
    district: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(
        Accident.collision_type,
        func.count(Accident.id).label("count"),
    )
    query = apply_filters(
        query,
        district,
        year,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    )

    rows = (
        query.group_by(Accident.collision_type)
        .order_by(func.count(Accident.id).desc())
        .all()
    )

    return CollisionResponse(
        data=[
            CollisionCount(
                collision_type=row.collision_type,
                count=row.count,
            )
            for row in rows
        ]
    )

# Heatmap
@router.get(
    "/heatmap",
    response_model=HeatmapResponse,
)
def get_heatmap(
    district: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = apply_filters(
        db.query(Accident),
        district,
        year,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    )
    if severity:
        query = query.filter(Accident.severity == severity)

    accidents = query.all()
    return HeatmapResponse(
        total=len(accidents),
        data=[
            HeatmapPoint(
                accident_id=a.accident_id,
                latitude=a.latitude,
                longitude=a.longitude,
                severity=a.severity,
                district=a.district,
            )
            for a in accidents
            if (a.latitude is not None and a.longitude is not None)
        ],
    )

# Traffic Violation
@router.get(
    "/by-violation",
    response_model=ViolationResponse,
)
def get_by_violation(
    district: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(
        Accident.traffic_violation,
        func.count(Accident.id).label("count"),
    )
    query = apply_filters(
        query,
        district,
        year,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    )

    rows = (
        query.filter(
            Accident.traffic_violation.isnot(None), Accident.traffic_violation != "nan"
        )
        .group_by(Accident.traffic_violation)
        .order_by(func.count(Accident.id).desc())
        .all()
    )

    return ViolationResponse(
        data=[
            ViolationCount(
                traffic_violation=row.traffic_violation,
                count=row.count,
            )
            for row in rows
        ]
    )

# Road Classification
@router.get(
    "/by-road",
    response_model=RoadClassResponse,
)
def get_by_road(
    year: Optional[int] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = apply_filters(
        db.query(Accident),
        None,
        year,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    )

    road_map = defaultdict(
        lambda: {
            "accident_count": 0,
            "fatalities": 0,
        }
    )

    for accident in query.all():
        item = road_map[accident.road_classification]
        item["accident_count"] += 1
        item["fatalities"] += total_fatalities(accident)
    return RoadClassResponse(
        data=[
            RoadClassCount(
                road_classification=name,
                accident_count=value["accident_count"],
                fatalities=value["fatalities"],
            )
            for name, value in sorted(
                road_map.items(),
                key=lambda x: x[1]["accident_count"],
                reverse=True,
            )
        ]
    )

# Weather
@router.get(
    "/by-weather",
    response_model=WeatherResponse,
)
def get_by_weather(
    district: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(
        Accident.weather_condition,
        func.count(Accident.id).label("count"),
    )
    query = apply_filters(
        query,
        district,
        year,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    )

    rows = (
        query.group_by(Accident.weather_condition)
        .order_by(func.count(Accident.id).desc())
        .all()
    )

    return WeatherResponse(
        data=[
            WeatherCount(
                weather_condition=row.weather_condition,
                count=row.count,
            )
            for row in rows
        ]
    )

# Light Condition
@router.get(
    "/by-light",
    response_model=LightResponse,
)
def get_by_light(
    district: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(
        Accident.light_condition,
        func.count(Accident.id).label("count"),
    )
    query = apply_filters(
        query,
        district,
        year,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    )

    rows = (
        query.group_by(Accident.light_condition)
        .order_by(func.count(Accident.id).desc())
        .all()
    )

    return LightResponse(
        data=[
            LightCount(
                light_condition=row.light_condition,
                count=row.count,
            )
            for row in rows
        ]
    )

# Police Station
@router.get(
    "/by-police-station",
    response_model=PoliceStationResponse,
)
def get_by_police_station(
    district: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = apply_filters(
        db.query(Accident),
        district,
        year,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    )

    stations = defaultdict(
        lambda: {
            "district": "",
            "accident_count": 0,
            "fatalities": 0,
        }
    )

    for accident in query.all():
        item = stations[accident.police_station]
        item["district"] = accident.district
        item["accident_count"] += 1
        item["fatalities"] += total_fatalities(accident)

    return PoliceStationResponse(
        data=[
            PoliceStationCount(
                police_station=name,
                district=value["district"],
                accident_count=value["accident_count"],
                fatalities=value["fatalities"],
            )
            for name, value in stations.items()
        ]
    )

# Casualty Breakdown
@router.get(
    "/casualty-breakdown",
    response_model=CasualtyResponse,
)
def get_casualty_breakdown(
    district: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    accidents = apply_filters(
        db.query(Accident),
        district,
        year,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    ).all()

    totals = {
        name: {
            "killed": 0,
            "grievous": 0,
            "minor": 0,
        }
        for name in CASUALTY_TYPES
    }

    for accident in accidents:
        for category, fields in CASUALTY_TYPES.items():
            for key, column in fields.items():
                totals[category][key] += getattr(accident, column) or 0

    return CasualtyResponse(
        data=[
            CasualtyBreakdown(
                category=name,
                **values,
            )
            for name, values in totals.items()
        ]
    )

# Top Dangerous Districts
@router.get(
    "/top-dangerous",
    response_model=TopDangerousResponse,
)
def get_top_dangerous(
    top_n: int = Query(10, ge=1, le=50),
    year: Optional[int] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Accident).filter(Accident.severity == SEVERITY_FATAL)
    query = apply_filters(
        query,
        None,
        year,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    )

    ranking = defaultdict(
        lambda: {
            "fatal_accidents": 0,
            "total_killed": 0,
        }
    )

    for accident in query.all():
        ranking[accident.district]["fatal_accidents"] += 1
        ranking[accident.district]["total_killed"] += total_fatalities(accident)

    rows = sorted(
        ranking.items(),
        key=lambda x: x[1]["fatal_accidents"],
        reverse=True,
    )[:top_n]

    return TopDangerousResponse(
        data=[
            DangerousDistrict(
                rank=index + 1,
                district=name,
                fatal_accidents=value["fatal_accidents"],
                total_killed=value["total_killed"],
            )
            for index, (name, value) in enumerate(rows)
        ]
    )

# Yearly Comparison
@router.get(
    "/yearly-comparison",
    response_model=YearlyResponse,
)
def get_yearly_comparison(
    district: Optional[str] = Query(None),
    road_classification: Optional[str] = Query(None),
    weather_condition: Optional[str] = Query(None),
    light_condition: Optional[str] = Query(None),
    collision_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = apply_filters(
        db.query(Accident),
        district,
        None,
        road_classification,
        weather_condition,
        light_condition,
        collision_type,
    )

    years = defaultdict(
        lambda: {
            "total_accidents": 0,
            "fatalities": 0,
            "grievous": 0,
        }
    )

    for accident in query.all():
        if not accident.accident_datetime:
            continue
        year = accident.accident_datetime.year
        years[year]["total_accidents"] += 1
        years[year]["fatalities"] += total_fatalities(accident)
        years[year]["grievous"] += total_grievous(accident)

    return YearlyResponse(
        data=[
            YearlyStats(
                year=year,
                total_accidents=value["total_accidents"],
                fatalities=value["fatalities"],
                grievous=value["grievous"],
            )
            for year, value in sorted(years.items())
        ]
    )
