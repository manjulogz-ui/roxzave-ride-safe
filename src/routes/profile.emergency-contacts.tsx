import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAuth } from "@/lib/auth/route-guard";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/profile/emergency-contacts")({
  beforeLoad: requireAuth,
  component: EmergencyContactsPage,
});

type Contact = { id: string; name: string; phone: string; is_guardian: boolean };

function EmergencyContactsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { data } = useQuery({
    queryKey: ["emergency-contacts"],
    queryFn: async () => (await api.get<Contact[]>("/api/user/emergency-contacts")).data,
  });

  const add = useMutation({
    mutationFn: () => api.post("/api/user/emergency-contacts", { name, phone, is_guardian: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["emergency-contacts"] });
      setName("");
      setPhone("");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/api/user/emergency-contacts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emergency-contacts"] }),
  });

  return (
    <MobileShell>
      <PageHeader title="Emergency Contacts" backTo="/profile" />
      <form
        className="glass mt-4 space-y-3 rounded-2xl p-4"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <Button type="submit" className="w-full" disabled={add.isPending}>
          Add contact
        </Button>
      </form>
      <div className="mt-4 space-y-2">
        {(data ?? []).map((c) => (
          <div key={c.id} className="glass flex items-center justify-between rounded-2xl px-4 py-3">
            <div>
              <p className="font-bold">{c.name}</p>
              <p className="text-sm text-muted-foreground">{c.phone}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => remove.mutate(c.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}
