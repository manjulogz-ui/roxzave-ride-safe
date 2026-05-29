import { Crosshair, Navigation2, ShieldCheck } from "lucide-react";

export function CockpitMap() {
  return (
    <div className="glass relative mt-4 overflow-hidden rounded-3xl">
      <div className="relative h-64 w-full bg-[radial-gradient(circle_at_50%_55%,oklch(0.30_0.10_240),oklch(0.12_0.04_255)_70%)]">
        {/* faux roads */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 260" fill="none">
          <defs>
            <linearGradient id="r1" x1="0" x2="1">
              <stop offset="0" stopColor="oklch(0.72 0.20 235)" stopOpacity="0.1" />
              <stop offset="0.5" stopColor="oklch(0.72 0.20 235)" stopOpacity="0.9" />
              <stop offset="1" stopColor="oklch(0.72 0.20 235)" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="r2" x1="0" x2="1">
              <stop offset="0" stopColor="oklch(0.74 0.18 150)" stopOpacity="0.1" />
              <stop offset="0.5" stopColor="oklch(0.74 0.18 150)" stopOpacity="0.9" />
              <stop offset="1" stopColor="oklch(0.74 0.18 150)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d="M-20,200 C 80,160 140,240 220,160 S 360,80 420,120" stroke="url(#r1)" strokeWidth="3" fill="none" strokeDasharray="6 6" />
          <path d="M-20,220 C 100,200 180,120 260,180 S 380,220 420,180" stroke="url(#r2)" strokeWidth="3" fill="none" />
          <circle cx="200" cy="130" r="34" fill="oklch(0.72 0.20 235 / 0.08)" />
          <circle cx="200" cy="130" r="22" fill="oklch(0.72 0.20 235 / 0.15)" />
        </svg>

        {/* car icon */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-electric-grad shadow-[0_0_30px_var(--electric-glow)]">
            <Navigation2 className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>

        {/* route badges */}
        <div className="absolute right-3 top-3 glass rounded-xl px-3 py-1.5 text-xs">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Safer Route</p>
          <p className="font-bold text-success">● 95<span className="text-muted-foreground">/100</span></p>
        </div>
        <div className="absolute bottom-3 left-3 glass rounded-xl px-3 py-1.5 text-xs">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Alt Route</p>
          <p className="font-bold text-safety">● 68<span className="text-muted-foreground">/100</span></p>
        </div>

        <button className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full glass-strong">
          <Crosshair className="h-4 w-4 text-electric" />
        </button>
      </div>

      {/* telemetry strip */}
      <div className="grid grid-cols-3 divide-x divide-border/40 border-t border-border/40 bg-navy-deep/60 px-3 py-3 text-center text-xs">
        <Metric label="Driving Score" value="89" suffix="/100" tone="electric" />
        <Metric label="Road Quality" value="78" suffix="/100" tone="safety" />
        <Metric label="ESP32" value="Connected" tone="success" icon={<ShieldCheck className="h-3.5 w-3.5" />} />
      </div>
    </div>
  );
}

function Metric({
  label, value, suffix, tone, icon,
}: { label: string; value: string; suffix?: string; tone: "electric" | "safety" | "success"; icon?: React.ReactNode }) {
  const toneClass = tone === "electric" ? "text-electric" : tone === "safety" ? "text-safety" : "text-success";
  return (
    <div className="px-2">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 flex items-center justify-center gap-1 text-sm font-bold ${toneClass}`}>
        {icon}{value}{suffix && <span className="text-muted-foreground font-medium">{suffix}</span>}
      </p>
    </div>
  );
}
