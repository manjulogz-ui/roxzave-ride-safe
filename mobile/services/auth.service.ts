/**
 * React Native / Expo — mirror of PWA auth-store using same FastAPI endpoints.
 */
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

const client = axios.create({ baseURL: API_URL, timeout: 30000 });

export const authService = {
  async login(email: string, password: string) {
    const { data } = await client.post("/api/auth/login", { email, password, remember_me: true });
    return data;
  },
  async signup(payload: {
    full_name: string;
    email: string;
    mobile: string;
    password: string;
    confirm_password: string;
  }) {
    const { data } = await client.post("/api/auth/signup", payload);
    return data;
  },
  async guest() {
    const { data } = await client.post("/api/auth/guest");
    return data;
  },
  async refresh(refreshToken: string) {
    const { data } = await client.post("/api/auth/refresh", { refresh_token: refreshToken });
    return data;
  },
};
