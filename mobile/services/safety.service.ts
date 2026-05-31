import { apiClient } from "./api-client";

export const safetyService = {
  triggerSos: (payload: { lat?: number; lng?: number; trigger_type?: string }) =>
    apiClient.post("/api/sos", payload),
  emergencyNumbers: () => apiClient.get("/api/sos/emergency-numbers"),
  mapLayers: (lat: number, lng: number) => apiClient.get("/api/maps/layers", { params: { lat, lng } }),
};
