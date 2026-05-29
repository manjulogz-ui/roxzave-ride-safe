import { useState } from "react";
import { Zap, ShieldCheck } from "lucide-react";

export function RouteToggle() {
  const [mode, setMode] = useState<"fast" | "safe">("safe");
  return (
    <div className="glass mt-4 grid grid-cols-2 rounded-2xl p-1">
      <button
        onClick={() => setMode("fast")}
        className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
          mode === "fast" ? "bg-electric/15 text-electric ring-electric" : "text-muted-foreground"
        }`}
      >
        <Zap className="h-4 w-4" /> Fastest
      </button>
      <button
        onClick={() => setMode("safe")}
        className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
          mode === "safe" ? "bg-success/15 text-success ring-1 ring-success/40" : "text-muted-foreground"
        }`}
      >
        <ShieldCheck className="h-4 w-4" /> Safest
      </button>
    </div>
  );
}
