import { useEffect, useState } from "react";


const API_URL = import.meta.env.VITE_API_URL;


export const useDistrictGIS = () => {

    const [data, setData] = useState<any>(null);

    const [loading, setLoading] = useState(true);



    useEffect(() => {


        const fetchDistrictData = async () => {

            try {

                const response = await fetch(
                    `${API_URL}/gis/district-hotspots`
                );


                const json = await response.json();
                console.log(
                    "DISTRICT GEOJSON:",
                    json
                );

                setData(json);


            } catch (error) {

                console.error(
                    "District GIS loading failed",
                    error
                );

            } finally {

                setLoading(false);

            }

        };


        fetchDistrictData();


    }, []);



    return {
        data,
        loading
    };
};