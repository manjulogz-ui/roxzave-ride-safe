import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAuth } from "@/lib/auth/route-guard";
import { api } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/notifications")({
  beforeLoad: requireAuth,
  component: NotificationsPage,
});

type Notification = {
  id: string;
  category: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

const CATEGORIES = ["all", "safety", "community", "sos", "route", "guardian"];

function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: async () => {
      const { data } = await api.get<Notification[]>("/api/notifications", {
        params: filter !== "all" ? { category: filter } : {},
      });
      return data;
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/api/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAll = useMutation({
    mutationFn: () => api.post("/api/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <MobileShell>
      <PageHeader title="Notifications" subtitle="Alert Center" backTo="/" />
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
              filter === c ? "bg-electric-grad text-primary-foreground" : "glass"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => markAll.mutate()} className="mt-3 text-xs font-bold text-electric">
        Mark all read
      </button>
      <div className="mt-4 space-y-2">
        {isLoading
          ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
          : (data ?? []).map((n) => (
              <article
                key={n.id}
                className={`glass rounded-2xl p-4 ${!n.is_read ? "border border-electric/30" : ""}`}
                onClick={() => !n.is_read && markRead.mutate(n.id)}
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{n.category}</p>
                <p className="text-sm font-bold">{n.title}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">{n.body}</p>
              </article>
            ))}
        {!isLoading && !data?.length && (
          <p className="py-12 text-center text-sm text-muted-foreground">No notifications yet</p>
        )}
      </div>
    </MobileShell>
  );
}
