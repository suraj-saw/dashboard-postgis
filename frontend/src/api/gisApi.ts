import axios from "./axios";


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
    properties: Record<string, unknown>;
  }>;
}


export interface NearbyAccident {
  id: number;
  latitude: number;
  longitude: number;
  distance_meters: number;
  district?: string;
  severity?: string;
}


export interface Hotspot {
  latitude: number;
  longitude: number;
  accident_count: number;
}


export async function fetchAccidentGeoJSON(
  params?: Record<string, string | number>
): Promise<GeoJSONFeatureCollection> {

  const res = await axios.get(
    "/gis/geojson",
    { params }
  );

  return res.data;
}


export async function fetchNearbyAccidents(
  latitude: number,
  longitude: number,
  radius = 1000
): Promise<NearbyAccident[]> {

  const res = await axios.get(
    "/gis/nearby",
    {
      params: {
        latitude,
        longitude,
        radius,
      },
    }
  );

  return res.data.data;
}


export async function fetchHotspots(): Promise<Hotspot[]> {

  const res = await axios.get(
    "/gis/hotspots"
  );

  return res.data.data;
}