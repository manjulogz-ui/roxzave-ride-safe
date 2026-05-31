import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api/client";
import type { FeatureModule } from "@/lib/features/registry";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type Tab = "monitor" | "history" | "analytics" | "settings";

const API_MAP: Record<string, string> = {
  "drowsiness-detection": "/api/drowsiness/history",
  "crash-detection": "/api/crash/history",
  "pothole-detection": "/api/safety/pothole/reports",
  "golden-hour-sos": "/api/safety/golden-hour/status",
  "trauma-assistant": "/api/safety/trauma/guidance",
  "women-safety": "/api/safety/women/events",
  "emergency-network": "/api/navigation/emergency-network",
  "safe-route": "/api/navigation/safe-route",
  "women-safe-route": "/api/navigation/safe-route",
  "toll-intelligence": "/api/navigation/toll/estimate",
  "traffic-law": "/api/navigation/traffic-laws",
};

function normalizeList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as Record<string, unknown>[];
    if (Array.isArray(obj.steps)) return obj.steps.map((s, i) => ({ step: i + 1, text: String(s) }));
    if (Array.isArray(obj.hospitals)) return obj.hospitals as Record<string, unknown>[];
    if (Array.isArray(obj.scores)) return obj.scores as Record<string, unknown>[];
    return [obj];
  }
  return [];
}

function EventRow({ item }: { item: Record<string, unknown> }) {
  const keys = Object.keys(item).filter((k) => !k.endsWith("_at") || k === "created_at").slice(0, 4);
  return (
    <div className="rounded-lg bg-secondary/40 px-3 py-2 text-[11px]">
      {keys.map((k) => (
        <span key={k} className="mr-2">
          <span className="text-muted-foreground">{k.replace(/_/g, " ")}:</span>{" "}
          <span className="font-semibold">{String(item[k] ?? "—")}</span>
        </span>
      ))}
    </div>
  );
}

export function SafetyModulePage({
  feature,
  backTo = "/safety-center",
  extraActions,
}: {
  feature: FeatureModule;
  backTo?: string;
  extraActions?: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("monitor");
  const endpoint = API_MAP[feature.slug];

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["module", feature.slug, tab],
    queryFn: async () => {
      if (!endpoint) return [];
      if (feature.slug === "safe-route" || feature.slug === "women-safe-route") {
        const { data: res } = await api.post(endpoint, null, {
          params: {
            origin_lat: 12.97,
            origin_lng: 77.59,
            dest_lat: 12.92,
            dest_lng: 77.62,
            route_type: "safe",
          },
        });
        return res;
      }
      if (feature.slug === "toll-intelligence") {
        const { data: res } = await api.get(endpoint, { params: { distance_km: 50 } });
        return res;
      }
      const { data: res } = await api.get(endpoint);
      return res;
    },
  });

  const items = normalizeList(data);

  return (
    <MobileShell>
      <PageHeader title={feature.title} subtitle={feature.subtitle} backTo={backTo} />
      <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {(["monitor", "history", "analytics", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
              tab === t ? "bg-electric-grad text-primary-foreground" : "glass"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="glass mt-4 min-h-[200px] rounded-2xl p-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : error ? (
          <p className="text-sm text-emergency">Sign in to load live module data.</p>
        ) : tab === "monitor" || tab === "history" ? (
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet. Connect a device or start a trip.</p>
            ) : (
              items.map((item, i) => <EventRow key={String(item.id ?? i)} item={item} />)
            )}
          </div>
        ) : tab === "analytics" ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {items.length} record{items.length === 1 ? "" : "s"} from database.
            </p>
            <Link to="/reports" className="text-sm font-bold text-electric">
              Open full analytics →
            </Link>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p>Alerts: enabled</p>
            <p>Sensor sync: on</p>
            <p>Threshold: standard</p>
            <Link to="/devices" className="font-bold text-electric">
              Device Center →
            </Link>
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => refetch()}>
          Refresh
        </Button>
        {extraActions}
      </div>
    </MobileShell>
  );
}
