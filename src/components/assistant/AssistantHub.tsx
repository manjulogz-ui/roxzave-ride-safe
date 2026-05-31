import { Link } from "@tanstack/react-router";
import { ASSISTANT_MODULES } from "@/lib/navigation/app-routes";

export function AssistantHub() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {ASSISTANT_MODULES.map((m) => (
        <Link
          key={m.slug}
          to={m.route.to}
          {...("params" in m.route && m.route.params ? { params: m.route.params } : {})}
          className="glass rounded-2xl p-4 transition active:scale-[0.98]"
        >
          <p className="text-sm font-bold leading-tight">{m.title}</p>
        </Link>
      ))}
    </div>
  );
}
