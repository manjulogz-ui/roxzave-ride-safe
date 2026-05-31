import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAuth } from "@/lib/auth/route-guard";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bluetooth, Cpu } from "lucide-react";

export const Route = createFileRoute("/devices")({
  beforeLoad: requireAuth,
  component: DevicesPage,
});

function DevicesPage() {
  const [deviceId, setDeviceId] = useState("esp32-roxzave-001");
  const [status, setStatus] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState(true);

  const register = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/device/register", {
        device_id: deviceId,
        device_type: "esp32_mpu6050",
        firmware_version: "1.0.0",
      });
      return data;
    },
    onSuccess: () => setStatus("Device registered"),
  });

  const checkStatus = useMutation({
    mutationFn: async () => {
      const { data } = await api.get(`/api/device/status/${deviceId}`);
      return data;
    },
    onSuccess: (d) => setStatus(JSON.stringify(d)),
  });

  const sendTelemetry = useMutation({
    mutationFn: () =>
      api.post("/api/device/telemetry", {
        device_id: deviceId,
        speed_kmh: 42,
        acceleration_g: 0.2,
        tilt_angle: 5,
        battery_level: 88,
        drowsiness_score: mockMode ? 72 : 25,
        mock_mode: mockMode,
        lat: 12.97,
        lng: 77.59,
      }),
    onSuccess: () => setStatus(mockMode ? "Mock telemetry + drowsiness logged" : "Live telemetry sent"),
  });

  return (
    <MobileShell>
      <PageHeader title="BLE / ESP32" subtitle="Device Hub" backTo="/profile" />
      <div className="glass mt-4 rounded-2xl p-4">
        <Bluetooth className="h-8 w-8 text-electric" />
        <p className="mt-2 text-sm font-bold">MPU6050 · Crash · Drowsiness</p>
        <Input className="mt-3" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} />
        <label className="mt-3 flex items-center gap-2 text-[12px]">
          <input type="checkbox" checked={mockMode} onChange={(e) => setMockMode(e.target.checked)} />
          Mock device mode (simulated MPU6050 / drowsiness)
        </label>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button size="sm" onClick={() => register.mutate()}>
            Pair / Register
          </Button>
          <Button size="sm" variant="outline" onClick={() => checkStatus.mutate()}>
            Status
          </Button>
          <Button size="sm" variant="outline" className="col-span-2" onClick={() => sendTelemetry.mutate()}>
            Send test telemetry
          </Button>
        </div>
        {status && <p className="mt-3 text-[11px] text-success">{status}</p>}
      </div>
      <div className="glass mt-4 flex items-center gap-3 rounded-2xl p-4">
        <Cpu className="h-5 w-5" />
        <p className="text-[12px] text-muted-foreground">Live diagnostics stream via WebSocket when device is online.</p>
      </div>
    </MobileShell>
  );
}
