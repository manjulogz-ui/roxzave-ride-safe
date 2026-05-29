import { Fuel, Gauge, Bot, MapPin } from "lucide-react";

export function InfoCards() {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3">
      <Card icon={<Fuel className="h-5 w-5 text-electric" />} title="Petrol Bunk" subtitle="Nearby fuel · EV charging" foot="₹107.95/L · 6 nearby" />
      <Card icon={<Gauge className="h-5 w-5 text-safety" />} title="Driving Score" subtitle="Trip analysis" foot="89 · Safe today" />
      <Card icon={<Bot className="h-5 w-5 text-success" />} title="AI Copilot" subtitle="Fastag · Tolls · Route" foot="₹57.20 estimated" />
      <Card icon={<MapPin className="h-5 w-5 text-emergency" />} title="Guardian Live" subtitle="Share trip with family" foot="2 guardians active" />
    </div>
  );
}

function Card({ icon, title, subtitle, foot }: { icon: React.ReactNode; title: string; subtitle: string; foot: string }) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-3.5">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/60">{icon}</div>
      </div>
      <p className="mt-2 text-sm font-bold leading-tight">{title}</p>
      <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-electric/90">{foot}</p>
    </div>
  );
}
