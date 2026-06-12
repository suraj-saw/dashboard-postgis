import axios from "./axios";
import type {
  DashboardFilters,
  DashboardData,
  SummaryResponse,
  DistrictCount,
  SeverityCount,
  TimeSeriesPoint,
  RoadCount,
  CasualtyBreakdown,
  DangerousDistrict,
  HeatmapPoint,
} from "../types/dashboard";

/** Build query-string from the filter keys you pass. */
function buildParams(
  filters: DashboardFilters,
  keys: Array<keyof DashboardFilters>
): string {
  const params = new URLSearchParams();
  keys.forEach((key) => {
    const value = filters[key];
    if (value && value !== "all") params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** All filterable keys (excluding severity which is special for heatmap). */
const ALL_KEYS: Array<keyof DashboardFilters> = [
  "district",
  "year",
  "road_classification",
  "weather_condition",
  "light_condition",
  "collision_type",
];

const ALL_KEYS_NO_DISTRICT: Array<keyof DashboardFilters> = [
  "year",
  "road_classification",
  "weather_condition",
  "light_condition",
  "collision_type",
];

const ALL_KEYS_NO_YEAR: Array<keyof DashboardFilters> = [
  "district",
  "road_classification",
  "weather_condition",
  "light_condition",
  "collision_type",
];

export interface FilterOptions {
  road_classifications: string[];
  weather_conditions: string[];
  light_conditions: string[];
  collision_types: string[];
}

export async function fetchFilterOptions(): Promise<FilterOptions> {
  const res = await axios.get<FilterOptions>("/dashboard/filter-options");
  return res.data;
}

export async function fetchDashboard(
  filters: DashboardFilters
): Promise<DashboardData> {
  const allFilters = buildParams(filters, ALL_KEYS);
  const noDistrict = buildParams(filters, ALL_KEYS_NO_DISTRICT);
  const noYear = buildParams(filters, ALL_KEYS_NO_YEAR);
  const heatmapFilters = buildParams(filters, [
    ...ALL_KEYS,
    "severity",
  ]);

  const [
    summary,
    districts,
    severity,
    timeSeries,
    violations,
    weather,
    light,
    roads,
    casualty,
    dangerous,
    heatmap,
  ] = await Promise.all([
    axios.get<SummaryResponse>(`/dashboard/summary${allFilters}`),
    axios.get<{ data: DistrictCount[] }>(`/dashboard/by-district${noDistrict}`),
    axios.get<{ data: SeverityCount[] }>(
      `/dashboard/by-severity${allFilters}`
    ),
    axios.get<{ data: TimeSeriesPoint[] }>(
      `/dashboard/time-series${noYear}`
    ),
    axios.get<{ data: Array<{ traffic_violation: string; count: number }> }>(
      `/dashboard/by-violation${allFilters}`
    ),
    axios.get<{ data: Array<{ weather_condition: string; count: number }> }>(
      `/dashboard/by-weather${allFilters}`
    ),
    axios.get<{ data: Array<{ light_condition: string; count: number }> }>(
      `/dashboard/by-light${allFilters}`
    ),
    axios.get<{ data: RoadCount[] }>(`/dashboard/by-road${noDistrict}`),
    axios.get<{ data: CasualtyBreakdown[] }>(
      `/dashboard/casualty-breakdown${allFilters}`
    ),
    axios.get<{ data: DangerousDistrict[] }>(
      `/dashboard/top-dangerous${noDistrict}`
    ),
    axios.get<{ total: number; data: HeatmapPoint[] }>(
      `/dashboard/heatmap${heatmapFilters}`
    ),
  ]);

  return {
    summary: summary.data,
    districts: districts.data.data,
    severity: severity.data.data,
    timeSeries: timeSeries.data.data,
    violations: violations.data.data.map((v) => ({
      name: v.traffic_violation || "Unknown",
      count: v.count,
    })),
    weather: weather.data.data.map((w) => ({
      name: w.weather_condition || "Unknown",
      count: w.count,
    })),
    light: light.data.data.map((l) => ({
      name: l.light_condition || "Unknown",
      count: l.count,
    })),
    roads: roads.data.data,
    casualty: casualty.data.data,
    dangerous: dangerous.data.data,
    heatmap: heatmap.data.data,
  };
}
