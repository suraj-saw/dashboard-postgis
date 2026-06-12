import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useMemo } from "react";

import type { TimeSeriesPoint } from "../../types/dashboard";

interface Props {
  data: TimeSeriesPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-[#E4E8F4] bg-white px-3 py-2 shadow-lg text-xs">
      <p className="mb-1 font-semibold text-[#6B7299]">{label}</p>

      {payload.map((p: any) => (
        <p
          key={p.dataKey}
          style={{
            color: p.color,
          }}
          className="font-medium"
        >
          {p.name}:{" "}
          <span className="font-bold">{p.value.toLocaleString("en-IN")}</span>
        </p>
      ))}
    </div>
  );
};

export function AccidentTrend({ data }: Props) {

  const recent = useMemo(() => {
    return data.slice(-12);
  }, [data]);

  return (
    <div className="h-full">
      <div
        style={{
          width: "100%",
          height: 260,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={recent}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="gradAccidents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2C6EF2" stopOpacity={0.18} />

                <stop offset="95%" stopColor="#2C6EF2" stopOpacity={0.01} />
              </linearGradient>

              <linearGradient id="gradFatalities" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E85D4A" stopOpacity={0.18} />

                <stop offset="95%" stopColor="#E85D4A" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#EDF0F8"
            />

            <XAxis
              dataKey="month_label"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#9BA3C2",
              }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#9BA3C2",
              }}
              width={36}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: 12,

                paddingTop: 12,

                color: "#6B7299",
              }}
            />

            <Area
              type="monotone"
              name="Accidents"
              dataKey="accident_count"
              stroke="#2C6EF2"
              strokeWidth={2.5}
              fill="url(#gradAccidents)"
              dot={false}
              activeDot={{
                r: 5,

                fill: "#2C6EF2",

                strokeWidth: 0,
              }}
              animationBegin={0}
              animationDuration={600}
            />

            <Area
              type="monotone"
              name="Fatalities"
              dataKey="fatalities"
              stroke="#E85D4A"
              strokeWidth={2.5}
              fill="url(#gradFatalities)"
              dot={false}
              activeDot={{
                r: 5,

                fill: "#E85D4A",

                strokeWidth: 0,
              }}
              animationBegin={0}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
