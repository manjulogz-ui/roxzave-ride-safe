import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ArrowLeft, Phone, MapPin, HeartPulse, Droplet } from "lucide-react";

export const Route = createFileRoute("/sos")({
  head: () => ({
    meta: [
      { title: "SOS — Roxzave AI" },
      { name: "description", content: "One-tap emergency SOS with GPS, guardian alerts, and trauma assistant." },
    ],
  }),
  component: SOSPage,
});

function SOSPage() {
  const [holding, setHolding] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { setSent(true); setCountdown(null); return; }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function trigger() {
    setHolding(false);
    setCountdown(10);
    setSent(false);
  }

  return (
    <MobileShell>
      <div className="flex items-center justify-between pt-2">
        <Link to="/" className="glass grid h-10 w-10 place-items-center rounded-xl"><ArrowLeft className="h-5 w-5" /></Link>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emergency">Emergency Mode</p>
        <span className="h-10 w-10" />
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Tap & hold to activate</p>
        <p className="mt-1 text-lg font-bold">Sends GPS · Calls guardians · Shares medical profile</p>
      </div>

      <div className="mt-8 grid place-items-center">
        <button
          onMouseDown={() => setHolding(true)}
          onMouseUp={() => holding && trigger()}
          onTouchStart={() => setHolding(true)}
          onTouchEnd={() => holding && trigger()}
          onClick={trigger}
          className="relative grid h-64 w-64 place-items-center rounded-full bg-emergency-grad text-white shadow-[0_30px_80px_-10px_oklch(0.65_0.25_25_/_0.6)] animate-pulse-emergency"
        >
          <div className="absolute inset-3 rounded-full border border-white/20" />
          <div className="text-center">
            <p className="text-6xl font-black tracking-tight">SOS</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.3em] opacity-90">
              {countdown !== null ? `Cancel in ${countdown}s` : sent ? "Alert Sent" : "One Tap Emergency"}
            </p>
          </div>
        </button>

        {countdown !== null && (
          <button
            onClick={() => setCountdown(null)}
            className="mt-5 rounded-full bg-white/10 px-6 py-2 text-sm font-bold uppercase tracking-wider"
          >
            Cancel
          </button>
        )}
        {sent && (
          <p className="mt-5 rounded-full bg-success/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-success">
            ✓ Alerts dispatched · 2 guardians notified
          </p>
        )}
      </div>

      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Emergency Contacts</p>
        <div className="mt-2 space-y-2">
          {[
            { name: "Aarav (Father)", phone: "+91 98xxx 11220" },
            { name: "Riya (Spouse)", phone: "+91 98xxx 87412" },
            { name: "Local Ambulance · 108", phone: "108" },
          ].map((c) => (
            <div key={c.name} className="glass flex items-center justify-between rounded-2xl px-4 py-3">
              <div>
                <p className="text-sm font-bold">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">{c.phone}</p>
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-success/20 text-success">
                <Phone className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Mini icon={<MapPin className="h-4 w-4" />} label="Share GPS" value="Live" />
        <Mini icon={<Droplet className="h-4 w-4" />} label="Blood" value="O+" />
        <Mini icon={<HeartPulse className="h-4 w-4" />} label="Allergies" value="None" />
      </div>
    </MobileShell>
  );
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <div className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-electric/15 text-electric">{icon}</div>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
