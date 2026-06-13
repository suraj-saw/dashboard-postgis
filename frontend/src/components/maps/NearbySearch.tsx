import { useState } from "react";
import { Search, MapPin } from "lucide-react";

interface NearbySearchProps {
  onSearch: (latitude: number, longitude: number, radiusKm: number) => void;
}

const NearbySearch = ({ onSearch }: NearbySearchProps) => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("5");

  const handleSearch = () => {
    if (!latitude || !longitude) return;
    onSearch(Number(latitude), Number(longitude), Number(radius));
  };

  // Quick presets for Gujarat cities
  const presets = [
    { label: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    { label: "Surat", lat: 21.1702, lng: 72.8311 },
    { label: "Vadodara", lat: 22.3072, lng: 73.1812 },
    { label: "Rajkot", lat: 22.3039, lng: 70.8022 },
  ];

  return (
    <div className="rounded-xl border border-[#E4E8F4] bg-white p-4 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9BA3C2]">
        Nearby Search
      </p>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setLatitude(String(p.lat));
              setLongitude(String(p.lng));
            }}
            className="text-[10px] px-2 py-1 rounded-full border border-[#E4E8F4] bg-[#F7F9FD] text-[#6B7299] hover:border-[#2C6EF2] hover:text-[#2C6EF2] transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <input
        className="w-full rounded-lg border border-[#E4E8F4] bg-[#F7F9FD] px-3 py-2 text-xs text-[#1A1D2E] outline-none focus:border-[#2C6EF2] placeholder:text-[#9BA3C2]"
        placeholder="Latitude (e.g. 23.0225)"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
      />
      <input
        className="w-full rounded-lg border border-[#E4E8F4] bg-[#F7F9FD] px-3 py-2 text-xs text-[#1A1D2E] outline-none focus:border-[#2C6EF2] placeholder:text-[#9BA3C2]"
        placeholder="Longitude (e.g. 72.5714)"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded-lg border border-[#E4E8F4] bg-[#F7F9FD] px-3 py-2 text-xs text-[#1A1D2E] outline-none focus:border-[#2C6EF2]"
          placeholder="Radius (km)"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        />
        <span className="text-[11px] text-[#9BA3C2] shrink-0">km</span>
      </div>

      <button
        onClick={handleSearch}
        disabled={!latitude || !longitude}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#2C6EF2] text-white text-xs font-semibold py-2.5 hover:bg-[#1D5FE0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Search size={13} />
        Search nearby
      </button>
    </div>
  );
};

export default NearbySearch;
