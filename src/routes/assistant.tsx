import { createFileRoute } from "@tanstack/react-router";
import { AppPage } from "@/components/layout/AppPage";
import { AssistantHub } from "@/components/assistant/AssistantHub";

export const Route = createFileRoute("/assistant")({
  component: AssistantPage,
});

function AssistantPage() {
  return (
    <AppPage title="AI Assistant" subtitle="Safety intelligence" backTo="/">
      <AssistantHub />
    </AppPage>
  );
}
