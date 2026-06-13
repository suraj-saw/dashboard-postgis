import {
    useEffect,
    useRef
} from "react";


import maplibregl from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";


import { useDistrictGIS } from "../../hooks/useDistrictGIS";



const DistrictHotspotMap = () => {


    const mapContainer = useRef<HTMLDivElement>(null);


    const {
        data,
        loading
    } = useDistrictGIS();



    useEffect(() => {


        if (
            !mapContainer.current ||
            loading ||
            !data
        ) {

            return;

        }



        const map = new maplibregl.Map({

            container: mapContainer.current,

            style:
                "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",

            center: [
                71.1924,
                22.2587
            ],
            

            zoom: 6,

        });



        map.on(
            "load",
            () => {


                map.addSource(
                    "districts",
                    {

                        type: "geojson",

                        data: data

                    }
                );



                map.addLayer(
                    {

                        id: "district-hotspot",

                        type: "fill",

                        source: "districts",


                        paint: {


                            "fill-color": [

                                "interpolate",

                                ["linear"],

                                [
                                    "get",
                                    "accidents"
                                ],

                                0,
                                "#ffffcc",

                                50,
                                "#fd8d3c",

                                150,
                                "#800026"

                            ],


                            "fill-opacity": 0.7

                        }

                    }
                );



                map.addLayer(
                    {

                        id: "district-border",

                        type: "line",

                        source: "districts",


                        paint: {

                            "line-color": "#000",

                            "line-width": 1

                        }

                    }
                );

            }

        );


        return () => {

            map.remove();

        };


    }, [
        data,
        loading
    ]);



    return (

        <div
            // className="w-full h-[500px] rounded-xl overflow-hidden"
            ref={mapContainer}
            style={{
                width: "100%",
                height: "500px",
            }}
        />

    );

};


export default DistrictHotspotMap;