import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export function HomeHero() {
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["home-driver"],
    queryFn: async () => (await api.get("/api/analytics/driver")).data as {
      safety_score: number;
      total_trips: number;
      total_distance_km: number;
      reward_points: number;
    },
    enabled: isAuthenticated,
    retry: 1,
  });

  const name = user?.fullName?.split(" ")[0] ?? "Rider";

  return (
    <section className="glass mt-3 rounded-3xl p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-electric">Welcome back</p>
      <h1 className="mt-1 text-2xl font-black tracking-tight">Hi, {name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your smart mobility cockpit</p>

      {!isAuthenticated ? (
        <div className="mt-4 flex gap-2">
          <Link to="/login" className="flex-1 rounded-xl bg-electric-grad py-2.5 text-center text-sm font-bold text-primary-foreground">
            Login
          </Link>
          <Link to="/register" className="glass flex-1 py-2.5 text-center text-sm font-bold">
            Register
          </Link>
        </div>
      ) : isLoading ? (
        <div className="mt-4 h-16 animate-pulse rounded-xl bg-secondary/50" />
      ) : isError ? (
        <button type="button" onClick={() => refetch()} className="mt-4 text-sm text-electric">
          Tap to reload safety stats
        </button>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <div className="rounded-xl bg-secondary/40 p-2">
            <p className="text-xl font-black text-electric">{data?.safety_score ?? "—"}</p>
            <p className="text-[9px] uppercase text-muted-foreground">Safety</p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-2">
            <p className="text-xl font-black">{data?.total_trips ?? 0}</p>
            <p className="text-[9px] uppercase text-muted-foreground">Trips</p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-2">
            <p className="text-xl font-black">{data?.total_distance_km ?? 0}</p>
            <p className="text-[9px] uppercase text-muted-foreground">Km</p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-2">
            <p className="text-xl font-black text-safety">{data?.reward_points ?? 0}</p>
            <p className="text-[9px] uppercase text-muted-foreground">Points</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Link to="/ride-tracker" className="flex-1 rounded-xl bg-secondary/50 py-2 text-center text-[11px] font-bold">
          Start ride
        </Link>
        <Link to="/assistant" className="flex-1 rounded-xl bg-secondary/50 py-2 text-center text-[11px] font-bold text-electric">
          AI Assistant
        </Link>
      </div>
    </section>
  );
}
