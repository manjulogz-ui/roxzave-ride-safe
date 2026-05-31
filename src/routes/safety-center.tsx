import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PRD_FEATURES } from "@/lib/features/registry";

export const Route = createFileRoute("/safety-center")({
  component: SafetyCenterPage,
});

function SafetyCenterPage() {
  const safety = PRD_FEATURES.filter((f) => f.category === "safety" || f.category === "emergency");
  return (
    <MobileShell>
      <PageHeader title="Safety Center" subtitle="All modules" backTo="/" />
      <div className="mt-4 space-y-2 max-h-[70vh] overflow-y-auto scrollbar-hide">
        {safety.map((f) => {
          const Icon = f.icon;
          return (
            <Link key={f.slug} to="/features/$slug" params={{ slug: f.slug }} className="glass flex gap-3 rounded-2xl p-4">
              <Icon className={`h-5 w-5 shrink-0 ${f.color}`} />
              <div>
                <p className="font-bold">{f.title}</p>
                <p className="text-[11px] text-muted-foreground">{f.subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>
      <Link to="/sos" className="mt-4 block rounded-2xl bg-emergency-grad py-3 text-center font-bold text-white">
        Emergency Center
      </Link>
    </MobileShell>
  );
}
