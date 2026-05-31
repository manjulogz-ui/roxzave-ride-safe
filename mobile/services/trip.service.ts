import { apiClient } from "./api-client";

export const tripService = {
  list: () => apiClient.get("/api/trips"),
  drivingScore: () => apiClient.get("/api/trips/driving-score"),
};
