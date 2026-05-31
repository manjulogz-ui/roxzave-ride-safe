import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { ShieldAlert, Mic } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/women-safety")({
  component: WomenSafetyPage,
});

function WomenSafetyPage() {
  const trigger = useMutation({
    mutationFn: async () => {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 }),
      ).catch(() => null);
      const { data } = await api.post("/api/women-safety/incident", {
        incident_type: "panic",
        lat: pos?.coords.latitude ?? 12.97,
        lng: pos?.coords.longitude ?? 77.59,
        record_audio: false,
      });
      return data;
    },
  });

  return (
    <MobileShell>
      <PageHeader title="Women Safety Shield" subtitle="Protection" backTo="/" />
      <div className="glass mt-4 flex items-center gap-3 rounded-2xl p-4">
        <ShieldAlert className="h-10 w-10 text-safety" />
        <p className="text-sm">Live tracking, recording, and guardian alerts</p>
      </div>

      <Button
        className="mt-4 w-full bg-safety-grad py-6 text-lg font-black"
        onClick={() => trigger.mutate()}
        disabled={trigger.isPending}
      >
        ACTIVATE SHIELD
      </Button>
      {trigger.data && (
        <p className="mt-2 text-center text-sm text-success">
          Incident {String(trigger.data.incident_id).slice(0, 8)}… · {trigger.data.guardians_notified} guardians notified
        </p>
      )}

      <Link
        to="/features/$slug"
        params={{ slug: "women-safe-route" }}
        className="glass mt-4 block rounded-2xl p-3 text-center text-sm font-bold text-electric"
      >
        Women Safe Route →
      </Link>
      <Link to="/voice-distress" className="glass mt-2 flex items-center justify-center gap-2 rounded-2xl p-3 text-sm font-bold">
        <Mic className="h-4 w-4" /> Voice Distress →
      </Link>
      <Link to="/guardian" className="glass mt-2 block rounded-2xl p-3 text-center text-sm font-bold">
        Guardian Tracking →
      </Link>
    </MobileShell>
  );
}
