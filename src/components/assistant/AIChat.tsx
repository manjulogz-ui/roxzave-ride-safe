import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "Why is my safety score low?",
  "Suggest a safer route.",
  "What caused my risk score?",
];

export function AIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);

  const send = useMutation({
    mutationFn: async (text: string) => {
      const { data } = await api.post("/api/voice/command", { text, language: "en" });
      return data as { response: string; navigate_to?: string };
    },
    onSuccess: (data, text) => {
      setMessages((m) => [
        ...m,
        { role: "user", text },
        { role: "assistant", text: data.response },
      ]);
      if (data.navigate_to) {
        setTimeout(() => {
          window.location.href = data.navigate_to!;
        }, 1500);
      }
    },
  });

  return (
    <div className="mt-4 space-y-3">
      <div className="glass max-h-64 space-y-2 overflow-y-auto rounded-2xl p-3 scrollbar-hide">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Ask Roxzave about safety, routes, or your score.</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-xl px-3 py-2 text-[12px] ${m.role === "user" ? "ml-8 bg-electric/15" : "mr-8 bg-secondary/50"}`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="rounded-full bg-secondary/50 px-3 py-1 text-[11px] font-medium"
            onClick={() => {
              setInput(s);
              send.mutate(s);
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && input.trim() && send.mutate(input.trim())}
          placeholder="Ask Roxzave AI…"
          className="flex-1 rounded-xl bg-secondary/50 px-3 py-2 text-sm"
        />
        <Button disabled={send.isPending || !input.trim()} onClick={() => send.mutate(input.trim())}>
          Send
        </Button>
      </div>
    </div>
  );
}
