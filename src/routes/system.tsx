import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Database, Server, Wifi, WifiOff } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { api, checkApiHealth } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/system")({
  component: SystemMonitoringPage,
});

function SystemMonitoringPage() {
  const health = useQuery({
    queryKey: ["system-health"],
    queryFn: checkApiHealth,
    refetchInterval: 15_000,
  });

  const metrics = useQuery({
    queryKey: ["system-metrics"],
    queryFn: async () => {
      const { data } = await api.get<{
        status: string;
        environment: string;
        database: string;
        database_type: string;
        version: string;
        uptime_seconds: number;
      }>("/health");
      return data;
    },
    refetchInterval: 15_000,
  });

  const analytics = useQuery({
    queryKey: ["system-analytics"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/api/analytics/driver");
        return data as Record<string, unknown>;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const ok = health.data?.ok ?? false;

  return (
    <MobileShell>
      <PageHeader title="System Monitoring" subtitle="Platform health" backTo="/" />

      <div className={`glass mt-4 flex items-center gap-3 rounded-2xl p-4 ${ok ? "border border-success/30" : "border border-emergency/30"}`}>
        {ok ? <Wifi className="h-8 w-8 text-success" /> : <WifiOff className="h-8 w-8 text-emergency" />}
        <div>
          <p className="text-sm font-bold">{ok ? "API Healthy" : "API Degraded"}</p>
          <p className="text-[11px] text-muted-foreground">
            {health.data?.database ? `Database: ${health.data.database}` : "Checking connection…"}
          </p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => health.refetch()}>
          Refresh
        </Button>
      </div>

      {metrics.isLoading ? (
        <Skeleton className="mt-4 h-32 w-full rounded-2xl" />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Metric icon={Server} label="Environment" value={metrics.data?.environment ?? "—"} />
          <Metric icon={Database} label="Database" value={metrics.data?.database_type ?? "—"} />
          <Metric icon={Activity} label="Version" value={metrics.data?.version ?? "1.0.0"} />
          <Metric
            icon={Activity}
            label="Uptime"
            value={
              metrics.data?.uptime_seconds != null
                ? `${Math.floor(metrics.data.uptime_seconds / 60)}m`
                : "—"
            }
          />
        </div>
      )}

      <p className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Your driver metrics</p>
      {analytics.isLoading ? (
        <Skeleton className="mt-2 h-24 w-full rounded-2xl" />
      ) : analytics.data ? (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {Object.entries(analytics.data).map(([k, v]) => (
            <div key={k} className="glass rounded-xl p-3 text-center">
              <p className="text-lg font-black text-electric">{String(v)}</p>
              <p className="text-[9px] uppercase text-muted-foreground">{k.replace(/_/g, " ")}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="glass mt-2 rounded-xl p-4 text-[12px] text-muted-foreground">
          Sign in to view personalized driver analytics on this dashboard.
        </p>
      )}
    </MobileShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Server; label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <Icon className="h-4 w-4 text-electric" />
      <p className="mt-2 text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
