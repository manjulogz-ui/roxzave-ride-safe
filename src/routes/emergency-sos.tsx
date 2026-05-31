import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/emergency-sos")({
  beforeLoad: () => {
    throw redirect({ to: "/sos" });
  },
});
