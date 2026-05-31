import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import { AlertTriangle, Droplets, Construction, Users, Search } from "lucide-react";
import { api } from "@/lib/api/client";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Roxzave AI" },
      { name: "description", content: "Community road watch — report potholes, accidents, flooding, and unsafe zones." },
    ],
  }),
  component: CommunityPage,
});

const iconMap: Record<string, typeof AlertTriangle> = {
  hazards: AlertTriangle,
  weather: Droplets,
  routes: Construction,
};

function CommunityPage() {
  const [category, setCategory] = useState("all");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["community-posts", category],
    queryFn: async () => {
      const { data } = await api.get<
        { id: string; title: string; body: string; community_name: string; category: string; verify_count: number; author_name: string }[]
      >("/api/community/posts", { params: category !== "all" ? { category } : {} });
      return data;
    },
  });

  return (
    <MobileShell>
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Local Social</p>
        <h1 className="text-2xl font-black tracking-tight">Roxzave Community</h1>
      </div>

      <div className="mt-4 flex gap-2">
        <Link to="/hazards" className="glass flex-1 rounded-xl py-2.5 text-center text-sm font-bold text-electric">
          Report hazard
        </Link>
      </div>

      <div className="glass mt-4 flex items-center gap-3 rounded-2xl px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search hazards, routes, riders…"
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {["all", "hazards", "crime", "weather", "tips", "routes"].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
              category === c ? "bg-electric-grad text-primary-foreground" : "glass text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 max-h-[calc(100vh-280px)] space-y-3 overflow-y-auto scrollbar-hide">
        {isLoading && <p className="text-sm text-muted-foreground">Loading feed…</p>}
        {(posts ?? []).map((p) => {
          const Icon = iconMap[p.category] ?? AlertTriangle;
          return (
            <Link key={p.id} to="/community/$postId" params={{ postId: p.id }}>
              <article className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-electric/15 text-electric">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="leading-tight">
                      <p className="text-sm font-bold">{p.author_name ?? p.community_name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.category}</p>
                    </div>
                  </div>
                  <Icon className="h-5 w-5 text-emergency" />
                </div>
                <p className="mt-3 text-sm font-bold">{p.title}</p>
                <p className="mt-1 text-[12px] text-muted-foreground line-clamp-2">{p.body}</p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-success">
                  ↑ Verify ({p.verify_count})
                </p>
              </article>
            </Link>
          );
        })}
        {!isLoading && !posts?.length && (
          <p className="py-8 text-center text-sm text-muted-foreground">No posts — start the backend and seed data</p>
        )}
      </div>
    </MobileShell>
  );
}
