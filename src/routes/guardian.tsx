import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAuth } from "@/lib/auth/route-guard";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Users } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const Route = createFileRoute("/guardian")({
  beforeLoad: requireAuth,
  component: GuardianPage,
});

function GuardianPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState("Connecting…");
  const [lastLocation, setLastLocation] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const ws = new WebSocket(`${API_URL.replace("http", "ws")}/ws/guardian/${user.userId}`);
    ws.onopen = () => setStatus("Live tracking active");
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.lat) setLastLocation(`${data.lat.toFixed(4)}, ${data.lng?.toFixed(4)}`);
      } catch {
        /* ignore */
      }
    };
    ws.onerror = () => setStatus("WebSocket offline — enable backend");
    return () => ws.close();
  }, [user]);

  useEffect(() => {
    if (!navigator.geolocation || !user) return;
    const id = navigator.geolocation.watchPosition((pos) => {
      const wsUrl = `${API_URL.replace("http", "ws")}/ws/guardian/${user.userId}`;
      try {
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          ws.send(JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude, speed: pos.coords.speed }));
          ws.close();
        };
      } catch {
        /* ignore */
      }
    });
    return () => navigator.geolocation.clearWatch(id);
  }, [user]);

  return (
    <MobileShell>
      <PageHeader title="Guardian Tracking" subtitle="Family Live" backTo="/" />
      <div className="glass mt-6 rounded-2xl p-6 text-center">
        <Users className="mx-auto h-12 w-12 text-electric" />
        <p className="mt-4 text-sm font-bold">{status}</p>
        {lastLocation && <p className="mt-2 text-xs text-muted-foreground">Last: {lastLocation}</p>}
        <p className="mt-4 text-[11px] text-muted-foreground">Guardians receive real-time location via WebSocket</p>
      </div>
    </MobileShell>
  );
}
