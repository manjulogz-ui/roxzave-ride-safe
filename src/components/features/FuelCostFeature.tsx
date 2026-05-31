import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import type { FeatureModule } from "@/lib/features/registry";

export function FuelCostFeature({ feature }: { feature: FeatureModule }) {
  const [distance, setDistance] = useState(100);
  const [mileage, setMileage] = useState(18);
  const [price, setPrice] = useState(107.95);

  const estimate = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/maps/fuel-cost-estimate", {
        trip_distance_km: distance,
        mileage_kmpl: mileage,
        fuel_price_per_liter: price,
      });
      return data as { estimated_cost_inr: number; fuel_liters: number };
    },
  });

  return (
    <MobileShell>
      <PageHeader title={feature.title} subtitle={feature.subtitle} backTo="/" />
      <div className="glass mt-4 space-y-3 rounded-2xl p-4">
        <label className="block text-[11px] font-bold uppercase text-muted-foreground">
          Distance (km)
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="mt-1 w-full rounded-lg bg-secondary/50 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-[11px] font-bold uppercase text-muted-foreground">
          Mileage (km/L)
          <input
            type="number"
            value={mileage}
            onChange={(e) => setMileage(Number(e.target.value))}
            className="mt-1 w-full rounded-lg bg-secondary/50 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-[11px] font-bold uppercase text-muted-foreground">
          Price per liter (₹)
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-1 w-full rounded-lg bg-secondary/50 px-3 py-2 text-sm"
          />
        </label>
        <Button className="w-full" onClick={() => estimate.mutate()} disabled={estimate.isPending}>
          Calculate fuel cost
        </Button>
        {estimate.data && (
          <div className="rounded-xl bg-electric/10 p-3 text-center">
            <p className="text-2xl font-black text-electric">₹{estimate.data.estimated_cost_inr}</p>
            <p className="text-[11px] text-muted-foreground">{estimate.data.fuel_liters} liters estimated</p>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
