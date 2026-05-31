import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppPage } from "@/components/layout/AppPage";
import { requireAuth } from "@/lib/auth/route-guard";
import { api } from "@/lib/api/client";
import { PageLoader } from "@/components/system/PageStates";

export const Route = createFileRoute("/driving-score")({
  beforeLoad: requireAuth,
  component: DrivingScorePage,
});

function DrivingScorePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["driving-score"],
    queryFn: async () => (await api.get("/api/trips/driving-score")).data as {
      current_score: number;
      harsh_braking: number;
      speeding_events: number;
      drowsiness_events: number;
      daily: number;
      weekly_avg: number;
      monthly_avg: number;
      lifetime: number;
      history: { score: number; date: string }[];
    },
  });

  if (isLoading) return <AppPage title="Safety Score" backTo="/"><PageLoader /></AppPage>;

  return (
    <AppPage title="Safety Score" subtitle="Driving analytics" backTo="/">
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-6xl font-black text-success">{data?.current_score ?? "—"}</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current score</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Metric label="Daily" value={data?.daily} />
        <Metric label="Weekly avg" value={data?.weekly_avg} />
        <Metric label="Monthly avg" value={data?.monthly_avg} />
        <Metric label="Lifetime" value={data?.lifetime} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric label="Harsh braking" value={data?.harsh_braking} />
        <Metric label="Speeding" value={data?.speeding_events} />
        <Metric label="Drowsiness" value={data?.drowsiness_events} />
      </div>
      <Link to="/trips" className="glass mt-4 block rounded-2xl p-4 text-center text-sm font-bold text-electric">
        Ride tracker →
      </Link>
    </AppPage>
  );
}

function Metric({ label, value }: { label: string; value?: number }) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <p className="text-xl font-black">{value ?? "—"}</p>
      <p className="text-[9px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}
