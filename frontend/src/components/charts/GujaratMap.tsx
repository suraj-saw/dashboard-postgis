import { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { motion, AnimatePresence } from "framer-motion";
import type { DistrictCount } from "../../types/dashboard";
import geoUrl from "../../assets/gujarat_districts.json";

interface GujaratMapProps {
  data: DistrictCount[];
  metric: "accidents" | "fatalities" | "fatal_accidents";
}


export function GujaratMap({ data, metric }: GujaratMapProps) {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipData, setTooltipData] = useState<{ accidents: number; fatalities: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const dataMap = useMemo(() => {
    const map: Record<string, DistrictCount> = {};
    data.forEach((d) => {
      if (d.district) {
        map[d.district.toLowerCase().trim()] = d;
      }
    });
    return map;
  }, [data]);

  const maxValue = useMemo(() => {
    if (!data.length) return 1;
    if (metric === "accidents") {
      return Math.max(...data.map((d) => d.accident_count));
    }
    return Math.max(...data.map((d) => d.fatalities));
  }, [data, metric]);

  // Different color palettes based on the metric
  const colorScale = scaleLinear<string>()
    .domain([0, maxValue])
    .range(
      metric === "accidents"
        ? ["#E0E7FF", "#1D4ED8"]
        : metric === "fatalities"
          ? ["#FEE2E2", "#B91C1C"]
          : ["#FEF3C7", "#B45309"]
    );


  const handleMouseEnter = (geo: any, e: React.MouseEvent) => {
    const districtName = geo.properties.NAME_2;
    const districtData = dataMap[districtName.toLowerCase()];

    setTooltipContent(districtName);
    setTooltipData(
      districtData
        ? { accidents: districtData.accident_count, fatalities: districtData.fatalities }
        : { accidents: 0, fatalities: 0 }
    );
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipContent("");
    setTooltipData(null);
  };

  return (
    <div className="relative w-full h-[350px]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 4500,
          center: [71.5, 22.8],
        }}
        className="w-full h-full"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const districtName = geo.properties.NAME_2;
              const d = dataMap[districtName?.toLowerCase().trim()];
              if (!d && districtName) {
                console.log("No match for GeoJSON district:", districtName);
              }

              const value = d
                ? metric === "accidents"
                  ? d.accident_count
                  : d.fatalities
                : 0;

              const color = value > 0 ? colorScale(value) : "#F8FAFC";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={(e) => handleMouseEnter(geo, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: {
                      fill: color,
                      stroke: "#CBD5E1",
                      strokeWidth: 0.8,
                      outline: "none",
                      transition: "all 250ms",
                    },
                    hover: {
                      fill:
                        metric === "accidents"
                          ? "#3B82F6"
                          : metric === "fatalities"
                            ? "#EF4444"
                            : "#F59E0B",

                      stroke: "#FFFFFF",
                      strokeWidth: 1.5,
                      outline: "none",
                      cursor: "pointer",
                      transition: "all 250ms",
                    },
                    pressed: {
                      fill: "#0F172A",
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      <AnimatePresence>
        {tooltipContent && tooltipData && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none z-50 rounded-lg border border-[#E4E8F4] bg-white/95 backdrop-blur-sm px-3 py-2 shadow-xl text-xs"
            style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}
          >
            <p className="mb-1.5 font-bold text-[#1A1D2E] border-b border-[#E4E8F4] pb-1">{tooltipContent}</p>
            {metric === "accidents" ? (
              <p className="font-semibold text-[#6B7299] flex justify-between gap-4">
                Accidents: <span className="text-[#1D4ED8]">{tooltipData.accidents.toLocaleString("en-IN")}</span>
              </p>
            ) : metric === "fatalities" ? (
              <p className="font-semibold text-[#6B7299] flex justify-between gap-4">
                Fatalities: <span className="text-[#B91C1C]">{tooltipData.fatalities.toLocaleString("en-IN")}</span>
              </p>
            ) : (
              <p className="font-semibold text-[#6B7299] flex justify-between gap-4">
                Fatal Accidents: <span className="text-[#B45309]">{tooltipData.accidents.toLocaleString("en-IN")}</span>
              </p>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
