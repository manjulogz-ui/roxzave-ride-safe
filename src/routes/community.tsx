import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { AlertTriangle, Droplets, Construction, Users, Search } from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "Community — Roxzave AI" }, { name: "description", content: "Community road watch — report potholes, accidents, flooding, and unsafe zones." }] }),
  component: CommunityPage,
});

const posts = [
  { user: "Rescue Community", time: "6 min ago", title: "Community reported road hazards", body: "Pothole cluster near Silk Board flyover — 4 verified reports in last hour. Reduce speed.", icon: AlertTriangle, tone: "text-emergency" },
  { user: "Hebbal Riders", time: "22 min ago", title: "Flooding alert · Outer Ring Road", body: "Knee-deep water near Nagavara junction after heavy rain. Avoid until 21:00.", icon: Droplets, tone: "text-electric" },
  { user: "City Watch", time: "1 hr ago", title: "Road work · Bannerghatta", body: "Single lane only between km 4–7. Expect 15–20 min delay.", icon: Construction, tone: "text-safety" },
];

function CommunityPage() {
  return (
    <MobileShell>
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Local Social</p>
        <h1 className="text-2xl font-black tracking-tight">Roxzave Community</h1>
      </div>

      <div className="glass mt-4 flex items-center gap-3 rounded-2xl px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input placeholder="Search hazards, routes, riders…" className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none" />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {["All", "Hazards", "Crime", "Weather", "Tips", "Routes"].map((c, i) => (
          <button key={c} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
            i === 0 ? "bg-electric-grad text-primary-foreground" : "glass text-muted-foreground"
          }`}>{c}</button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {posts.map((p) => (
          <article key={p.title} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-electric/15 text-electric"><Users className="h-4 w-4" /></div>
                <div className="leading-tight">
                  <p className="text-sm font-bold">{p.user}</p>
                  <p className="text-[10px] text-muted-foreground">{p.time}</p>
                </div>
              </div>
              <p.icon className={`h-5 w-5 ${p.tone}`} />
            </div>
            <p className="mt-3 text-sm font-bold">{p.title}</p>
            <p className="mt-1 text-[12px] text-muted-foreground">{p.body}</p>
            <div className="mt-3 flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <button className="text-success">↑ Verify (128)</button>
              <button>↓ Dispute (4)</button>
              <button>Comments · 32</button>
            </div>
          </article>
        ))}
      </div>
    </MobileShell>
  );
}
