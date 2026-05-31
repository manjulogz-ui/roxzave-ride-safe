import { useEffect, useState } from "react";
import { checkApiHealth } from "@/lib/api/client";
import { Loader2, Wifi, WifiOff } from "lucide-react";

export function ApiHealthBanner() {
  const [health, setHealth] = useState<{ ok: boolean; database?: string } | null>(null);

  useEffect(() => {
    checkApiHealth().then(setHealth);
    const id = setInterval(() => checkApiHealth().then(setHealth), 15000);
    return () => clearInterval(id);
  }, []);

  if (health === null) {
    return (
      <p className="mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Checking API…
      </p>
    );
  }

  if (health.ok) {
    return (
      <p className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-success/15 px-3 py-2 text-xs text-success">
        <Wifi className="h-3 w-3" /> API connected · {health.database}
      </p>
    );
  }

  return (
    <div className="mb-4 rounded-lg bg-emergency/15 px-3 py-2 text-xs text-emergency">
      <p className="flex items-center gap-2 font-bold">
        <WifiOff className="h-3 w-3" /> Backend offline
      </p>
      <p className="mt-1 text-[11px] opacity-90">
        Run: <code className="rounded bg-black/30 px-1">cd backend && python -m uvicorn app.main:app --port 8000</code>
      </p>
    </div>
  );
}
