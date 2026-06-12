import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";


interface HotspotLayerProps {
    data: FeatureCollection;
}


const HotspotLayer = ({ data }: HotspotLayerProps) => {

    return (
        <Source
            id="accident-hotspots"
            type="geojson"
            data={data}
        >

            {/* Heatmap Layer */}
            <Layer
                id="accident-heatmap"
                type="heatmap"
                paint={{
                    "heatmap-weight": [
                        "interpolate",
                        ["linear"],
                        ["get", "severity"],
                        1, 0.2,
                        5, 1
                    ],

                    "heatmap-intensity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        5, 1,
                        12, 3
                    ],

                    "heatmap-radius": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        5, 10,
                        12, 25
                    ],

                    "heatmap-opacity": 0.7
                }}
            />


            {/* Accident Point Layer */}
            <Layer
                id="accident-points"
                type="circle"
                paint={{

                    "circle-radius": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        6, 3,
                        14, 8
                    ],


                    "circle-color": [
                        "match",
                        ["get", "severity"],

                        1,
                        "#22c55e",

                        2,
                        "#84cc16",

                        3,
                        "#eab308",

                        4,
                        "#f97316",

                        5,
                        "#dc2626",

                        "#64748b"
                    ],


                    "circle-opacity": 0.85
                }}
            />


        </Source>
    );
};


export default HotspotLayer;