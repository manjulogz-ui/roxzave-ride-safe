import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAuth } from "@/lib/auth/route-guard";
import { api } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin")({
  beforeLoad: requireAuth,
  component: AdminPage,
});

function AdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => (await api.get("/api/admin/analytics/overview")).data,
  });

  const { data: sos } = useQuery({
    queryKey: ["admin-sos"],
    queryFn: async () => (await api.get("/api/admin/sos/monitor")).data,
  });

  const { data: crashHeat } = useQuery({
    queryKey: ["admin-crash-heatmap"],
    queryFn: async () => (await api.get("/api/admin/heatmaps/crashes")).data as { lat: number; lng: number; severity: string }[],
    retry: false,
  });

  const { data: potholeHeat } = useQuery({
    queryKey: ["admin-pothole-heatmap"],
    queryFn: async () => (await api.get("/api/admin/heatmaps/potholes")).data as { lat: number; lng: number; severity: string }[],
    retry: false,
  });

  return (
    <MobileShell>
      <PageHeader title="Admin Dashboard" subtitle="Operations" backTo="/" />
      {isLoading ? (
        <Skeleton className="mt-4 h-40 w-full" />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {Object.entries(data ?? {}).map(([k, v]) => (
            <div key={k} className="glass rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-electric">{String(v)}</p>
              <p className="text-[9px] uppercase text-muted-foreground">{k.replace(/_/g, " ")}</p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs font-bold uppercase text-muted-foreground">Heatmaps (live DB)</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-emergency">{(crashHeat ?? []).length}</p>
          <p className="text-[9px] uppercase text-muted-foreground">Crash points</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-safety">{(potholeHeat ?? []).length}</p>
          <p className="text-[9px] uppercase text-muted-foreground">Pothole points</p>
        </div>
      </div>

      <p className="mt-6 text-xs font-bold uppercase text-muted-foreground">SOS Monitor</p>
      <div className="mt-2 space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
        {(sos ?? []).map((e: { id: string; status: string }) => (
          <div key={e.id} className="glass rounded-lg px-3 py-2 text-[11px]">
            {e.id.slice(0, 8)}… · {e.status}
          </div>
        ))}
      </div>
    </MobileShell>
  );
}
