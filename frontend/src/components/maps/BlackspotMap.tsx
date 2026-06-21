import Map, {
  Source,
  Layer,
  NavigationControl
} from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

import { useAccidentBlackspots } from "../../hooks/useGIS";
import { useDistrictGIS } from "../../hooks/useDistrictGIS";


const satelliteMapStyle: any = {
  version: 8,

  sources: {

    "esri-satellite": {

      type: "raster",

      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      ],

      tileSize: 256,

      attribution:
        "Tiles © Esri"

    }

  },


  layers: [

    {
      id: "esri-satellite-layer",

      type: "raster",

      source: "esri-satellite",

      minzoom: 0,

      maxzoom: 22
    }

  ]

};



const blackspotLayer: any = {

  id: "blackspot-layer",

  type: "circle",

  paint: {


    "circle-radius": [

      "interpolate",
      ["linear"],

      ["get", "blackspot_score"],


      10,
      8,

      100,
      20,

      300,
      40
    ],



    "circle-color": [

      "interpolate",
      ["linear"],

      ["get", "blackspot_score"],


      20,
      "#ffff00",

      100,
      "#ff8c00",

      250,
      "#ff0000"
    ],


    "circle-opacity": 0.8,


    "circle-stroke-width": 2,


    "circle-stroke-color": "#ffffff"
  }

};




export default function BlackspotMap() {


  const {
    data,
    isLoading
  } = useAccidentBlackspots();



  const {
    data: districts
  } = useDistrictGIS();




  if (isLoading) {

    return (
      <div className="h-[500px] flex items-center justify-center">

        Loading Satellite Blackspots...

      </div>
    );

  }





  return (


    <div

      className="w-full rounded-xl overflow-hidden border border-[#E4E8F4]"

      style={{height:"500px"}}

    >


      <Map


        initialViewState={{

          longitude: 71.1924,

          latitude: 22.2587,

          zoom: 6.2

        }}



        style={{

          width:"100%",

          height:"100%"

        }}


        mapStyle={satelliteMapStyle}

      >


        <NavigationControl position="top-right"/>




        {/* District boundary overlay */}


        {
          districts && (

            <Source

              id="district-outline"

              type="geojson"

              data={districts}

            >


              <Layer

                id="district-line"

                type="line"

                paint={{


                  "line-color":"#ffffff",


                  "line-width":2

                }}

              />


            </Source>

          )
        }




        {/* PostGIS Blackspots */}


        {
          data && (

            <Source

              id="blackspots"

              type="geojson"

              data={data}

            >


              <Layer {...blackspotLayer}/>


            </Source>

          )
        }


      </Map>


    </div>

  );

}