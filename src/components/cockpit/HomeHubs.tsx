import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PRODUCT_HUBS, QUICK_LINKS } from "@/lib/features/home-hubs";

export function HomeHubs() {
  return (
    <div className="mt-4 space-y-5">
      {PRODUCT_HUBS.map((hub) => (
        <section key={hub.id}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.15em] text-electric">{hub.title}</h2>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {hub.cards.map((card) => (
              <Link
                key={`${hub.id}-${card.title}`}
                to={card.to}
                {...(card.params ? { params: card.params } : {})}
                className="glass flex flex-col rounded-2xl p-3 transition active:scale-[0.98]"
              >
                <card.icon className={`h-5 w-5 ${card.color}`} />
                <p className="mt-2 text-[12px] font-bold leading-tight">{card.title}</p>
                <p className="text-[10px] text-muted-foreground">{card.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2 className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">Quick access</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.label}
              to={q.to}
              {...("params" in q && q.params ? { params: q.params } : {})}
              className="glass flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold"
            >
              <q.icon className="h-4 w-4 text-electric" />
              {q.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
