import { useState, useCallback, useEffect } from "react";
import type { FeatureCollection } from "geojson";
import { getAccidentHotspots, getNearbyAccidents } from "../api/gisApi";
// Use your pre-configured instance instead of the raw package!
import axios from "../api/axios";

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

// Replaced react-query with standard React state to prevent provider crashes
export const useAccidentHeatmap = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const response = await axios.get("/gis/heatmap");
        setData(response.data);
      } catch (error) {
        console.error("Failed to load heatmap data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeatmap();
  }, []);

  return { data, isLoading };
};

export const useAccidentBlackspots = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlackspots = async () => {
      try {
        const response = await axios.get("/gis/blackspots");
        setData(response.data);
      } catch (error) {
        console.error("Failed to load blackspots", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlackspots();
  }, []);

  return { data, isLoading };
};
