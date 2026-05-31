import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/safety-score")({
  beforeLoad: () => {
    throw redirect({ to: "/driving-score" });
  },
});
