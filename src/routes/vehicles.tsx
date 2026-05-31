import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppPage } from "@/components/layout/AppPage";
import { requireAuth } from "@/lib/auth/route-guard";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageEmpty, PageLoader } from "@/components/system/PageStates";

type Vehicle = {
  id: string;
  make: string | null;
  model: string | null;
  registration_number: string | null;
  fuel_type: string | null;
};

export const Route = createFileRoute("/vehicles")({
  beforeLoad: requireAuth,
  component: VehiclesPage,
});

function VehiclesPage() {
  const qc = useQueryClient();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [reg, setReg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => (await api.get("/api/user/vehicles")).data as Vehicle[],
  });

  const add = useMutation({
    mutationFn: () =>
      api.post("/api/user/vehicles", {
        make,
        model,
        registration_number: reg || undefined,
        fuel_type: "petrol",
        mileage_kmpl: 15,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      setMake("");
      setModel("");
      setReg("");
    },
  });

  const update = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/user/vehicles/${id}`, {
        make,
        model,
        registration_number: reg || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      setEditingId(null);
      setMake("");
      setModel("");
      setReg("");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/api/user/vehicles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });

  if (isLoading) return <AppPage title="Vehicles" backTo="/profile"><PageLoader /></AppPage>;

  return (
    <AppPage title="Vehicle Management" subtitle="Add, edit, remove" backTo="/profile">
      <form
        className="glass space-y-2 rounded-2xl p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (editingId) update.mutate(editingId);
          else add.mutate();
        }}
      >
        <Input placeholder="Make" value={make} onChange={(e) => setMake(e.target.value)} required />
        <Input placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} required />
        <Input placeholder="Registration" value={reg} onChange={(e) => setReg(e.target.value)} />
        <Button type="submit" className="w-full" disabled={add.isPending || update.isPending}>
          {editingId ? "Save changes" : "Add vehicle"}
        </Button>
        {editingId && (
          <Button type="button" variant="ghost" className="w-full" onClick={() => setEditingId(null)}>
            Cancel edit
          </Button>
        )}
      </form>

      <div className="mt-4 space-y-2">
        {(data ?? []).length === 0 ? (
          <PageEmpty title="No vehicles" hint="Add your first vehicle above" />
        ) : (
          (data ?? []).map((v) => (
            <div key={v.id} className="glass rounded-2xl p-4">
              <p className="font-bold">
                {v.make} {v.model}
              </p>
              <p className="text-sm text-muted-foreground">{v.registration_number ?? "No registration"}</p>
              <p className="text-[11px] text-muted-foreground">{v.fuel_type ?? "petrol"}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(v.id);
                    setMake(v.make ?? "");
                    setModel(v.model ?? "");
                    setReg(v.registration_number ?? "");
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove.mutate(v.id)} disabled={remove.isPending}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </AppPage>
  );
}
