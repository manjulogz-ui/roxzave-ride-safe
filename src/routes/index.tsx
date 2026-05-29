import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/cockpit/StatusBar";
import { DestinationSearch } from "@/components/cockpit/DestinationSearch";
import { CockpitMap } from "@/components/cockpit/CockpitMap";
import { RouteToggle } from "@/components/cockpit/RouteToggle";
import { EmergencyTrio } from "@/components/cockpit/EmergencyTrio";
import { InfoCards } from "@/components/cockpit/InfoCards";
import { VehiclePanel } from "@/components/cockpit/VehiclePanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roxzave AI — Road Safety Cockpit" },
      { name: "description", content: "AI-powered road safety, emergency response, and women safety platform for riders, drivers, and families." },
      { property: "og:title", content: "Roxzave AI — Road Safety Cockpit" },
      { property: "og:description", content: "Prevent accidents, survive emergencies, and travel safer with the Roxzave AI cockpit." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <MobileShell>
      <StatusBar />
      <DestinationSearch />
      <CockpitMap />
      <RouteToggle />
      <EmergencyTrio />
      <VehiclePanel />
      <InfoCards />
    </MobileShell>
  );
}
