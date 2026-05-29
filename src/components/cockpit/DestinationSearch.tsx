import { Search, Mic } from "lucide-react";

export function DestinationSearch() {
  return (
    <div className="glass mt-4 flex items-center gap-3 rounded-2xl px-4 py-3.5">
      <Search className="h-5 w-5 text-muted-foreground" />
      <input
        placeholder="Enter destination"
        className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
      />
      <button className="grid h-8 w-8 place-items-center rounded-lg bg-electric/20 text-electric">
        <Mic className="h-4 w-4" />
      </button>
    </div>
  );
}
