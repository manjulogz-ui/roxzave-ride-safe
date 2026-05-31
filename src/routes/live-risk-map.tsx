import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppPage } from "@/components/layout/AppPage";
import { api } from "@/lib/api/client";
import { PageError, PageLoader } from "@/components/system/PageStates";

export const Route = createFileRoute("/live-risk-map")({
  component: LiveRiskMapPage,
});

function riskColor(score: number) {
  if (score >= 75) return "text-success border-success/40 bg-success/10";
  if (score >= 50) return "text-safety border-safety/40 bg-safety/10";
  return "text-emergency border-emergency/40 bg-emergency/10";
}

function LiveRiskMapPage() {
  const risk = useQuery({
    queryKey: ["live-risk"],
    queryFn: async () => {
      const { data } = await api.get("/api/navigation/risk", {
        params: {
          origin_lat: 12.9716,
          origin_lng: 77.5946,
          dest_lat: 12.92,
          dest_lng: 77.62,
          route_mode: "balanced",
        },
      });
      return data as {
        safety_score: number;
        accident_history: number;
        crime_zones: number;
        weather: number;
        road_quality: number;
        traffic_density: number;
        distance_km: number;
      };
    },
    retry: 1,
  });

  const zones = useQuery({
    queryKey: ["crime-zones"],
    queryFn: async () => (await api.get("/api/navigation/crime-zones")).data as { name: string; risk_level: string }[],
    retry: 1,
  });

  if (risk.isLoading) return <AppPage title="Live Risk Map" backTo="/"><PageLoader /></AppPage>;
  if (risk.isError) {
    return (
      <AppPage title="Live Risk Map" backTo="/">
        <PageError message="Sign in and ensure the API is running to view live risk." onRetry={() => risk.refetch()} />
      </AppPage>
    );
  }

  const score = risk.data?.safety_score ?? 0;

  return (
    <AppPage title="Live Risk Map" subtitle="Real-time analysis" backTo="/assistant">
      <div className={`glass rounded-2xl border p-5 text-center ${riskColor(score)}`}>
        <p className="text-[10px] font-bold uppercase tracking-wider">Route risk score</p>
        <p className="text-5xl font-black">{score}</p>
        <p className="text-xs">{score >= 75 ? "Safe" : score >= 50 ? "Moderate risk" : "High risk"}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          ["Hazards", risk.data?.road_quality],
          ["Crime zones", risk.data?.crime_zones],
          ["Accidents", risk.data?.accident_history],
          ["Weather", risk.data?.weather],
          ["Traffic", risk.data?.traffic_density],
          ["Distance km", risk.data?.distance_km],
        ].map(([label, val]) => (
          <div key={String(label)} className="glass rounded-xl p-3">
            <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
            <p className="text-lg font-bold">{String(val ?? "—")}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs font-bold uppercase text-muted-foreground">Hazard zones (DB)</p>
      <div className="mt-2 max-h-40 space-y-1 overflow-y-auto scrollbar-hide">
        {(zones.data ?? []).length === 0 && !zones.isLoading && (
          <p className="text-sm text-muted-foreground">No crime zones in database yet.</p>
        )}
        {(zones.data ?? []).map((z, i) => (
          <div key={i} className="glass rounded-lg px-3 py-2 text-[11px]">
            {z.name} · <span className="font-bold">{z.risk_level}</span>
          </div>
        ))}
      </div>
    </AppPage>
  );
}
