import { createFileRoute } from "@tanstack/react-router";
import { AppPage } from "@/components/layout/AppPage";
import { SafeRoutePlanner } from "@/components/navigation/SafeRoutePlanner";

export const Route = createFileRoute("/safe-route-engine")({
  component: SafeRouteEnginePage,
});

function SafeRouteEnginePage() {
  return (
    <AppPage title="Safe Route Engine" subtitle="OSM · GraphHopper" backTo="/assistant">
      <SafeRoutePlanner />
    </AppPage>
  );
}
