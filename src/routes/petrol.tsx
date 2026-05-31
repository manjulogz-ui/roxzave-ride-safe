import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Fuel, MapPin, Navigation } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api/client";

export const Route = createFileRoute("/petrol")({
  component: PetrolPage,
});

function PetrolPage() {
  const [coords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [distance, setDistance] = useState(50);
  const [mileage, setMileage] = useState(15);

  const { data: stations, isLoading } = useQuery({
    queryKey: ["petrol", coords.lat, coords.lng],
    queryFn: async () => {
      const { data } = await api.get("/api/maps/nearby/petrol-stations", { params: coords });
      return data as {
        id: string;
        name: string;
        distance_km: number;
        rating: number;
        fuel_price: number;
      }[];
    },
  });

  const estimate = useMutation({
    mutationFn: async () => {
      const price = stations?.[0]?.fuel_price ?? 107.95;
      const { data } = await api.post("/api/maps/fuel-cost-estimate", {
        trip_distance_km: distance,
        mileage_kmpl: mileage,
        fuel_price_per_liter: price,
      });
      return data as { estimated_cost_inr: number; fuel_liters: number };
    },
  });

  return (
    <MobileShell>
      <PageHeader title="Petrol Intelligence" subtitle="Fuel & EV" backTo="/" />
      <div className="mt-4 flex gap-2">
        <button type="button" className="flex-1 rounded-xl bg-electric-grad py-2 text-xs font-bold text-primary-foreground">
          List View
        </button>
        <button type="button" className="glass flex-1 py-2 text-xs font-bold">
          Map View
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading stations…</p>}
        {(stations ?? []).map((s) => (
          <div key={s.id} className="glass rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold">{s.name}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {s.distance_km?.toFixed(1)} km
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-electric">₹{s.fuel_price?.toFixed(2)}/L</p>
                <p className="text-[10px] text-muted-foreground">★ {s.rating?.toFixed(1)}</p>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
              className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-secondary/60 py-2 text-xs font-bold"
            >
              <Navigation className="h-3 w-3" /> Navigate
            </a>
          </div>
        ))}
      </div>
      <div className="glass mt-6 rounded-2xl p-4">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Fuel className="h-4 w-4 text-electric" /> Fuel Cost Predictor
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"
            placeholder="Trip km"
          />
          <input
            type="number"
            value={mileage}
            onChange={(e) => setMileage(Number(e.target.value))}
            className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"
            placeholder="km/L"
          />
        </div>
        <button
          type="button"
          onClick={() => estimate.mutate()}
          className="mt-3 w-full rounded-xl bg-electric-grad py-2 text-sm font-bold text-primary-foreground"
        >
          Calculate
        </button>
        {estimate.data && (
          <p className="mt-3 text-center text-lg font-black text-success">
            ₹{estimate.data.estimated_cost_inr} ({estimate.data.fuel_liters} L)
          </p>
        )}
      </div>
    </MobileShell>
  );
}
