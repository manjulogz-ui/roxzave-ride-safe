import { type ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cockpit text-foreground">
      {/* Subtle grid overlay */}
      <div className="pointer-events-none fixed inset-0 grid-lines opacity-40" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.20_235_/_0.18),transparent_70%)]" />

      <main className="relative mx-auto max-w-[460px] px-4 pb-32 pt-4">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
