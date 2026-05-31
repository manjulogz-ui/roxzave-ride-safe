import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppPage } from "@/components/layout/AppPage";
import { api } from "@/lib/api/client";
import { requireAuth } from "@/lib/auth/route-guard";
import { PageError, PageLoader, PageEmpty } from "@/components/system/PageStates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/hazards")({
  beforeLoad: requireAuth,
  component: HazardsPage,
});

function HazardsPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState(2);

  const potholes = useQuery({
    queryKey: ["hazards-potholes"],
    queryFn: async () =>
      (await api.get("/api/safety/pothole/reports")).data as { id: string; severity: number; lat: number; lng: number }[],
    retry: 1,
  });

  const posts = useQuery({
    queryKey: ["hazards-community"],
    queryFn: async () =>
      (await api.get("/api/community/posts")).data as { id: string; title: string; category: string }[],
    retry: 1,
  });

  const report = useMutation({
    mutationFn: async () => {
      const pos = await getPosition();
      await api.post("/api/community/posts", {
        community_name: "Road Watch",
        category: "hazards",
        title: title || "Road hazard",
        body: `Severity ${severity} · reported via Roxzave`,
        lat: pos?.lat ?? 12.97,
        lng: pos?.lng ?? 77.59,
      });
      if (pos) {
        await api.post("/api/safety/pothole/reports", {
          lat: pos.lat,
          lng: pos.lng,
          severity,
          description: title || "Road hazard",
        });
      }
      await api.post("/api/rewards/award", {
        event_type: "hazard_report",
        points: 25,
        description: "Community hazard report",
      });
    },
    onSuccess: () => {
      setTitle("");
      qc.invalidateQueries({ queryKey: ["hazards-potholes"] });
      qc.invalidateQueries({ queryKey: ["hazards-community"] });
      qc.invalidateQueries({ queryKey: ["rewards-summary"] });
    },
  });

  if (potholes.isLoading) return <AppPage title="Hazards" backTo="/"><PageLoader /></AppPage>;

  return (
    <AppPage title="Road Hazards" subtitle="Report & view" backTo="/">
      {potholes.isError && (
        <PageError message="Connect to API to load reports." onRetry={() => potholes.refetch()} />
      )}

      <form
        className="glass space-y-2 rounded-2xl p-4"
        onSubmit={(e) => {
          e.preventDefault();
          report.mutate();
        }}
      >
        <Input placeholder="Hazard title (pothole, flooding…)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label className="block text-[11px]">
          Severity (1–5)
          <input
            type="number"
            min={1}
            max={5}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="mt-1 w-full rounded-lg bg-secondary/50 px-3 py-2 text-sm"
          />
        </label>
        <Button type="submit" className="w-full" disabled={report.isPending}>
          {report.isPending ? "Submitting…" : "Submit hazard report"}
        </Button>
        {report.isSuccess && <p className="text-center text-sm text-success">Report saved · +25 points</p>}
      </form>

      <p className="mt-4 text-xs font-bold uppercase text-muted-foreground">Pothole reports</p>
      <div className="mt-2 max-h-40 space-y-1 overflow-y-auto scrollbar-hide">
        {(potholes.data ?? []).length === 0 ? (
          <PageEmpty title="No reports yet" />
        ) : (
          (potholes.data ?? []).map((p) => (
            <div key={p.id} className="glass rounded-lg px-3 py-2 text-[11px]">
              Severity {p.severity} · {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
            </div>
          ))
        )}
      </div>

      <p className="mt-4 text-xs font-bold uppercase text-muted-foreground">Community feed</p>
      <div className="mt-2 space-y-1">
        {(posts.data ?? []).slice(0, 8).map((p) => (
          <Link key={p.id} to="/community/$postId" params={{ postId: p.id }} className="glass block rounded-lg px-3 py-2 text-[11px]">
            {p.title}
          </Link>
        ))}
      </div>
    </AppPage>
  );
}

async function getPosition() {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise<{ lat: number; lng: number } | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 },
    );
  });
}
