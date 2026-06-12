import { useState, useEffect, useCallback, useRef } from "react";
import { fetchDashboard } from "../api/dashboardApi";
import type { DashboardFilters, DashboardData } from "../types/dashboard";

const FALLBACK: DashboardData = {
  summary: {
    total_accidents: 0,
    total_fatalities: 0,
    total_grievous: 0,
    total_minor: 0,
    total_damage_only: 0,
    total_vehicles: 0,
    districts_covered: 0,
    police_stations: 0,
  },
  districts: [],
  severity: [],
  timeSeries: [],
  violations: [],
  weather: [],
  light: [],
  roads: [],
  casualty: [],
  dangerous: [],
  heatmap: [],
};

export function useDashboard(filters: DashboardFilters) {
  const [data, setData] = useState<DashboardData>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasData = useRef(false);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchDashboard(filters)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          hasData.current = true;
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  useEffect(() => {
    const cancel = load();
    return cancel;
  }, [load]);

  return { data, loading, error, refetch: load, hasData: hasData.current };
}
