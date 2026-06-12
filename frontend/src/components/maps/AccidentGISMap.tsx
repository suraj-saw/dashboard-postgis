import { useEffect } from "react";

import Map from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";


import HotspotLayer from "./HotspotLayer";

import NearbySearch from "./NearbySearch";
import { useGIS } from "../../hooks/useGIS";




const AccidentGISMap = () => {


    const {

        hotspots,
        loading,
        fetchHotspots,
        fetchNearby

    } = useGIS();




    useEffect(() => {


        fetchHotspots();


    }, []);





    return (


        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">



            <div className="lg:col-span-3 h-[600px] rounded-xl overflow-hidden">


                <Map


                    initialViewState={{

                        longitude: 71.1924,
                        latitude: 22.2587,
                        zoom: 6

                    }}



                    mapStyle={
                        "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                    }


                >


                    {

                        hotspots &&

                        <HotspotLayer
                            data={hotspots}
                        />

                    }



                </Map>


            </div>





            <div>


                <NearbySearch

                    onSearch={(lat, lng, radius) => {


                        fetchNearby(
                            lat,
                            lng,
                            radius
                        );


                    }}

                />


                {

                    loading &&

                    <p className="mt-3">
                        Loading GIS data...
                    </p>

                }


            </div>



        </div>

    );


};



export default AccidentGISMap;