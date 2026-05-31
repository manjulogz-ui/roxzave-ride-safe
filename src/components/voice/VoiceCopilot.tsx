import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Mic, MicOff } from "lucide-react";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

const LANGS = [
  { code: "en", label: "English" },
  { code: "ta", label: "Tamil" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
];

export function VoiceCopilot() {
  const [lang, setLang] = useState("en");
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const { data: prompts } = useQuery({
    queryKey: ["voice-prompts", lang],
    queryFn: async () => (await api.get(`/api/voice/prompts?language=${lang}`)).data as { prompts: string[] },
  });

  const command = useMutation({
    mutationFn: async (text: string) => {
      const { data } = await api.post<{
        recognized: boolean;
        response: string;
        navigate_to?: string;
      }>("/api/voice/command", { text, language: lang });
      return data;
    },
    onSuccess: (data) => {
      if (data.navigate_to && typeof window !== "undefined") {
        window.location.href = data.navigate_to;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(data.response);
        u.lang = lang === "en" ? "en-IN" : `${lang}-IN`;
        window.speechSynthesis.speak(u);
      }
    },
  });

  const startListening = () => {
    const SR = (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
      || window.SpeechRecognition;
    if (!SR) {
      setTranscript("Speech recognition not supported in this browser.");
      return;
    }
    const rec = new SR();
    rec.lang = lang === "en" ? "en-IN" : `${lang}-IN`;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      command.mutate(text);
    };
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  return (
    <div className="glass mt-4 space-y-4 rounded-2xl p-4">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="w-full rounded-lg bg-secondary/50 px-3 py-2 text-sm"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <Button className="w-full gap-2" onClick={startListening} disabled={listening}>
        {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {listening ? "Listening…" : "Voice command"}
      </Button>
      {transcript && <p className="text-sm text-muted-foreground">Heard: {transcript}</p>}
      {command.data?.response && <p className="text-sm font-bold text-electric">{command.data.response}</p>}
      <ul className="space-y-1">
        {(prompts?.prompts ?? []).map((p) => (
          <li key={p}>
            <button
              type="button"
              className="w-full rounded-lg bg-secondary/40 px-3 py-2 text-left text-[12px]"
              onClick={() => command.mutate(p)}
            >
              {p}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
