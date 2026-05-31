import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAuth } from "@/lib/auth/route-guard";
import { api, getErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/profile/edit")({
  beforeLoad: requireAuth,
  component: EditProfilePage,
});

function EditProfilePage() {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/api/user/profile")).data,
  });
  const [form, setForm] = useState({ full_name: "", mobile: "", address: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm({ full_name: data.full_name ?? "", mobile: data.mobile ?? "", address: data.address ?? "" });
  }, [data]);

  const save = useMutation({
    mutationFn: () => api.patch("/api/user/profile", form),
    onSuccess: () => navigate({ to: "/profile" }),
    onError: (e) => setError(getErrorMessage(e)),
  });

  return (
    <MobileShell>
      <PageHeader title="Edit Profile" backTo="/profile" />
      <form
        className="glass mt-6 space-y-4 rounded-2xl p-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        {error && <p className="text-sm text-emergency">{error}</p>}
        {(["full_name", "mobile", "address"] as const).map((f) => (
          <div key={f}>
            <Label>{f.replace(/_/g, " ")}</Label>
            <Input value={form[f]} onChange={(e) => setForm((x) => ({ ...x, [f]: e.target.value }))} className="mt-1" />
          </div>
        ))}
        <Button type="submit" className="w-full" disabled={save.isPending}>
          Save
        </Button>
      </form>
    </MobileShell>
  );
}
