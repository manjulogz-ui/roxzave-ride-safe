import { apiClient } from "./api-client";

export const notificationService = {
  list: (category?: string) =>
    apiClient.get("/api/notifications", { params: category ? { category } : {} }),
  markRead: (id: string) => apiClient.patch(`/api/notifications/${id}/read`),
  markAllRead: () => apiClient.post("/api/notifications/read-all"),
};
