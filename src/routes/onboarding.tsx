import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Map, Siren } from "lucide-react";

const slides = [
  { icon: Shield, title: "AI Safety Cockpit", body: "20+ enterprise safety modules for every journey." },
  { icon: Siren, title: "Golden Hour SOS", body: "One-tap emergency with GPS, guardians, and trauma assist." },
  { icon: Map, title: "Safe Routes", body: "Crime zones, potholes, schools, and women-safe corridors." },
];

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const Slide = slides[step].icon;

  function finish() {
    localStorage.setItem("roxzave_onboarded", "1");
    navigate({ to: "/login" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-cockpit px-6 py-12">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-electric/20">
          <Slide className="h-8 w-8 text-electric" />
        </div>
        <h2 className="mt-6 text-2xl font-black">{slides[step].title}</h2>
        <p className="mt-2 max-w-xs text-muted-foreground">{slides[step].body}</p>
      </div>
      <div className="flex gap-2">
        {step < slides.length - 1 ? (
          <Button className="w-full" onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        ) : (
          <Button className="w-full" onClick={finish}>
            Get Started
          </Button>
        )}
        <Button variant="ghost" onClick={finish}>
          Skip
        </Button>
      </div>
    </div>
  );
}
