import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppPage } from "@/components/layout/AppPage";
import { api } from "@/lib/api/client";
import { requireAuth } from "@/lib/auth/route-guard";
import { PageError, PageLoader } from "@/components/system/PageStates";

export const Route = createFileRoute("/rewards")({
  beforeLoad: requireAuth,
  component: RewardsPage,
});

function RewardsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["rewards-summary"],
    queryFn: async () => (await api.get("/api/rewards/summary")).data as {
      total_points: number;
      level: number;
      badges: { slug: string; name: string; points_required: number; unlocked: boolean }[];
      recent_events: { type: string; points: number; description: string; at: string }[];
    },
  });

  if (isLoading) return <AppPage title="Rewards" backTo="/"><PageLoader /></AppPage>;
  if (isError) {
    return (
      <AppPage title="Rewards" backTo="/">
        <PageError message="Could not load rewards." onRetry={() => refetch()} />
      </AppPage>
    );
  }

  return (
    <AppPage title="Rewards" subtitle={`Level ${data?.level ?? 1}`} backTo="/">
      <div className="glass rounded-2xl p-5 text-center">
        <p className="text-[10px] uppercase text-muted-foreground">Total points</p>
        <p className="text-4xl font-black text-electric">{data?.total_points ?? 0}</p>
      </div>

      <p className="mt-4 text-xs font-bold uppercase text-muted-foreground">Badges</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(data?.badges ?? []).map((b) => (
          <span
            key={b.slug}
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${b.unlocked ? "bg-electric/20 text-electric" : "bg-secondary/40 text-muted-foreground"}`}
          >
            {b.unlocked ? "★" : "○"} {b.name}
          </span>
        ))}
      </div>

      <p className="mt-4 text-xs font-bold uppercase text-muted-foreground">Recent activity</p>
      <div className="mt-2 space-y-1">
        {(data?.recent_events ?? []).map((e, i) => (
          <div key={i} className="glass rounded-lg px-3 py-2 text-[11px]">
            +{e.points} · {e.type} · {e.description ?? ""}
          </div>
        ))}
        {(data?.recent_events ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Complete rides and report hazards to earn points.</p>
        )}
      </div>
    </AppPage>
  );
}
