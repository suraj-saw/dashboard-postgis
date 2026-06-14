import { useState } from "react";

import Map, {
    Source,
    Layer,
    Popup
} from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

import { useAccidentMarkers } from "../../hooks/useAccidentMarkers";
import { useDistrictGIS } from "../../hooks/useDistrictGIS";


const AccidentMarkerMap = () => {


    const {
        accidents,
        loading
    } = useAccidentMarkers();


    const {
        data: districts
    } = useDistrictGIS();



    const [
        selected,
        setSelected
    ] = useState<any>(null);



    if (loading) {

        return (
            <div
                className="
        h-[500px]
        flex
        items-center
        justify-center
        "
            >
                Loading accidents...
            </div>
        );

    }



    return (

        <div
            className="
      w-full
      rounded-xl
      overflow-hidden
      border
      border-[#E4E8F4]
      "

            style={{
                height: "500px"
            }}
        >


            <Map

                initialViewState={{

                    longitude: 71.1924,

                    latitude: 22.2587,

                    zoom: 6.2

                }}


                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"


                interactiveLayerIds={[
                    "accident-points"
                ]}


                onClick={(event) => {


                    const feature =
                        event.features?.[0];


                    if (!feature) {
                        return;
                    }


                    setSelected({

                        longitude:
                            event.lngLat.lng,

                        latitude:
                            event.lngLat.lat,


                        ...feature.properties

                    });


                }}


                style={{
                    width: "100%",
                    height: "100%"
                }}


            >


                {
                    districts && (

                        <Source
                            id="district-outline"
                            type="geojson"
                            data={districts}
                        >


                            <Layer

                                id="district-fill"

                                type="fill"

                                paint={{

                                    "fill-color": "#f8fafc",

                                    "fill-opacity": 0.15

                                }}

                            />



                            <Layer

                                id="district-lines"

                                type="line"

                                paint={{

                                    "line-color": "#334155",

                                    "line-width": [

                                        "interpolate",

                                        ["linear"],

                                        ["zoom"],


                                        5,
                                        1,


                                        12,
                                        0.5

                                    ]

                                }}

                            />


                        </Source>

                    )
                }



                {
                    accidents && (

                        <Source
                            id="accidents"
                            type="geojson"
                            data={accidents}
                        >

                            <Layer

                                id="accident-points"

                                type="circle"


                                paint={{


                                    "circle-radius": [

                                        "interpolate",

                                        ["linear"],

                                        ["zoom"],


                                        5,
                                        2.2,


                                        8,
                                        2,


                                        12,
                                        2.3,
                                        16, 2.6

                                    ],



                                    "circle-color": [

                                        "match",

                                        ["get", "severity"],


                                        "Fatal",
                                        "#dc2626",


                                        "Grievous Injury",
                                        "#f97316",


                                        "Minor Injury",
                                        "#2563eb",


                                        "Damage Only",
                                        "#22c55e",


                                        "#64748b"

                                    ],



                                    "circle-opacity": [

                                        "interpolate",

                                        ["linear"],

                                        ["zoom"],


                                        5,
                                        0.55,


                                        10,
                                        0.8,
                                        15,
                                        1,

                                    ],



                                    "circle-stroke-width": 0

                                }}

                            />


                        </Source>

                    )

                }



                {
                    selected && (

                        <Popup

                            longitude={
                                selected.longitude
                            }

                            latitude={
                                selected.latitude
                            }


                            onClose={() => setSelected(null)}

                        >

                            <div
                                style={{
                                    fontSize: "13px"
                                }}
                            >

                                <b>
                                    Accident Details
                                </b>

                                <br />

                                Severity: {selected.severity}

                                <br />

                                Road: {selected.road_name}

                                <br />

                                Weather: {selected.weather_condition}


                            </div>

                        </Popup>

                    )

                }


            </Map>

        </div>

    );

};


export default AccidentMarkerMap;