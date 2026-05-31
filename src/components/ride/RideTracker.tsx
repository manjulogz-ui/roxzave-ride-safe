import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { PageError, PageLoader } from "@/components/system/PageStates";

type ActiveTrip = {
  id: string;
  status: string;
  started_at: string;
  origin_address: string;
};

export function RideTracker() {
  const qc = useQueryClient();
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [harshBraking, setHarshBraking] = useState(0);
  const [speeding, setSpeeding] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: active, isLoading, isError, refetch } = useQuery({
    queryKey: ["active-ride"],
    queryFn: async () => {
      const { data } = await api.get<ActiveTrip | null>("/api/trips/active");
      return data;
    },
    retry: 1,
  });

  const start = useMutation({
    mutationFn: async () => {
      const pos = await getPosition();
      const { data } = await api.post("/api/trips/start", {
        origin_lat: pos?.lat,
        origin_lng: pos?.lng,
        origin_address: "Current location",
      });
      return data;
    },
    onSuccess: () => {
      setElapsed(0);
      setDistance(0);
      setHarshBraking(0);
      setSpeeding(0);
      setPaused(false);
      qc.invalidateQueries({ queryKey: ["active-ride"] });
      qc.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  const pause = useMutation({
    mutationFn: () => api.post(`/api/trips/${active!.id}/pause`),
    onSuccess: () => setPaused(true),
  });

  const resume = useMutation({
    mutationFn: () => api.post(`/api/trips/${active!.id}/resume`),
    onSuccess: () => setPaused(false),
  });

  const end = useMutation({
    mutationFn: async () => {
      const pos = await getPosition();
      const { data } = await api.post(`/api/trips/${active!.id}/end`, {
        dest_lat: pos?.lat,
        dest_lng: pos?.lng,
        dest_address: "End location",
        distance_km: Math.round(distance * 10) / 10,
        duration_minutes: Math.floor(elapsed / 60),
        harsh_braking: harshBraking,
        speeding_events: speeding,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["active-ride"] });
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: ["driving-score"] });
      qc.invalidateQueries({ queryKey: ["analytics-driver"] });
      qc.invalidateQueries({ queryKey: ["rewards-summary"] });
    },
  });

  useEffect(() => {
    if (active && !paused) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
        setDistance((d) => d + 0.008);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, paused]);

  if (isLoading) return <PageLoader label="Loading ride status…" />;
  if (isError) return <PageError message="Could not load ride tracker." onRetry={() => refetch()} />;

  if (!active) {
    return (
      <div className="glass rounded-2xl p-5 text-center">
        <p className="text-sm text-muted-foreground">No active ride</p>
        <Button className="mt-4 w-full" onClick={() => start.mutate()} disabled={start.isPending}>
          {start.isPending ? "Starting…" : "Start Ride"}
        </Button>
      </div>
    );
  }

  return (
    <div className="glass space-y-4 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase text-electric">{paused ? "Paused" : "Recording"}</p>
          <p className="text-2xl font-black tabular-nums">
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase text-muted-foreground">Distance</p>
          <p className="text-xl font-bold">{distance.toFixed(2)} km</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
        <button type="button" className="rounded-xl bg-secondary/50 py-2" onClick={() => setHarshBraking((n) => n + 1)}>
          Harsh brake: {harshBraking}
        </button>
        <button type="button" className="rounded-xl bg-secondary/50 py-2" onClick={() => setSpeeding((n) => n + 1)}>
          Speeding: {speeding}
        </button>
      </div>

      <div className="flex gap-2">
        {!paused ? (
          <Button variant="outline" className="flex-1" onClick={() => pause.mutate()} disabled={pause.isPending}>
            Pause
          </Button>
        ) : (
          <Button variant="outline" className="flex-1" onClick={() => resume.mutate()} disabled={resume.isPending}>
            Resume
          </Button>
        )}
        <Button className="flex-1 bg-emergency text-white" onClick={() => end.mutate()} disabled={end.isPending}>
          End Ride
        </Button>
      </div>
      {end.isSuccess && (
        <p className="text-center text-sm text-success">
          Ride saved · score updated
          {end.data?.points_earned ? ` · +${end.data.points_earned} pts` : ""}
        </p>
      )}
    </div>
  );
}

async function getPosition(): Promise<{ lat: number; lng: number } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 },
    );
  });
}
