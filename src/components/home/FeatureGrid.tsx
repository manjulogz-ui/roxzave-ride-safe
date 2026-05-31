import { Link } from "@tanstack/react-router";
import { HOME_FEATURE_GRID } from "@/lib/navigation/app-routes";

export function FeatureGrid() {
  return (
    <section className="mt-5">
      <h2 className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-electric">Features</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {HOME_FEATURE_GRID.map((card) => {
          const Icon = card.icon;
          const route = card.route;
          return (
            <Link
              key={card.title}
              to={route.to}
              {...("params" in route && route.params ? { params: route.params } : {})}
              className="glass flex flex-col rounded-2xl p-3 transition active:scale-[0.98]"
            >
              <Icon className={`h-5 w-5 ${card.color}`} />
              <p className="mt-2 text-[12px] font-bold leading-tight">{card.title}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
