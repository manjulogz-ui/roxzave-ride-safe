import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PRD_FEATURES } from "@/lib/features/registry";

export const Route = createFileRoute("/features")({
  component: FeaturesIndexPage,
});

function FeaturesIndexPage() {
  return (
    <MobileShell>
      <PageHeader title="All Features" subtitle="Enterprise PRD" backTo="/" />
      <div className="mt-4 space-y-2 max-h-[70vh] overflow-y-auto scrollbar-hide">
        {PRD_FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Link
              key={f.slug}
              to="/features/$slug"
              params={{ slug: f.slug }}
              className="glass flex items-center gap-3 rounded-2xl p-4"
            >
              <Icon className={`h-5 w-5 ${f.color}`} />
              <div>
                <p className="text-sm font-bold">{f.title}</p>
                <p className="text-[11px] text-muted-foreground">{f.subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </MobileShell>
  );
}
