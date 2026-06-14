import { useEffect, useState } from "react";
import axios from "../api/axios";

export const useAccidentMarkers = () => {
  const [accidents, setAccidents] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // FIXED: Hit the correct endpoint
        const response = await axios.get("/gis/accident-markers");
        
        console.log("Accident markers:", response.data);
        setAccidents(response.data);
      } catch (error) {
        console.error("Failed to fetch accident markers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    accidents,
    loading
  };
};
