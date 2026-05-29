import { Bell, UserCircle2 } from "lucide-react";

export function StatusBar() {
  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-electric-grad grid place-items-center text-primary-foreground font-black shadow-[0_0_20px_oklch(0.72_0.20_235_/_0.45)]">
          R
        </div>
        <div className="leading-tight">
          <p className="text-base font-bold tracking-tight">Roxzave</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AI Cockpit</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="glass relative h-10 w-10 rounded-xl grid place-items-center">
          <Bell className="h-4 w-4 text-foreground/80" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emergency shadow-[0_0_8px_var(--emergency-glow)]" />
        </button>
        <button className="glass h-10 w-10 rounded-xl grid place-items-center">
          <UserCircle2 className="h-5 w-5 text-foreground/80" />
        </button>
      </div>
    </div>
  );
}
