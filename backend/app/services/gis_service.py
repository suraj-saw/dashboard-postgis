import json
from sqlalchemy import text

def get_accident_markers(db):

    query = text(
        """
        SELECT

            id,

            latitude,

            longitude,

            severity,

            road_name,

            weather_condition

        FROM accidents;
        """
    )


    result = db.execute(
        query
    )


    return result.fetchall()

    query = text(
        """
        SELECT

            id,

            latitude,

            longitude,

            severity,

            road_type,

            weather_condition

        FROM accidents;
        """
    )


    result = db.execute(
        query
    )


    return result.fetchall()

def get_accident_heatmap(db):

    query = text(
        """
            WITH grid_clusters AS (
            SELECT
                ST_Centroid(
                    ST_Collect(location)
                ) AS center_point,
                COUNT(*) AS intensity
            FROM accidents
            GROUP BY
                ST_SnapToGrid(
                    location,
                    0.05
                )
            )

            SELECT json_build_object(
                'type',
                'FeatureCollection',

                'features',
                json_agg(
                    json_build_object(

                        'type',
                        'Feature',

                        'geometry',
                        ST_AsGeoJSON(center_point)::json,

                    'properties',
                    json_build_object(
                        'intensity',
                        intensity
                    )
                )
            )
        ) AS geojson

        FROM grid_clusters;
        """
    )


    result = db.execute(query).scalar()

    return result


def get_accident_blackspots(db):

    query = text("""
        WITH clustered_accidents AS (

            SELECT
                id,
                severity,
                location,


                ST_ClusterDBSCAN(

                    ST_Transform(
                        location,
                        3857
                    ),

                    eps := 10000,

                    minpoints := 5

                ) OVER () AS cluster_id


            FROM accidents
        ),


        valid_clusters AS (

            SELECT

                cluster_id,


                COUNT(*) AS accident_count,


                SUM(

                    CASE


                        WHEN severity = 'Fatal'
                            THEN 5


                        WHEN severity = 'Severe'
                            THEN 3


                        ELSE 1


                    END


                ) AS blackspot_score,


                ST_Centroid(

                    ST_Collect(location)

                ) AS center_point



            FROM clustered_accidents



            WHERE cluster_id IS NOT NULL



            GROUP BY cluster_id



            HAVING COUNT(*) >= 5
        )



        SELECT

            cluster_id,

            accident_count,

            blackspot_score,


            ST_AsGeoJSON(

                center_point

            ) AS geometry



        FROM valid_clusters



        ORDER BY blackspot_score DESC;

    """)


    result = db.execute(query)


    features = []


    for row in result:


        features.append({

            "type": "Feature",


            "geometry": json.loads(row.geometry),


            "properties": {


                "cluster_id": row.cluster_id,


                "accidents": row.accident_count,


                "blackspot_score": row.blackspot_score

            }

        })


    return {

        "type": "FeatureCollection",

        "features": features

    }

    query = text("""
        WITH clustered_accidents AS (

            SELECT
                id,
                severity,
                location,

                ST_ClusterDBSCAN(
                    location
                    eps := 0.01,
                    minpoints := 3
                ) OVER () AS cluster_id

            FROM accidents
        ),


        valid_clusters AS (

            SELECT
                cluster_id,

                COUNT(*) AS accident_count,


                SUM(
                    CASE

                        WHEN severity = 'Fatal'
                            THEN 5

                        WHEN severity = 'Severe'
                            THEN 3

                        ELSE 1

                    END
                ) AS blackspot_score,


                ST_Centroid(
                    ST_Collect(location)
                ) AS center_point


            FROM clustered_accidents


            WHERE cluster_id IS NOT NULL


            GROUP BY cluster_id


            HAVING COUNT(*) >= 5
        )


        SELECT

            cluster_id,

            accident_count,

            blackspot_score,


            ST_AsGeoJSON(
                center_point
            ) AS geometry


        FROM valid_clusters


        ORDER BY blackspot_score DESC;
    """)


    result = db.execute(query)


    features = []


    for row in result:

        features.append({

            "type": "Feature",


            "geometry": json.loads(row.geometry),


            "properties": {

                "cluster_id": row.cluster_id,


                "accidents": row.accident_count,


                "blackspot_score": row.blackspot_score
            }
        })


    return {

        "type": "FeatureCollection",

        "features": features
    }