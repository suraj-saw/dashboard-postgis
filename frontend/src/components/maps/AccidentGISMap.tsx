import { useEffect, useState, useCallback } from "react";
import Map, { Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import HotspotLayer from "./HotspotLayer";
import NearbySearch from "./NearbySearch";
import { useGIS } from "../../hooks/useGIS";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";

interface PopupInfo {
  longitude: number;
  latitude: number;
  district: string;
  severity: string;
}

const AccidentGISMap = () => {
  const { hotspots, loading, error, fetchHotspots, fetchNearby } = useGIS();
  const [popup, setPopup] = useState<PopupInfo | null>(null);

  useEffect(() => {
    fetchHotspots();
  }, []);

  const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
    const features = e.features;
    if (!features || features.length === 0) return;

    const f = features[0];
    if (f.layer?.id === "accident-circles" && f.geometry.type === "Point") {
      setPopup({
        longitude: f.geometry.coordinates[0],
        latitude: f.geometry.coordinates[1],
        district: f.properties?.district ?? "Unknown",
        severity: f.properties?.severity ?? "Unknown",
      });
    }
  }, []);

  const totalPoints = hotspots?.features?.length ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      {/* Map */}
      <div className="lg:col-span-3 rounded-xl overflow-hidden border border-[#E4E8F4]" style={{ height: 520 }}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-t-xl">
            {error} — make sure the backend is running and data is seeded.
          </div>
        )}

        <Map
          initialViewState={{
            longitude: 71.5,
            latitude: 22.5,
            zoom: 6.5,
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          interactiveLayerIds={["accident-circles"]}
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
        >
          {hotspots && hotspots.features.length > 0 && (
            <HotspotLayer data={hotspots} />
          )}

          {popup && (
            <Popup
              longitude={popup.longitude}
              latitude={popup.latitude}
              anchor="bottom"
              onClose={() => setPopup(null)}
              closeOnClick={false}
            >
              <div className="text-xs p-1">
                <p className="font-bold text-[#1A1D2E]">{popup.district}</p>
                <p className="text-[#6B7299]">Severity: <span className="font-semibold text-[#E85D4A]">{popup.severity}</span></p>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        {/* Stats */}
        <div className="rounded-xl border border-[#E4E8F4] bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9BA3C2] mb-3">
            Map stats
          </p>
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-[#E4E8F4] rounded w-3/4" />
              <div className="h-4 bg-[#E4E8F4] rounded w-1/2" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#6B7299]">Total points</span>
                <span className="font-bold text-[#1A1D2E]">{totalPoints.toLocaleString("en-IN")}</span>
              </div>
              <div className="text-[11px] text-[#9BA3C2]">
                Zoom in past level 9 to see individual accident points. Click any point for details.
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9BA3C2] mb-2">
              Severity
            </p>
            {[
              { label: "Fatal", color: "#dc2626" },
              { label: "Grievous Injury", color: "#f97316" },
              { label: "Minor Injury", color: "#eab308" },
              { label: "Damage Only", color: "#22c55e" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[#6B7299]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <NearbySearch
          onSearch={(lat, lng, radius) => fetchNearby(lat, lng, radius * 1000)}
        />

        {loading && (
          <p className="text-xs text-[#9BA3C2] text-center animate-pulse">
            Loading accident data…
          </p>
        )}
      </div>
    </div>
  );
};

export default AccidentGISMap;
