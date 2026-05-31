import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/cockpit/StatusBar";
import { DestinationSearch } from "@/components/cockpit/DestinationSearch";
import { LiveMap } from "@/components/map/LiveMap";
import { RouteToggle } from "@/components/cockpit/RouteToggle";
import { EmergencyTrio } from "@/components/cockpit/EmergencyTrio";
import { HomeHero } from "@/components/home/HomeHero";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { RouteBoundary } from "@/components/system/RouteBoundary";

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
      <RouteBoundary title="Home">
        <StatusBar />
        <HomeHero />
        <EmergencyTrio />
        <FeatureGrid />
        <DestinationSearch />
        <LiveMap />
        <RouteToggle />
      </RouteBoundary>
    </MobileShell>
  );
}
