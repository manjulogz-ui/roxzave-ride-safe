import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Map, Fuel, Receipt, Scale, Hospital } from "lucide-react";

const links = [
  { to: "/features/$slug" as const, slug: "safe-route", icon: Map, label: "Safe Route Engine" },
  { to: "/features/$slug" as const, slug: "fuel-cost", icon: Fuel, label: "Fuel Cost Prediction" },
  { to: "/petrol" as const, icon: Fuel, label: "Petrol Intelligence" },
  { to: "/features/$slug" as const, slug: "toll-intelligence", icon: Receipt, label: "Toll Intelligence" },
  { to: "/features/$slug" as const, slug: "traffic-law", icon: Scale, label: "Traffic Law Engine" },
  { to: "/features/$slug" as const, slug: "emergency-network", icon: Hospital, label: "Emergency Network" },
];

export const Route = createFileRoute("/navigation-hub")({
  component: NavigationHubPage,
});

function NavigationHubPage() {
  return (
    <MobileShell>
      <PageHeader title="Navigation Hub" subtitle="Routes & intel" backTo="/" />
      <div className="mt-4 space-y-2">
        {links.map((l) => (
          <Link
            key={l.label}
            to={l.to}
            params={"slug" in l && l.slug ? { slug: l.slug } : undefined}
            className="glass flex items-center gap-3 rounded-2xl p-4"
          >
            <l.icon className="h-5 w-5 text-electric" />
            <span className="font-bold">{l.label}</span>
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}
