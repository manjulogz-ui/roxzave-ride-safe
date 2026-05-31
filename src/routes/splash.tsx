import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/splash")({
  component: SplashPage,
});

function SplashPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const seen = localStorage.getItem("roxzave_onboarded");
    const t = setTimeout(() => {
      navigate({ to: seen ? "/" : "/onboarding" });
    }, 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cockpit">
      <div className="grid h-24 w-24 place-items-center rounded-3xl bg-electric-grad text-4xl font-black text-primary-foreground animate-pulse">
        R
      </div>
      <h1 className="mt-6 text-3xl font-black tracking-tight">Roxzave</h1>
      <p className="text-sm text-muted-foreground">Enterprise Road Safety</p>
    </div>
  );
}
