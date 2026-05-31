import { useState } from "react";
import { Zap, ShieldCheck, Scale } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

type Mode = "fastest" | "safest" | "balanced";

export function RouteToggle() {
  const [mode, setMode] = useState<Mode>("safest");
  const [summary, setSummary] = useState<string | null>(null);

  const plan = useMutation({
    mutationFn: async (routeMode: Mode) => {
      const { data } = await api.post<{
        distance_km: number;
        eta_minutes: number;
        safety_score: number;
      }>("/api/navigation/route", {
        origin_lat: 12.9716,
        origin_lng: 77.5946,
        dest_lat: 12.92,
        dest_lng: 77.62,
        route_mode: routeMode,
      });
      return data;
    },
    onSuccess: (data) => {
      setSummary(`${data.distance_km} km · ${data.eta_minutes} min · Safety ${data.safety_score}`);
    },
  });

  const select = (m: Mode) => {
    setMode(m);
    plan.mutate(m);
  };

  return (
    <div>
      <div className="glass mt-4 grid grid-cols-3 rounded-2xl p-1">
        <button
          type="button"
          onClick={() => select("fastest")}
          className={`flex items-center justify-center gap-1 rounded-xl py-2.5 text-[10px] font-bold uppercase ${
            mode === "fastest" ? "bg-electric/15 text-electric" : "text-muted-foreground"
          }`}
        >
          <Zap className="h-3.5 w-3.5" /> Fast
        </button>
        <button
          type="button"
          onClick={() => select("safest")}
          className={`flex items-center justify-center gap-1 rounded-xl py-2.5 text-[10px] font-bold uppercase ${
            mode === "safest" ? "bg-success/15 text-success" : "text-muted-foreground"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Safe
        </button>
        <button
          type="button"
          onClick={() => select("balanced")}
          className={`flex items-center justify-center gap-1 rounded-xl py-2.5 text-[10px] font-bold uppercase ${
            mode === "balanced" ? "bg-secondary text-foreground" : "text-muted-foreground"
          }`}
        >
          <Scale className="h-3.5 w-3.5" /> Mix
        </button>
      </div>
      {summary && <p className="mt-2 text-center text-[11px] font-semibold text-electric">{summary}</p>}
      {plan.isPending && <p className="mt-1 text-center text-[10px] text-muted-foreground">Computing route…</p>}
    </div>
  );
}
