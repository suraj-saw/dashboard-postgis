export interface DashboardFilters {
  district?: string;
  year?: string;
  severity?: string;
  road_classification?: string;
  weather_condition?: string;
  light_condition?: string;
  collision_type?: string;
}


export interface SummaryResponse {
  total_accidents: number;
  total_fatalities: number;
  total_grievous: number;
  total_minor: number;
  total_damage_only: number;
  total_vehicles: number;
  districts_covered: number;
  police_stations: number;
}

export interface DistrictCount {
  district: string;
  accident_count: number;
  fatalities: number;
}

export interface SeverityCount {
  severity: string;
  count: number;
}

export interface TimeSeriesPoint {
  year: number;
  month: number;
  month_label: string;
  accident_count: number;
  fatalities: number;
}

export interface NamedCount {
  name: string;
  count: number;
}

export interface RoadCount {
  road_classification: string;
  accident_count: number;
  fatalities: number;
}

export interface CasualtyBreakdown {
  category: string;
  killed: number;
  grievous: number;
  minor: number;
}

export interface DangerousDistrict {
  rank: number;
  district: string;
  fatal_accidents: number;
  total_killed: number;
}

export interface HeatmapPoint {
  accident_id: string;
  latitude: number;
  longitude: number;
  severity: string;
  district: string;
}

export interface DashboardData {
  summary: SummaryResponse;
  districts: DistrictCount[];
  severity: SeverityCount[];
  timeSeries: TimeSeriesPoint[];
  violations: NamedCount[];
  weather: NamedCount[];
  light: NamedCount[];
  roads: RoadCount[];
  casualty: CasualtyBreakdown[];
  dangerous: DangerousDistrict[];
  heatmap: HeatmapPoint[];
}