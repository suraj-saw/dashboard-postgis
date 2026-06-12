import { useState } from "react";

import type { FeatureCollection } from "geojson";

import {
    getAccidentHotspots,
    getNearbyAccidents
} from "../api/gisApi";



export const useGIS = () => {


    const [hotspots, setHotspots] =
        useState<FeatureCollection | null>(null);


    const [nearbyAccidents, setNearbyAccidents] =
        useState<FeatureCollection | null>(null);



    const [loading, setLoading] =
        useState<boolean>(false);



    const [error, setError] =
        useState<string | null>(null);





    // -------------------------------
    // Load all accident GIS points
    // -------------------------------

    const fetchHotspots = async () => {


        try {


            setLoading(true);

            setError(null);



            const response =
                await getAccidentHotspots();



            setHotspots(response);



        }


        catch(error){


            console.error(
                "GIS hotspot fetch error:",
                error
            );


            setError(
                "Unable to load accident hotspots"
            );


        }


        finally{


            setLoading(false);


        }



    };







    // -------------------------------
    // Nearby accident search
    // -------------------------------


    const fetchNearby = async(

        latitude:number,
        longitude:number,
        radius:number

    )=>{



        try{


            setLoading(true);

            setError(null);




            const response =
                await getNearbyAccidents(
                    latitude,
                    longitude,
                    radius
                );



            setNearbyAccidents(
                response
            );



        }


        catch(error){


            console.error(
                "Nearby GIS fetch error:",
                error
            );


            setError(
                "Unable to load nearby accidents"
            );


        }


        finally{


            setLoading(false);


        }


    };







    return {


        hotspots,

        nearbyAccidents,

        loading,

        error,


        fetchHotspots,

        fetchNearby


    };


};