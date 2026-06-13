import { useState, useCallback } from "react";
import type { FeatureCollection } from "geojson";
import { getAccidentHotspots, getNearbyAccidents } from "../api/gisApi";

export const useGIS = () => {
  const [hotspots, setHotspots] = useState<FeatureCollection | null>(null);
  const [nearbyAccidents, setNearbyAccidents] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHotspots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccidentHotspots();
      setHotspots(data);
    } catch (err) {
      console.error("GIS hotspot fetch error:", err);
      setError("Unable to load accident hotspots. Check backend connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNearby = useCallback(async (
    latitude: number,
    longitude: number,
    radius: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNearbyAccidents(latitude, longitude, radius);
      // Merge nearby results into hotspots so they show on the map
      setHotspots(data);
      setNearbyAccidents(data);
    } catch (err) {
      console.error("Nearby GIS fetch error:", err);
      setError("Unable to load nearby accidents.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    hotspots,
    nearbyAccidents,
    loading,
    error,
    fetchHotspots,
    fetchNearby,
  };
};