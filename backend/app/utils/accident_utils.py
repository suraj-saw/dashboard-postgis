from sqlalchemy import extract
from app.models.accident import Accident

def apply_filters(
    query,
    district=None,
    year=None,
    road_classification=None,
    weather_condition=None,
    light_condition=None,
    collision_type=None,
):

    if district:
        query = query.filter(Accident.district == district)
    if year:
        query = query.filter(extract("year", Accident.accident_datetime) == year)
    if road_classification:
        query = query.filter(Accident.road_classification == road_classification)
    if weather_condition:
        query = query.filter(Accident.weather_condition == weather_condition)
    if light_condition:
        query = query.filter(Accident.light_condition == light_condition)
    if collision_type:
        query = query.filter(Accident.collision_type == collision_type)
    return query

def total_fatalities(accident):
    return (
        (accident.drivers_killed or 0)
        + (accident.passengers_killed or 0)
        + (accident.pedestrians_killed or 0)
    )

def total_grievous(accident):
    return (
        (accident.drivers_grievous_injury or 0)
        + (accident.passengers_grievous_injury or 0)
        + (accident.pedestrians_grievous_injury or 0)
    )

def total_minor(accident):
    return (
        (accident.drivers_minor_injury or 0)
        + (accident.passengers_minor_injury or 0)
        + (accident.pedestrians_minor_injury or 0)
    )
