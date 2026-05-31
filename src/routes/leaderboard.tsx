import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppPage } from "@/components/layout/AppPage";
import { api } from "@/lib/api/client";
import { PageError, PageLoader, PageEmpty } from "@/components/system/PageStates";

const SCOPES = ["global", "weekly", "monthly", "city"] as const;

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [scope, setScope] = useState<(typeof SCOPES)[number]>("global");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["leaderboard", scope],
    queryFn: async () =>
      (await api.get("/api/rewards/leaderboard", { params: { scope } })).data as {
        rank: number;
        full_name: string;
        safety_score: number;
        total_points: number;
      }[],
    retry: 1,
  });

  if (isLoading) return <AppPage title="Leaderboard" backTo="/"><PageLoader /></AppPage>;
  if (isError) {
    return (
      <AppPage title="Leaderboard" backTo="/">
        <PageError message="Leaderboard unavailable." onRetry={() => refetch()} />
      </AppPage>
    );
  }

  return (
    <AppPage title="Leaderboard" subtitle="Rankings from rewards DB" backTo="/">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SCOPES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScope(s)}
            className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
              scope === s ? "bg-electric-grad text-primary-foreground" : "glass"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {(data ?? []).length === 0 ? (
        <PageEmpty title="No rankings yet" />
      ) : (
        <div className="mt-4 space-y-2">
          {(data ?? []).map((u) => (
            <div key={`${u.full_name}-${u.rank}`} className="glass flex items-center gap-3 rounded-xl px-4 py-3">
              <span className="text-lg font-black text-electric">#{u.rank}</span>
              <div className="flex-1">
                <p className="font-bold">{u.full_name}</p>
                <p className="text-[10px] text-muted-foreground">Score {u.safety_score}</p>
              </div>
              <p className="text-xl font-black">{u.total_points} pts</p>
            </div>
          ))}
        </div>
      )}
    </AppPage>
  );
}
