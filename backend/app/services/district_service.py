from sqlalchemy import text


def get_district_hotspots(
    db
):

    query = text(
        """
        SELECT
            d.name,

            COUNT(a.id) AS accidents,

            COUNT(
                CASE
                    WHEN a.severity='Fatal'
                    THEN 1
                END
            ) AS fatal,

            ST_AsGeoJSON(
                d.geometry
            ) AS geometry


        FROM districts d


        LEFT JOIN accidents a

        ON ST_Contains(
            d.geometry,
            a.location
        )


        GROUP BY
            d.id,
            d.name


        ORDER BY
            accidents DESC;
        """
    )


    result = db.execute(
        query
    )


    return result.fetchall()