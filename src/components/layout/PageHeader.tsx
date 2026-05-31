import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  backTo = "/",
  action,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 pt-2">
      <div className="flex items-start gap-3">
        <Link to={backTo} className="glass grid h-10 w-10 shrink-0 place-items-center rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          {subtitle && <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{subtitle}</p>}
          <h1 className="text-xl font-black tracking-tight">{title}</h1>
        </div>
      </div>
      {action}
    </div>
  );
}
