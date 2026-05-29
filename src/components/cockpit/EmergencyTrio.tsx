import { Link } from "@tanstack/react-router";
import { Siren, ShieldAlert, Mic } from "lucide-react";

export function EmergencyTrio() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Link
        to="/sos"
        className="relative col-span-1 row-span-2 overflow-hidden rounded-3xl bg-emergency-grad p-5 text-white glow-emergency animate-pulse-emergency"
      >
        <div className="absolute inset-0 opacity-20 grid-lines" />
        <div className="relative flex h-full flex-col justify-between">
          <Siren className="h-10 w-10" strokeWidth={2.4} />
          <div>
            <p className="text-3xl font-black tracking-tight">SOS</p>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-90">One-tap emergency</p>
            <p className="mt-2 text-[10px] opacity-75">Hold 2s · Voice · Crash</p>
          </div>
        </div>
      </Link>

      <button className="relative overflow-hidden rounded-3xl bg-safety-grad p-4 text-left text-[oklch(0.18_0.05_60)]">
        <ShieldAlert className="h-6 w-6" strokeWidth={2.4} />
        <p className="mt-2 text-sm font-black leading-tight">WOMEN SAFETY<br/>SHIELD</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider opacity-80">Live tracking · Record</p>
      </button>

      <button className="relative overflow-hidden rounded-3xl bg-electric-grad p-4 text-left text-primary-foreground">
        <Mic className="h-6 w-6" strokeWidth={2.4} />
        <p className="mt-2 text-sm font-black leading-tight">VOICE<br/>DISTRESS</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider opacity-80">Help me · Emergency</p>
      </button>
    </div>
  );
}
