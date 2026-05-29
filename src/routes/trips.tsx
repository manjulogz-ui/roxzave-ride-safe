import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ShieldCheck, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/trips")({
  head: () => ({ meta: [{ title: "Trips — Roxzave AI" }, { name: "description", content: "Trip history, telemetry replay, and safety scores." }] }),
  component: TripsPage,
});

const trips = [
  { date: "Mon 09:14", from: "HSR Layout", to: "MG Road", score: 92, dist: "11.4 km", risk: "Low" },
  { date: "Sun 18:42", from: "Indiranagar", to: "Whitefield", score: 78, dist: "18.2 km", risk: "Medium" },
  { date: "Sat 07:05", from: "Koramangala", to: "Electronic City", score: 88, dist: "22.6 km", risk: "Low" },
  { date: "Fri 21:30", from: "Marathahalli", to: "BTM", score: 64, dist: "9.8 km", risk: "High" },
  { date: "Thu 08:11", from: "Hebbal", to: "Domlur", score: 95, dist: "14.0 km", risk: "Low" },
];

function TripsPage() {
  return (
    <MobileShell>
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">History</p>
        <h1 className="text-2xl font-black tracking-tight">Trip Replay & Telemetry</h1>
      </div>

      <div className="glass mt-4 flex items-center justify-between rounded-2xl p-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Lifetime Safety</p>
          <p className="text-3xl font-black text-electric">89<span className="text-base text-muted-foreground">/100</span></p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Trend</p>
          <p className="flex items-center gap-1 text-sm font-bold text-success"><TrendingUp className="h-4 w-4" /> +6 this week</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {trips.map((t) => (
          <div key={t.date} className="glass rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t.date}</p>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                t.risk === "Low" ? "text-success" : t.risk === "Medium" ? "text-safety" : "text-emergency"
              }`}>{t.risk} risk</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{t.from} → {t.to}</p>
                <p className="text-[11px] text-muted-foreground">{t.dist}</p>
              </div>
              <div className="flex items-center gap-1 text-electric">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-lg font-black">{t.score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}
