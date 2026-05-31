import { redirect } from "@tanstack/react-router";
import { authStore } from "./auth-store";

export function requireAuth() {
  if (!authStore.isAuthenticated()) {
    throw redirect({ to: "/login", search: { redirect: typeof window !== "undefined" ? window.location.pathname : "/" } });
  }
}

export function redirectIfAuthenticated() {
  if (authStore.isAuthenticated()) {
    throw redirect({ to: "/" });
  }
}
