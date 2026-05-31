import { apiClient } from "./api-client";

export const profileService = {
  get: () => apiClient.get("/api/user/profile"),
  update: (data: Record<string, unknown>) => apiClient.patch("/api/user/profile", data),
  emergencyContacts: () => apiClient.get("/api/user/emergency-contacts"),
  addContact: (data: { name: string; phone: string; is_guardian?: boolean }) =>
    apiClient.post("/api/user/emergency-contacts", data),
};
