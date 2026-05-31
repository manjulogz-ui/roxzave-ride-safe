import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ride-tracker")({
  beforeLoad: () => {
    throw redirect({ to: "/trips" });
  },
});
