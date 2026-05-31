import { api } from "@/lib/api/client";

const ACCESS_KEY = "roxzave_access_token";
const REFRESH_KEY = "roxzave_refresh_token";
const USER_KEY = "roxzave_user";

export type AuthUser = {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  isGuest: boolean;
};

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  is_guest?: boolean;
};

function persistSession(data: TokenResponse) {
  localStorage.setItem(ACCESS_KEY, data.access_token);
  localStorage.setItem(REFRESH_KEY, data.refresh_token);
  const user: AuthUser = {
    userId: data.user_id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    isGuest: data.is_guest ?? false,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

async function postAuth<T>(path: string, body?: unknown): Promise<T> {
  // Try PRD path /auth/* then /api/auth/*
  try {
    const { data } = await api.post<T>(path, body);
    return data;
  } catch (err) {
    if (path.startsWith("/auth/")) {
      const { data } = await api.post<T>(`/api${path}`, body);
      return data;
    }
    throw err;
  }
}

export const authStore = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },

  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async login(email: string, password: string, rememberMe = false) {
    const data = await postAuth<TokenResponse>("/auth/login", {
      email,
      password,
      remember_me: rememberMe,
    });
    return persistSession(data);
  },

  async signup(payload: {
    full_name: string;
    email: string;
    mobile: string;
    password: string;
    confirm_password: string;
  }) {
    const data = await postAuth<TokenResponse>("/auth/signup", payload);
    return persistSession(data);
  },

  async guest() {
    const data = await postAuth<TokenResponse>("/auth/guest");
    return persistSession({
      ...data,
      email: data.email ?? "guest@roxzave.com",
      full_name: data.full_name ?? "Guest User",
      role: data.role ?? "user",
    });
  },

  async refreshTokens(): Promise<string | null> {
    const refresh = this.getRefreshToken();
    if (!refresh) return null;
    try {
      const data = await postAuth<TokenResponse>("/auth/refresh", { refresh_token: refresh });
      persistSession(data);
      return data.access_token;
    } catch {
      this.clear();
      return null;
    }
  },

  logout() {
    this.clear();
  },
};
