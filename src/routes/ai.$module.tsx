import { createFileRoute } from "@tanstack/react-router";
import { AppPage } from "@/components/layout/AppPage";
import { FeatureDashboard } from "@/components/layout/FeatureDashboard";
import { getFeature } from "@/lib/features/registry";
import { Bot } from "lucide-react";
import { VoiceCopilot } from "@/components/voice/VoiceCopilot";
import { AIChat } from "@/components/assistant/AIChat";
import { SafeRoutePlanner } from "@/components/navigation/SafeRoutePlanner";

export const Route = createFileRoute("/ai/$module")({
  component: AIModulePage,
});

function AIModulePage() {
  const { module } = Route.useParams();
  const feature = getFeature(module);
  const title =
    feature?.title ??
    ({
      "ai-chat": "AI Chat Assistant",
      "risk-prediction": "Risk Prediction",
      "crash-prediction": "Crash Prediction AI",
      "fleet-analytics": "Fleet Analytics",
      "vehicle-health": "Vehicle Health",
    }[module] ?? module.replace(/-/g, " "));

  if (module === "ai-chat") {
    return (
      <AppPage title="AI Chat Assistant" subtitle="Natural language" backTo="/assistant">
        <AIChat />
      </AppPage>
    );
  }

  if (module === "voice-copilot") {
    return (
      <AppPage title="Voice Copilot" subtitle="Multilingual" backTo="/assistant">
        <VoiceCopilot />
      </AppPage>
    );
  }

  if (module === "safe-route") {
    return (
      <AppPage title="Safe Route Engine" backTo="/assistant">
        <SafeRoutePlanner />
      </AppPage>
    );
  }

  const fallbackFeature = feature ?? {
    slug: module,
    title,
    subtitle: "AI Module",
    description: "",
    icon: Bot,
    color: "text-electric",
    category: "ai" as const,
  };

  return (
    <AppPage title={fallbackFeature.title} subtitle="AI insights" backTo="/assistant">
      <FeatureDashboard feature={fallbackFeature} />
    </AppPage>
  );
}
