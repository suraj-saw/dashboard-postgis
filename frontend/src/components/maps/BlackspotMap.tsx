import Map, {
  Source,
  Layer,
  NavigationControl
} from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

import { useAccidentBlackspots } from "../../hooks/useGIS";
import { useDistrictGIS } from "../../hooks/useDistrictGIS";

const blackspotLayer: any = {
  id: "blackspot-layer",
  type: "circle",
  paint: {
      // size increases with danger
      "circle-radius": [
          "interpolate",
          ["linear"],
          ["get", "blackspot_score"],
          10, 8,
          100, 20,
          300, 40
      ],
      // color indicates danger level
      "circle-color": [
          "interpolate",
          ["linear"],
          ["get", "blackspot_score"],
          20, "#ffff00",
          100, "#ff8c00",
          250, "#ff0000"
      ],
      "circle-opacity": 0.75,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff"
  }
};

export default function BlackspotMap() {
  const { data, isLoading } = useAccidentBlackspots();
  const { data: districts } = useDistrictGIS();

  if (isLoading) {
      return (
          <div className="flex h-[500px] w-full items-center justify-center rounded-xl border border-[#E4E8F4] bg-[#F7F9FD] text-sm text-[#6B7299]">
              Loading Blackspots...
          </div>
      );
  }

  return (
      <div 
          className="w-full rounded-xl overflow-hidden border border-[#E4E8F4]" 
          style={{ height: "500px" }}
      >
          <Map
              initialViewState={{
                  longitude: 71.1924,
                  latitude: 22.2587,
                  zoom: 6.2
              }}
              style={{ width: "100%", height: "100%" }}
              mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          >
              <NavigationControl position="top-right" />

              {/* State/District Boundaries overlay for consistency */}
              {districts && (
                  <Source id="district-outline" type="geojson" data={districts}>
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
                                  "interpolate", ["linear"], ["zoom"],
                                  5, 1,
                                  12, 0.5
                              ]
                          }}
                      />
                  </Source>
              )}

              {data && (
                  <Source id="blackspot-source" type="geojson" data={data}>
                      <Layer {...blackspotLayer} />
                  </Source>
              )}
          </Map>
      </div>
  );
}
