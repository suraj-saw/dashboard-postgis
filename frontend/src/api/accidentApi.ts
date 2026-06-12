import axios from "./axios";

export interface AccidentListParams {
  page?: number;
  limit?: number;
  district?: string;
  year?: string;
  severity?: string;
}

// Placeholder – extend as backend grows
export async function fetchDistricts(): Promise<string[]> {
  const res = await axios.get<{ data: Array<{ district: string }> }>(
    "/dashboard/by-district"
  );
  return res.data.data.map((d) => d.district).filter(Boolean);
}