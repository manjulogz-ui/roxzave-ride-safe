import { apiClient } from "./api-client";

export const mapService = {
  petrolStations: (lat: number, lng: number, radius_km = 15) =>
    apiClient.get("/api/maps/nearby/petrol-stations", { params: { lat, lng, radius_km } }),
  hospitals: (lat: number, lng: number) =>
    apiClient.get("/api/maps/nearby/hospitals", { params: { lat, lng } }),
  fuelEstimate: (trip_distance_km: number, mileage_kmpl: number, fuel_price_per_liter: number) =>
    apiClient.post("/api/maps/fuel-cost-estimate", { trip_distance_km, mileage_kmpl, fuel_price_per_liter }),
};
