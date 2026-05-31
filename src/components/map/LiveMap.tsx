import { useEffect, useState } from "react";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

type LatLng = { lat: number; lng: number };

export function LiveMap() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ lat: 12.9716, lng: 77.5946 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setError("Location unavailable — showing Bangalore");
        setLocation({ lat: 12.9716, lng: 77.5946 });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const { data: layers } = useQuery({
    queryKey: ["map-layers", location?.lat, location?.lng],
    enabled: !!location,
    queryFn: async () => {
      const { data } = await api.get("/api/maps/layers", {
        params: { lat: location!.lat, lng: location!.lng },
      });
      return data as {
        potholes: { lat: number; lng: number }[];
        crime_zones: { name: string }[];
        school_zones: { name: string }[];
      };
    },
  });

  if (!location) {
    return (
      <div className="glass mt-4 flex h-52 items-center justify-center rounded-2xl">
        <Loader2 className="h-8 w-8 animate-spin text-electric" />
      </div>
    );
  }

  const z = 14;
  const tileUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.02}%2C${location.lat - 0.02}%2C${location.lng + 0.02}%2C${location.lat + 0.02}&layer=mapnik&marker=${location.lat}%2C${location.lng}`;

  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10">
      <iframe title="Live map" src={tileUrl} className="h-52 w-full border-0" loading="lazy" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-bold text-electric">
            <Navigation className="h-3 w-3" /> Live GPS
          </span>
          <span className="text-muted-foreground">
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </span>
        </div>
        {error && <p className="mt-1 text-[10px] text-safety">{error}</p>}
        {layers && (
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge icon={<MapPin className="h-3 w-3" />} label={`${layers.potholes?.length ?? 0} potholes`} />
            <Badge label={`${layers.crime_zones?.length ?? 0} risk zones`} />
            <Badge label={`${layers.school_zones?.length ?? 0} school zones`} />
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold">
      {icon}
      {label}
    </span>
  );
}
