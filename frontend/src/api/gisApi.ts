import axios from "./axios";



// ===============================
// GeoJSON Types
// ===============================


export interface GeoJSONFeatureCollection {

    type: "FeatureCollection";


    features: Array<{

        type: "Feature";


        geometry: {

            type: "Point";

            coordinates: [
                number,
                number
            ];

        };


        properties: {

            id?: number;

            district?: string;

            severity?: number;

            accident_count?: number;

            [key:string]: unknown;

        };


    }>;

}






// ===============================
// Nearby Search Types
// ===============================


export interface NearbyAccident {

    id:number;

    latitude:number;

    longitude:number;

    distance_meters:number;

    district?:string;

    severity?:number;

}








// =====================================
// Main PostGIS GeoJSON Endpoint
// Used by MapLibre
// =====================================


export async function getAccidentHotspots(

    params?:Record<string,string | number>

):Promise<GeoJSONFeatureCollection>{



    const res =
        await axios.get(
            "/gis/geojson",
            {
                params
            }
        );



    return res.data;


}








// =====================================
// ST_DWithin Nearby Search
// =====================================


export async function getNearbyAccidents(

    latitude:number,

    longitude:number,

    radius=1000


):Promise<GeoJSONFeatureCollection>{



    const res =
        await axios.get(

            "/gis/nearby",

            {

                params:{

                    latitude,

                    longitude,

                    radius

                }

            }

        );




    /*
        backend currently returns:
        
        {
            data:[...]
        }

        convert to GeoJSON for MapLibre
    */


    return {


        type:"FeatureCollection",


        features:


            res.data.data.map(

                (item:NearbyAccident)=>({

                    type:"Feature",


                    geometry:{


                        type:"Point",

                        coordinates:[

                            item.longitude,

                            item.latitude

                        ]


                    },



                    properties:{


                        id:item.id,


                        district:item.district,


                        severity:item.severity,


                        distance_meters:
                            item.distance_meters


                    }


                })

            )


    };


}