import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import { ArrowLeft, Phone, MapPin, HeartPulse, Droplet, MessageSquare, Share2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export const Route = createFileRoute("/sos")({
  head: () => ({
    meta: [
      { title: "SOS — Roxzave AI" },
      { name: "description", content: "One-tap emergency SOS with GPS, guardian alerts, and trauma assistant." },
    ],
  }),
  component: SOSPage,
});

function SOSPage() {
  const { isAuthenticated } = useAuth();
  const [holding, setHolding] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  const { data: emergencyNumbers } = useQuery({
    queryKey: ["emergency-numbers"],
    queryFn: async () => (await api.get<{ name: string; phone: string }[]>("/api/sos/emergency-numbers")).data,
  });

  const { data: contacts } = useQuery({
    queryKey: ["emergency-contacts"],
    queryFn: async () => {
      try {
        return (await api.get<{ name: string; phone: string }[]>("/api/user/emergency-contacts")).data;
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  const triggerSos = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/sos", {
        lat: location?.lat,
        lng: location?.lng,
        trigger_type: "manual",
      });
      return data;
    },
    onSuccess: () => setSent(true),
  });

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      void triggerSos.mutateAsync();
      setCountdown(null);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutate on countdown expiry only
  }, [countdown]);

  function trigger() {
    setHolding(false);
    setCountdown(10);
    setSent(false);
  }

  const allContacts = [
    ...(contacts ?? []).map((c) => ({ name: c.name, phone: c.phone })),
    ...(emergencyNumbers ?? []),
  ];

  const locationText = location ? `${location.lat},${location.lng}` : "";

  return (
    <MobileShell>
      <div className="flex items-center justify-between pt-2">
        <Link to="/" className="glass grid h-10 w-10 place-items-center rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emergency">Emergency Center</p>
        <span className="h-10 w-10" />
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Tap & hold to activate</p>
        <p className="mt-1 text-lg font-bold">Sends GPS · Calls guardians · Golden Hour SOS</p>
      </div>

      <div className="mt-8 grid place-items-center">
        <button
          type="button"
          onMouseDown={() => setHolding(true)}
          onMouseUp={() => holding && trigger()}
          onTouchStart={() => setHolding(true)}
          onTouchEnd={() => holding && trigger()}
          onClick={trigger}
          className="relative grid h-64 w-64 place-items-center rounded-full bg-emergency-grad text-white shadow-[0_30px_80px_-10px_oklch(0.65_0.25_25_/_0.6)] animate-pulse-emergency"
        >
          <div className="absolute inset-3 rounded-full border border-white/20" />
          <div className="text-center">
            <p className="text-6xl font-black tracking-tight">SOS</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.3em] opacity-90">
              {countdown !== null ? `Cancel in ${countdown}s` : sent ? "Alert Sent" : "One Tap Emergency"}
            </p>
          </div>
        </button>

        {countdown !== null && (
          <button
            type="button"
            onClick={() => setCountdown(null)}
            className="mt-5 rounded-full bg-white/10 px-6 py-2 text-sm font-bold uppercase tracking-wider"
          >
            Cancel
          </button>
        )}
        {sent && (
          <p className="mt-5 rounded-full bg-success/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-success">
            ✓ SOS recorded · Guardians notified
          </p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <a
          href={locationText ? `sms:?body=EMERGENCY%20https://maps.google.com/?q=${locationText}` : "sms:"}
          className="glass flex flex-col items-center rounded-2xl p-3 text-center"
        >
          <MessageSquare className="h-4 w-4 text-electric" />
          <span className="mt-1 text-[10px] font-bold uppercase">SMS</span>
        </a>
        <a
          href={locationText ? `https://maps.google.com/?q=${locationText}` : "#"}
          className="glass flex flex-col items-center rounded-2xl p-3 text-center"
        >
          <Share2 className="h-4 w-4 text-electric" />
          <span className="mt-1 text-[10px] font-bold uppercase">Share GPS</span>
        </a>
        <Link to="/guardian" className="glass flex flex-col items-center rounded-2xl p-3 text-center">
          <MapPin className="h-4 w-4 text-electric" />
          <span className="mt-1 text-[10px] font-bold uppercase">Tracking</span>
        </Link>
      </div>

      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Emergency Contacts</p>
        <div className="mt-2 space-y-2">
          {allContacts.map((c) => (
            <div key={`${c.name}-${c.phone}`} className="glass flex items-center justify-between rounded-2xl px-4 py-3">
              <div>
                <p className="text-sm font-bold">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">{c.phone}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${c.phone.replace(/\s/g, "")}`}
                  className="grid h-10 w-10 place-items-center rounded-full bg-success/20 text-success"
                  aria-label={`Call ${c.name}`}
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href={`sms:${c.phone.replace(/\s/g, "")}${locationText ? `?body=EMERGENCY%20Location:%20https://maps.google.com/?q=${locationText}` : ""}`}
                  className="grid h-10 w-10 place-items-center rounded-full bg-electric/20 text-electric"
                  aria-label={`SMS ${c.name}`}
                >
                  <MessageSquare className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Mini icon={<MapPin className="h-4 w-4" />} label="Share GPS" value={location ? "Live" : "…"} />
        <Mini icon={<Droplet className="h-4 w-4" />} label="Blood" value="Profile" />
        <Link to="/features/$slug" params={{ slug: "trauma-assistant" }} className="glass rounded-2xl p-3 text-center">
          <div className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-electric/15 text-electric">
            <HeartPulse className="h-4 w-4" />
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Trauma</p>
          <p className="text-sm font-bold">Assistant</p>
        </Link>
      </div>
    </MobileShell>
  );
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <div className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-electric/15 text-electric">{icon}</div>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
