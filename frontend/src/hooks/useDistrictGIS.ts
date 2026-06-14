import { useEffect, useState } from "react";
import axios from "../api/axios";

export const useDistrictGIS = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistrictData = async () => {
      try {
        // Use the centralized axios instance instead of fetch()
        const response = await axios.get("/gis/district-hotspots");
        
        console.log("DISTRICT GEOJSON:", response.data);
        setData(response.data);
      } catch (error) {
        console.error("District GIS loading failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDistrictData();
  }, []);

  return {
    data,
    loading
  };
};
