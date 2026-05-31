import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mic } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/voice-distress")({
  component: VoiceDistressPage,
});

function VoiceDistressPage() {
  const [listening, setListening] = useState(false);

  return (
    <MobileShell>
      <PageHeader title="Voice Distress" subtitle="Emergency" backTo="/" />
      <button
        type="button"
        onClick={() => setListening(!listening)}
        className={`mx-auto mt-12 grid h-48 w-48 place-items-center rounded-full ${
          listening ? "bg-emergency-grad animate-pulse-emergency" : "glass"
        }`}
      >
        <Mic className="h-16 w-16" />
      </button>
      <p className="mt-6 text-center text-sm font-bold">{listening ? "Listening… Say Help Me" : "Tap to activate voice SOS"}</p>
      <Link to="/sos" className="glass mx-auto mt-6 block max-w-xs rounded-2xl py-3 text-center text-sm font-bold text-emergency">
        Open Emergency Center →
      </Link>
    </MobileShell>
  );
}
