import { Link } from "@tanstack/react-router";
import { Fuel, Gauge, Bot, MapPin } from "lucide-react";

const cards = [
  { to: "/petrol" as const, icon: Fuel, title: "Petrol Bunk", subtitle: "Nearby fuel · EV charging", foot: "Live prices · Map", color: "text-electric" },
  { to: "/driving-score" as const, icon: Gauge, title: "Driving Score", subtitle: "Trip analysis", foot: "Analytics dashboard", color: "text-safety" },
  { to: "/assistant" as const, icon: Bot, title: "AI Copilot", subtitle: "Fastag · Tolls · Route", foot: "Assistant hub", color: "text-success" },
  { to: "/guardian" as const, icon: MapPin, title: "Guardian Live", subtitle: "Share trip with family", foot: "Live WebSocket", color: "text-emergency" },
];

export function InfoCards() {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <Link key={c.to} to={c.to} className="glass relative overflow-hidden rounded-2xl p-3.5">
          <div className="flex items-center justify-between">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/60">
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
          </div>
          <p className="mt-2 text-sm font-bold leading-tight">{c.title}</p>
          <p className="text-[11px] text-muted-foreground">{c.subtitle}</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-electric/90">{c.foot}</p>
        </Link>
      ))}
    </div>
  );
}
