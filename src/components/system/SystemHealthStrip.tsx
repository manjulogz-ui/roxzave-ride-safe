import { useQuery } from "@tanstack/react-query";
import { checkApiHealth } from "@/lib/api/client";

export function SystemHealthStrip() {
  const { data } = useQuery({
    queryKey: ["system-health-strip"],
    queryFn: checkApiHealth,
    refetchInterval: 20_000,
  });

  if (!data) return null;

  const ok = data.ok;
  const checks = (data as { checks?: { database?: boolean; seed_user?: boolean } }).checks;

  return (
    <div
      className={`mt-2 flex flex-wrap gap-1.5 rounded-xl px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider ${
        ok ? "bg-success/10 text-success" : "bg-emergency/10 text-emergency"
      }`}
    >
      <span>{ok ? "API Connected" : "API Degraded"}</span>
      <span className="opacity-60">·</span>
      <span>{checks?.database !== false ? "Database Connected" : "DB Offline"}</span>
      <span className="opacity-60">·</span>
      <span>{ok ? "System Healthy" : "Check Backend"}</span>
    </div>
  );
}
