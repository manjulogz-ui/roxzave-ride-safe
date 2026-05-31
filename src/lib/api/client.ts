import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { authStore } from "@/lib/auth/auth-store";

/** In dev, use Vite proxy (same origin). In production/mobile, set VITE_API_URL. */
export const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "" : "http://127.0.0.1:8000");

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = authStore.refreshTokens().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken && original.headers) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      authStore.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK" || !error.response) {
      return "Cannot reach Roxzave API. Start the backend: cd backend && python -m uvicorn app.main:app --port 8000";
    }
    const data = error.response?.data as { detail?: string | { msg: string }[] } | undefined;
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) return data.detail[0]?.msg ?? error.message;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export async function checkApiHealth(): Promise<{
  ok: boolean;
  status?: string;
  database?: string;
  checks?: { api?: boolean; database?: boolean; tables?: boolean; seed_user?: boolean };
}> {
  try {
    const { data } = await api.get<{
      status: string;
      database: string;
      checks?: { api?: boolean; database?: boolean; tables?: boolean; seed_user?: boolean };
    }>("/health", { timeout: 5000 });
    return {
      ok: data.status === "healthy",
      status: data.status,
      database: data.database,
      checks: data.checks,
    };
  } catch {
    return { ok: false };
  }
}
