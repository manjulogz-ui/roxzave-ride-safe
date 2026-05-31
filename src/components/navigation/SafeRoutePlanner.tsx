import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type RouteMode = "fastest" | "safest" | "balanced";

type RouteResult = {
  route_mode: string;
  distance_km: number;
  eta_minutes: number;
  safety_score: number;
  risk_breakdown: Record<string, number>;
  provider?: string;
};

const DEFAULT_ORIGIN = { lat: 12.9716, lng: 77.5946 };
const DEFAULT_DEST = { lat: 12.92, lng: 77.62 };

export function SafeRoutePlanner() {
  const [mode, setMode] = useState<RouteMode>("balanced");

  const plan = useMutation({
    mutationFn: async (routeMode: RouteMode) => {
      const { data } = await api.post<RouteResult>("/api/navigation/route", {
        origin_lat: DEFAULT_ORIGIN.lat,
        origin_lng: DEFAULT_ORIGIN.lng,
        dest_lat: DEFAULT_DEST.lat,
        dest_lng: DEFAULT_DEST.lng,
        route_mode: routeMode,
      });
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="glass grid grid-cols-3 gap-1 rounded-2xl p-1">
        {(["fastest", "safest", "balanced"] as RouteMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-xl py-2 text-[10px] font-bold uppercase ${
              mode === m ? "bg-electric-grad text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <Button className="w-full" onClick={() => plan.mutate(mode)} disabled={plan.isPending}>
        Plan route (OSM / GraphHopper)
      </Button>

      {plan.isPending && <Skeleton className="h-28 w-full rounded-2xl" />}
      {plan.isError && (
        <p className="text-sm text-emergency">Sign in to plan routes with live risk scoring.</p>
      )}
      {plan.data && (
        <div className="glass space-y-3 rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-black text-electric">{plan.data.distance_km} km</p>
              <p className="text-[9px] uppercase text-muted-foreground">Distance</p>
            </div>
            <div>
              <p className="text-lg font-black">{plan.data.eta_minutes} min</p>
              <p className="text-[9px] uppercase text-muted-foreground">ETA</p>
            </div>
            <div>
              <p className="text-lg font-black text-success">{plan.data.safety_score}</p>
              <p className="text-[9px] uppercase text-muted-foreground">Safety</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">Provider: {plan.data.provider ?? "osrm"}</p>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Risk breakdown</p>
            {Object.entries(plan.data.risk_breakdown ?? {}).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">{k.replace(/_/g, " ")}</span>
                <span className="font-bold">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
