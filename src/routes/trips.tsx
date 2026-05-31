import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppPage } from "@/components/layout/AppPage";
import { RideTracker } from "@/components/ride/RideTracker";
import { api } from "@/lib/api/client";
import { requireAuth } from "@/lib/auth/route-guard";
import { PageEmpty, PageLoader } from "@/components/system/PageStates";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/trips")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Ride Tracker — Roxzave" },
      { name: "description", content: "Start, pause, and end rides with live telemetry." },
    ],
  }),
  component: TripsPage,
});

function TripsPage() {
  const { data: trips, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => (await api.get("/api/trips")).data as {
      id: string;
      origin_address: string;
      dest_address: string;
      distance_km: number;
      safety_score: number;
      started_at: string;
      status: string;
    }[],
  });

  const { data: scoreData } = useQuery({
    queryKey: ["driving-score"],
    queryFn: async () => (await api.get("/api/trips/driving-score")).data,
  });

  return (
    <AppPage title="Ride Tracker" subtitle="Live & history" backTo="/">
      <RideTracker />

      <div className="glass mt-4 flex items-center justify-between rounded-2xl p-4">
        <div>
          <p className="text-[11px] uppercase text-muted-foreground">Safety score</p>
          <p className="text-3xl font-black text-electric">
            {scoreData?.current_score ?? "—"}
            <span className="text-base text-muted-foreground">/100</span>
          </p>
        </div>
        <Link to="/safety-score" className="text-sm font-bold text-electric">
          Details →
        </Link>
      </div>

      <p className="mt-6 text-xs font-bold uppercase text-muted-foreground">Trip history</p>
      <div className="mt-2 space-y-2">
        {isLoading && <PageLoader label="Loading trips…" />}
        {(trips ?? []).map((t) => (
          <div key={t.id} className="glass rounded-2xl px-4 py-3">
            <p className="text-[11px] uppercase text-muted-foreground">
              {t.started_at ? new Date(t.started_at).toLocaleString() : "—"} · {t.status}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">
                  {t.origin_address ?? "Origin"} → {t.dest_address ?? "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">{t.distance_km ?? "—"} km</p>
              </div>
              <div className="flex items-center gap-1 text-electric">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-lg font-black">{t.safety_score ?? "—"}</span>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && !trips?.length && <PageEmpty title="No trips yet" hint="Start your first ride above" />}
      </div>
    </AppPage>
  );
}
