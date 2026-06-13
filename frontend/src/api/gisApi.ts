import axios from "./axios";
import type { FeatureCollection } from "geojson";

export interface NearbyAccident {
  id: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
  district?: string;
  severity?: string;
}

// Fetch all accident points as GeoJSON
export async function getAccidentHotspots(
  params?: Record<string, string | number>
): Promise<FeatureCollection> {
  const res = await axios.get<FeatureCollection>("/gis/geojson", { params });
  return res.data;
}

// Nearby accident search using PostGIS ST_DWithin
export async function getNearbyAccidents(
  latitude: number,
  longitude: number,
  radius = 1000
): Promise<FeatureCollection> {
  const res = await axios.get<{
    total: number;
    data: NearbyAccident[];
  }>("/gis/nearby", {
    params: { latitude, longitude, radius },
  });

  return {
    type: "FeatureCollection",
    features: res.data.data.map((item) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [item.longitude, item.latitude],
      },
      properties: {
        id: item.id,
        district: item.district,
        severity: item.severity,
        severity_weight: severityToWeight(item.severity),
        distance_meters: item.distance_meters,
      },
    })),
  };
}

function severityToWeight(severity?: string): number {
  switch (severity) {
    case "Fatal": return 1.0;
    case "Grievous Injury": return 0.7;
    case "Minor Injury": return 0.4;
    case "Damage Only": return 0.2;
    default: return 0.3;
  }
}