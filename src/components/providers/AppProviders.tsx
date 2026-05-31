import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getQueryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/lib/auth/AuthProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  const client = getQueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
