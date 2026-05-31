import { createFileRoute } from "@tanstack/react-router";
import { AppPage } from "@/components/layout/AppPage";
import { AssistantHub } from "@/components/assistant/AssistantHub";

/** Legacy path — same hub as /assistant */
export const Route = createFileRoute("/ai")({
  component: AIHubPage,
});

function AIHubPage() {
  return (
    <AppPage title="AI Assistant" subtitle="Copilot" backTo="/">
      <AssistantHub />
    </AppPage>
  );
}
