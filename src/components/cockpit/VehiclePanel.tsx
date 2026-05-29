import { Bike, Bluetooth, Battery, Activity } from "lucide-react";

export function VehiclePanel() {
  return (
    <div className="glass mt-3 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-electric/15 text-electric">
            <Bike className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Rider Mode · KA-05-MK-2204</p>
            <p className="text-[11px] text-muted-foreground">ESP32 Sentinel · MPU6050 calibrated</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-success">● Live</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat icon={<Bluetooth className="h-3.5 w-3.5" />} label="BLE" value="-52 dBm" />
        <Stat icon={<Battery className="h-3.5 w-3.5" />} label="Battery" value="86%" />
        <Stat icon={<Activity className="h-3.5 w-3.5" />} label="Lean" value="12°" />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-navy-deep/60 px-2 py-2">
      <p className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-electric">{value}</p>
    </div>
  );
}
