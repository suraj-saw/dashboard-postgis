import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";

interface HotspotLayerProps {
  data: FeatureCollection;
}

const HotspotLayer = ({ data }: HotspotLayerProps) => {
  return (
    <Source id="accident-points" type="geojson" data={data}>
      {/* Heatmap layer */}
      <Layer
        id="accident-heatmap"
        type="heatmap"
        paint={{
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "severity_weight"],
            0, 0,
            5, 1,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5, 0.6,
            12, 2,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(33,102,172,0)",
            0.2, "rgb(103,169,207)",
            0.4, "rgb(209,229,240)",
            0.6, "rgb(253,219,199)",
            0.8, "rgb(239,138,98)",
            1, "rgb(178,24,43)",
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5, 8,
            12, 25,
          ],
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6, 0.7,
            12, 0.2,
          ],
        }}
      />

      {/* Individual point layer (visible at higher zoom) */}
      <Layer
        id="accident-circles"
        type="circle"
        minzoom={9}
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9, 3,
            14, 8,
          ],
          "circle-color": [
            "match",
            ["get", "severity"],
            "Fatal",           "#dc2626",
            "Grievous Injury", "#f97316",
            "Minor Injury",    "#eab308",
            "Damage Only",     "#22c55e",
            "#64748b",
          ],
          "circle-opacity": 0.85,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        }}
      />
    </Source>
  );
};

export default HotspotLayer;
