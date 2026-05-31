import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import { Gauge, ShieldCheck, AlertTriangle, Trophy } from "lucide-react";
import { api } from "@/lib/api/client";
import { requireAuth } from "@/lib/auth/route-guard";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/reports")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Reports — Roxzave AI" },
      { name: "description", content: "Safety analytics from your trips and devices." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data: driver, isLoading } = useQuery({
    queryKey: ["analytics-driver"],
    queryFn: async () => (await api.get("/api/analytics/driver")).data as {
      safety_score: number;
      total_trips: number;
      total_distance_km: number;
      weekly_trend: string;
    },
  });

  const { data: safety } = useQuery({
    queryKey: ["analytics-safety"],
    queryFn: async () => (await api.get("/api/analytics/safety")).data as {
      harsh_braking_total: number;
      scores: { score: number; date: string }[];
    },
  });

  const { data: drowsy } = useQuery({
    queryKey: ["drowsiness-analytics"],
    queryFn: async () => (await api.get("/api/drowsiness/analytics")).data as { total_events: number; high_alerts: number },
  });

  const { data: crash } = useQuery({
    queryKey: ["crash-analytics"],
    queryFn: async () => (await api.get("/api/crash/analytics")).data as { total_crashes: number; severe_events: number },
  });

  const { data: trends } = useQuery({
    queryKey: ["analytics-trends"],
    queryFn: async () => (await api.get("/api/analytics/trends")).data as {
      ride_trends: { date: string; distance_km: number; score: number }[];
      rewards_trends: { date: string; points: number; type: string }[];
    },
  });

  const scores = safety?.scores ?? [];
  const sparkPoints =
    scores.length > 1
      ? scores
          .map((s, i) => `${(i / (scores.length - 1)) * 300},${60 - (s.score / 100) * 50}`)
          .join(" L")
      : "0,40 L300,40";

  return (
    <MobileShell>
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Live from database</p>
        <h1 className="text-2xl font-black tracking-tight">Analytics & Insights</h1>
      </div>

      {isLoading ? (
        <Skeleton className="mt-4 h-40 w-full rounded-3xl" />
      ) : (
        <div className="glass mt-4 overflow-hidden rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Safety index</p>
              <p className="mt-1 text-5xl font-black text-electric">
                {driver?.safety_score ?? "—"}
                <span className="text-xl text-muted-foreground">/100</span>
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-success">
                Trend {driver?.weekly_trend ?? "—"}
              </p>
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-electric/15">
              <Trophy className="h-10 w-10 text-safety" />
            </div>
          </div>
          {scores.length > 0 && (
            <svg viewBox="0 0 300 60" className="mt-4 h-14 w-full">
              <path d={`M${sparkPoints}`} stroke="oklch(0.72 0.20 235)" strokeWidth="2" fill="none" />
            </svg>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat
          icon={<Gauge className="h-5 w-5 text-electric" />}
          label="Total trips"
          value={String(driver?.total_trips ?? 0)}
        />
        <Stat
          icon={<ShieldCheck className="h-5 w-5 text-success" />}
          label="Distance"
          value={`${driver?.total_distance_km ?? 0} km`}
        />
        <Stat
          icon={<AlertTriangle className="h-5 w-5 text-emergency" />}
          label="Drowsy alerts"
          value={String(drowsy?.high_alerts ?? 0)}
        />
        <Stat
          icon={<AlertTriangle className="h-5 w-5 text-emergency" />}
          label="Crash events"
          value={String(crash?.total_crashes ?? 0)}
        />
      </div>

      <div className="glass mt-4 rounded-2xl p-4">
        <p className="text-[11px] font-bold uppercase text-muted-foreground">Trends (database)</p>
        <p className="mt-2 text-sm">Rides logged: {(trends?.ride_trends ?? []).length}</p>
        <p className="text-sm">Reward events: {(trends?.rewards_trends ?? []).length}</p>
        <p className="text-sm">Behavior — harsh braking: {safety?.harsh_braking_total ?? 0}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link to="/driving-score" className="glass rounded-xl p-3 text-center text-xs font-bold text-electric">
          Driving Score →
        </Link>
        <Link to="/features" className="glass rounded-xl p-3 text-center text-xs font-bold">
          All Modules →
        </Link>
      </div>
    </MobileShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-3.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/60">{icon}</div>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}
