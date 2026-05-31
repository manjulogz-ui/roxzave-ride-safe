import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getFeature } from "@/lib/features/registry";
import { SafetyModulePage } from "@/components/layout/SafetyModulePage";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeatureDashboard } from "@/components/layout/FeatureDashboard";
import { FuelCostFeature } from "@/components/features/FuelCostFeature";
import { SafeRoutePlanner } from "@/components/navigation/SafeRoutePlanner";

const API_SLUGS = new Set([
  "drowsiness-detection",
  "crash-detection",
  "pothole-detection",
  "golden-hour-sos",
  "trauma-assistant",
  "women-safety",
  "emergency-network",
  "toll-intelligence",
  "traffic-law",
]);

export const Route = createFileRoute("/features/$slug")({
  component: FeaturePage,
  loader: ({ params }) => {
    const feature = getFeature(params.slug);
    if (!feature) throw notFound();
    return feature;
  },
});

function FeaturePage() {
  const feature = Route.useLoaderData();

  if (feature.slug === "fuel-cost") {
    return <FuelCostFeature feature={feature} />;
  }

  if (feature.slug === "safe-route" || feature.slug === "women-safe-route") {
    return (
      <MobileShell>
        <PageHeader title={feature.title} subtitle={feature.subtitle} backTo="/" />
        <SafeRoutePlanner />
      </MobileShell>
    );
  }

  if (API_SLUGS.has(feature.slug)) {
    const extra =
      feature.slug === "golden-hour-sos" ? (
        <Link to="/sos" className="flex-1 rounded-xl bg-emergency-grad py-2 text-center text-sm font-bold text-white">
          Open SOS
        </Link>
      ) : undefined;
    return <SafetyModulePage feature={feature} extraActions={extra} />;
  }

  return (
    <MobileShell>
      <PageHeader title={feature.title} subtitle={feature.subtitle} backTo="/features" />
      <FeatureDashboard feature={feature} />
    </MobileShell>
  );
}
