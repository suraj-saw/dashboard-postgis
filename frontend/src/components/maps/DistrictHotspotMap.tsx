import {
    useState
} from "react";

import Map, {
    Source,
    Layer,
    Popup
} from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

import { useDistrictGIS } from "../../hooks/useDistrictGIS";


const DistrictHotspotMap = () => {


    const {
        data,
        loading
    } = useDistrictGIS();


    const [
        popup,
        setPopup
    ] = useState<any>(null);



    return (

        <div
            className="w-full rounded-xl overflow-hidden border border-[#E4E8F4]"
            style={{
                height: "500px"
            }}
        >


            {
                loading ? (

                    <div className="flex h-full w-full items-center justify-center">

                        Loading district hotspots...

                    </div>

                ) : (

                    <Map

                        initialViewState={{

                            longitude: 71.1924,

                            latitude: 22.2587,

                            zoom: 6,

                        }}


                        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"


                        interactiveLayerIds={[
                            "district-hotspot"
                        ]}


                        onMouseMove={(event) => {


                            const feature =
                                event.features?.[0];


                            if (!feature) {

                                setPopup(null);

                                return;

                            }


                            setPopup({

                                longitude:
                                    event.lngLat.lng,

                                latitude:
                                    event.lngLat.lat,


                                district:
                                    feature.properties?.district,


                                accidents:
                                    feature.properties?.accidents,


                                fatal:
                                    feature.properties?.fatal,

                            });


                        }}


                        onMouseLeave={() => {

                            setPopup(null);

                        }}


                        style={{

                            width: "100%",

                            height: "100%"

                        }}

                    >


                        <Source
                            id="districts"
                            type="geojson"
                            data={data}
                        >


                            <Layer

                                id="district-hotspot"

                                type="fill"


                                paint={{


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

                                }}

                            />



                            <Layer

                                id="district-border"

                                type="line"


                                paint={{

                                    "line-color": "#000",

                                    "line-width": 1

                                }}

                            />


                        </Source>



                        {

                            popup && (

                                <Popup

                                    longitude={
                                        popup.longitude
                                    }

                                    latitude={
                                        popup.latitude
                                    }


                                    closeButton={false}


                                    closeOnClick={false}

                                >


                                    <div
                                        style={{
                                            fontSize: "13px"
                                        }}
                                    >


                                        <b>
                                            {popup.district}
                                        </b>


                                        <br />


                                        Accidents:

                                        {" "}

                                        {popup.accidents}


                                        <br />


                                        Fatal:

                                        {" "}

                                        {popup.fatal}


                                    </div>


                                </Popup>

                            )

                        }


                    </Map>

                )

            }


        </div>

    );

};


export default DistrictHotspotMap;