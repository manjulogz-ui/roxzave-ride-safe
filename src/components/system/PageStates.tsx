import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-electric" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function PageError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="glass flex min-h-[30vh] flex-col items-center justify-center gap-3 rounded-2xl p-6 text-center">
      <AlertCircle className="h-10 w-10 text-emergency" />
      <p className="text-sm text-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function PageEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="glass flex min-h-[24vh] flex-col items-center justify-center gap-2 rounded-2xl p-6 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="font-bold">{title}</p>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
