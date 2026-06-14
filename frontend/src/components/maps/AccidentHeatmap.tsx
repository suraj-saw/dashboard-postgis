import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAccidentHeatmap } from "../../hooks/useGIS";
import { useDistrictGIS } from "../../hooks/useDistrictGIS";

const AccidentHeatmap = () => {
  const { data, isLoading } = useAccidentHeatmap();
  const { data: districts } = useDistrictGIS();

  if (isLoading) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded-xl border border-[#E4E8F4] bg-[#F7F9FD] text-sm text-[#6B7299]">
        Loading density heatmap...
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
          zoom: 6.2 // Matched with Marker Map zoom
        }}
        // FIXED: Set map height to 100% to fill the 500px container
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        {/* State/District Boundaries overlay to match the styling */}
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
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  5, 1,
                  12, 0.5
                ]
              }}
            />
          </Source>
        )}

        {/* Heatmap Layer */}
        {data && (
          <Source id="accident-density" type="geojson" data={data}>
            <Layer
              id="accident-heat-layer"
              type="heatmap"
              paint={{
                "heatmap-weight": [
                  "interpolate",
                  ["linear"],
                  ["get", "intensity"],
                  0, 0,
                  100, 1
                ],
                "heatmap-intensity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  0, 1,
                  10, 3
                ],
                "heatmap-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  0, 5,
                  10, 40
                ],
                "heatmap-opacity": 0.8
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
};

export default AccidentHeatmap;
