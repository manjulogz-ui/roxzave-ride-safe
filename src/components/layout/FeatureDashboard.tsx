import { useQuery } from "@tanstack/react-query";
import { Bot, Settings } from "lucide-react";
import { api } from "@/lib/api/client";
import type { FeatureModule } from "@/lib/features/registry";
import { Skeleton } from "@/components/ui/skeleton";

export function FeatureDashboard({ feature }: { feature: FeatureModule }) {
  const Icon = feature.icon;

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["ai-recommendations", feature.slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/ai/${feature.slug}/recommendations`);
      return data as { items: string[] };
    },
    retry: false,
    placeholderData: {
      items: [
        `Enable ${feature.title} in Settings for live data.`,
        "Connect your vehicle device for sensor-based insights.",
        "Complete your profile for personalized recommendations.",
      ],
    },
  });

  const { data: driverStats } = useQuery({
    queryKey: ["driver-analytics-feature"],
    queryFn: async () => (await api.get("/api/analytics/driver")).data as Record<string, unknown>,
    retry: false,
  });

  return (
    <div className="mt-6 space-y-4">
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary/60">
            <Icon className={`h-6 w-6 ${feature.color}`} />
          </div>
          <div>
            <p className="text-sm font-bold">{feature.title}</p>
            <p className="text-[11px] text-muted-foreground">{feature.subtitle}</p>
          </div>
        </div>
        {feature.description ? (
          <p className="mt-4 text-sm text-muted-foreground">{feature.description}</p>
        ) : null}
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-electric" />
          <p className="text-xs font-bold uppercase tracking-wider">AI Recommendations</p>
        </div>
        <ul className="mt-3 space-y-2">
          {isLoading
            ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)
            : (recommendations?.items ?? []).map((item: string) => (
                <li key={item} className="rounded-lg bg-secondary/40 px-3 py-2 text-[12px] text-foreground/90">
                  {item}
                </li>
              ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Safety score" value={String(driverStats?.safety_score ?? "—")} />
        <Stat label="Total trips" value={String(driverStats?.total_trips ?? "—")} />
        <Stat label="Distance km" value={String(driverStats?.total_distance_km ?? "—")} />
        <Stat label="Trend" value={String(driverStats?.weekly_trend ?? "—")} />
      </div>

      <button type="button" className="glass flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold">
        <Settings className="h-4 w-4" />
        Module Settings
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
