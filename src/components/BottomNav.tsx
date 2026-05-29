import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Route as RouteIcon, Users, BarChart3, Siren } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/trips", label: "Trips", icon: RouteIcon },
  { to: "/sos", label: "SOS", icon: Siren, danger: true },
  { to: "/community", label: "Community", icon: Users },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-[460px] px-3 pb-3">
        <div className="glass-strong relative flex items-end justify-between rounded-3xl px-2 py-2">
          {items.map(({ to, label, icon: Icon, danger }) => {
            const active = path === to;
            if (danger) {
              return (
                <Link
                  key={to}
                  to={to}
                  aria-label="SOS"
                  className="-mt-8 flex flex-col items-center"
                >
                  <span className="relative grid h-16 w-16 place-items-center rounded-full bg-emergency-grad text-white shadow-[0_10px_30px_-5px_oklch(0.65_0.25_25_/_0.7)] animate-pulse-emergency">
                    <Siren className="h-7 w-7" strokeWidth={2.5} />
                  </span>
                  <span className="mt-1 text-[10px] font-bold tracking-wider text-emergency">SOS</span>
                </Link>
              );
            }
            return (
              <Link
                key={to}
                to={to}
                className={`flex min-w-[58px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] transition ${
                  active ? "text-electric" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span className="font-medium">{label}</span>
                {active && <span className="h-1 w-1 rounded-full bg-electric shadow-[0_0_8px_var(--electric-glow)]" />}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
