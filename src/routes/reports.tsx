import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Gauge, Fuel, ShieldCheck, AlertTriangle, Trophy } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Roxzave AI" }, { name: "description", content: "Safety analytics, fuel cost, crash reports, and community impact." }] }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <MobileShell>
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Monthly</p>
        <h1 className="text-2xl font-black tracking-tight">Analytics & Insights</h1>
      </div>

      {/* Hero metric */}
      <div className="glass mt-4 overflow-hidden rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Safety Index · November</p>
            <p className="mt-1 text-5xl font-black text-electric">89<span className="text-xl text-muted-foreground">/100</span></p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-success">▲ Top 12% of riders</p>
          </div>
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-electric/15">
            <Trophy className="h-10 w-10 text-safety" />
          </div>
        </div>
        {/* mini sparkline */}
        <svg viewBox="0 0 300 60" className="mt-4 h-14 w-full">
          <defs>
            <linearGradient id="sp" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="oklch(0.72 0.20 235)" stopOpacity="0.5" />
              <stop offset="1" stopColor="oklch(0.72 0.20 235)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,40 L25,32 L50,38 L75,22 L100,28 L125,18 L150,24 L175,12 L200,20 L225,8 L250,14 L275,6 L300,10 L300,60 L0,60 Z" fill="url(#sp)" />
          <path d="M0,40 L25,32 L50,38 L75,22 L100,28 L125,18 L150,24 L175,12 L200,20 L225,8 L250,14 L275,6 L300,10" stroke="oklch(0.72 0.20 235)" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat icon={<Gauge className="h-5 w-5 text-electric" />} label="Avg Speed" value="42 km/h" delta="−3" />
        <Stat icon={<Fuel className="h-5 w-5 text-safety" />} label="Fuel Cost" value="₹3,824" delta="−12%" />
        <Stat icon={<ShieldCheck className="h-5 w-5 text-success" />} label="Safe Trips" value="46 / 51" delta="+4" />
        <Stat icon={<AlertTriangle className="h-5 w-5 text-emergency" />} label="Risk Alerts" value="7" delta="−2" />
      </div>

      <div className="glass mt-4 rounded-2xl p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Achievements</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["7-day streak", "Zero harsh brake", "Night rider", "Community helper", "Pothole hunter"].map((b) => (
            <span key={b} className="rounded-full bg-electric/15 px-3 py-1 text-[11px] font-bold text-electric">★ {b}</span>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

function Stat({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: string; delta: string }) {
  const positive = !delta.startsWith("−") && !delta.startsWith("-");
  return (
    <div className="glass rounded-2xl p-3.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/60">{icon}</div>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-lg font-black">{value}</p>
      <p className={`text-[11px] font-bold ${positive ? "text-emergency" : "text-success"}`}>{delta}</p>
    </div>
  );
}
