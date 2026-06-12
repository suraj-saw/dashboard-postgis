import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DistrictCount } from "../../types/dashboard";

interface Props {
  data: DistrictCount[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#E4E8F4] bg-white px-3 py-2 shadow-lg text-xs">
      <p className="mb-1 font-semibold text-[#6B7299]">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}:{" "}
          <span className="font-bold">{p.value.toLocaleString("en-IN")}</span>
        </p>
      ))}
    </div>
  );
};

export function StateChart({
  data,
  title = "Accidents by district (top 10)",
}: Props) {
  const top = data.slice(0, 10);
  const barHeight = 40;
  const height = Math.max(top.length * barHeight + 60, 280);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={top}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#EDF0F8"
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9BA3C2" }}
          />
          <YAxis
            type="category"
            dataKey="district"
            width={110}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7299" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="accident_count"
            name="Accidents"
            radius={[0, 6, 6, 0]}
            maxBarSize={22}
          >
            {top.map((_, i) => (
              <Cell key={i} fill={`rgba(44,110,242,${1 - i * 0.07})`} />
            ))}
          </Bar>
          <Bar
            dataKey="fatalities"
            name="Fatalities"
            radius={[0, 6, 6, 0]}
            maxBarSize={22}
          >
            {top.map((_, i) => (
              <Cell key={i} fill={`rgba(232,93,74,${1 - i * 0.07})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
